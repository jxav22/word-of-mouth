import dns from 'dns/promises'
import net from 'net'

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.google',
  'instance-data',
  'metadata',
  'kubernetes',
  'kubernetes.default',
  'kubernetes.default.svc',
])

const BLOCKED_SUFFIXES = ['.local', '.internal', '.localhost', '.lan', '.home', '.corp', '.intranet']

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

function isPrivateIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip)
  const ranges: Array<[number, number]> = [
    [ipv4ToInt('0.0.0.0'), ipv4ToInt('0.255.255.255')],
    [ipv4ToInt('10.0.0.0'), ipv4ToInt('10.255.255.255')],
    [ipv4ToInt('100.64.0.0'), ipv4ToInt('100.127.255.255')],
    [ipv4ToInt('127.0.0.0'), ipv4ToInt('127.255.255.255')],
    [ipv4ToInt('169.254.0.0'), ipv4ToInt('169.254.255.255')],
    [ipv4ToInt('172.16.0.0'), ipv4ToInt('172.31.255.255')],
    [ipv4ToInt('192.0.0.0'), ipv4ToInt('192.0.0.255')],
    [ipv4ToInt('192.0.2.0'), ipv4ToInt('192.0.2.255')], // TEST-NET-1
    [ipv4ToInt('192.168.0.0'), ipv4ToInt('192.168.255.255')],
    [ipv4ToInt('198.18.0.0'), ipv4ToInt('198.19.255.255')],
    [ipv4ToInt('198.51.100.0'), ipv4ToInt('198.51.100.255')], // TEST-NET-2
    [ipv4ToInt('203.0.113.0'), ipv4ToInt('203.0.113.255')], // TEST-NET-3
    [ipv4ToInt('224.0.0.0'), ipv4ToInt('255.255.255.255')],
  ]
  return ranges.some(([start, end]) => n >= start && n <= end)
}

function extractIpv4Mapped(ip: string): string | null {
  const lower = ip.toLowerCase()
  const m = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/)
  if (m) return m[1]
  // ::ffff:aabb:ccdd hex form
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (hex) {
    const hi = parseInt(hex[1], 16)
    const lo = parseInt(hex[2], 16)
    return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`
  }
  return null
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  const mapped = extractIpv4Mapped(lower)
  if (mapped) return isPrivateIpv4(mapped)

  return (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80') ||
    lower.startsWith('ff') // multicast
  )
}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIpv4(ip)
  if (net.isIPv6(ip)) return isPrivateIpv6(ip)
  return true
}

export type SafeUrlResult =
  | { ok: true; url: URL; resolvedIps: string[] }
  | { ok: false; reason: string }

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (BLOCKED_HOSTNAMES.has(host)) return true
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) return true
  return false
}

function decodeDecimalIpv4(host: string): string | null {
  if (!/^\d+$/.test(host)) return null
  const n = Number(host)
  if (!Number.isFinite(n) || n < 0 || n > 0xffffffff) return null
  const a = (n >>> 24) & 255
  const b = (n >>> 16) & 255
  const c = (n >>> 8) & 255
  const d = n & 255
  return `${a}.${b}.${c}.${d}`
}

export async function assertSafeUrl(raw: string): Promise<SafeUrlResult> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { ok: false, reason: 'Invalid URL' }
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { ok: false, reason: 'Only http/https allowed' }
  }

  if (url.username || url.password) {
    return { ok: false, reason: 'Credentials in URL not allowed' }
  }

  // Block non-default ports commonly used for internal services (optional soft block)
  const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80
  if (![80, 443, 8080, 8443].includes(port)) {
    // Still allow if public IP resolves; but block well-known DB/admin ports
    if ([22, 25, 3306, 5432, 6379, 11211, 27017, 9200].includes(port)) {
      return { ok: false, reason: 'Blocked port' }
    }
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (isBlockedHostname(hostname)) {
    return { ok: false, reason: 'Blocked hostname' }
  }

  const decimalIp = decodeDecimalIpv4(hostname)
  if (decimalIp) {
    if (isBlockedIp(decimalIp)) return { ok: false, reason: 'Private or link-local IP blocked' }
    return { ok: false, reason: 'Numeric-host URLs not allowed' }
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) return { ok: false, reason: 'Private or link-local IP blocked' }
    return { ok: true, url, resolvedIps: [hostname] }
  }

  let resolved: string[] = []
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true })
    resolved = records.map((r) => r.address)
  } catch {
    return { ok: false, reason: 'DNS resolution failed' }
  }

  if (resolved.length === 0) return { ok: false, reason: 'No DNS records' }
  if (resolved.some(isBlockedIp)) {
    return { ok: false, reason: 'Resolved to private or link-local IP' }
  }

  return { ok: true, url, resolvedIps: resolved }
}

const MAX_REDIRECTS = 3

async function readLimited(
  response: Response,
  maxBytes: number,
): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  const reader = response.body?.getReader()
  if (!reader) {
    const buf = Buffer.from(await response.arrayBuffer())
    if (buf.byteLength > maxBytes) return { ok: false, reason: 'Response too large' }
    return { ok: true, text: buf.toString('utf8') }
  }

  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      total += value.byteLength
      if (total > maxBytes) {
        try {
          await reader.cancel()
        } catch {
          /* ignore */
        }
        return { ok: false, reason: 'Response too large' }
      }
      chunks.push(value)
    }
  }
  return { ok: true, text: Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8') }
}

export async function safeFetch(
  rawUrl: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number; maxBytes?: number; maxRedirects?: number } = {},
): Promise<{ ok: true; response: Response; text: string } | { ok: false; reason: string }> {
  const timeoutMs = opts.timeoutMs ?? 12_000
  const maxBytes = opts.maxBytes ?? 1_500_000
  const maxRedirects = opts.maxRedirects ?? MAX_REDIRECTS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let current = rawUrl
    for (let hop = 0; hop <= maxRedirects; hop++) {
      const safety = await assertSafeUrl(current)
      if (!safety.ok) return safety

      // DNS-rebinding mitigation: re-resolve immediately before fetch
      const recheck = await assertSafeUrl(safety.url.toString())
      if (!recheck.ok) return recheck

      const response = await fetch(recheck.url.toString(), {
        ...init,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'WordOfMouthBot/0.1 (+https://github.com/jxav22/word-of-mouth)',
          Accept: 'application/rss+xml, application/atom+xml, application/json, text/html, */*',
          ...(init.headers || {}),
        },
      })

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const loc = response.headers.get('location')
        if (!loc) return { ok: false, reason: 'Redirect without location' }
        if (hop === maxRedirects) return { ok: false, reason: 'Too many redirects' }
        current = new URL(loc, recheck.url).toString()
        continue
      }

      if (response.status >= 400) {
        return { ok: false, reason: `HTTP ${response.status}` }
      }

      const body = await readLimited(response, maxBytes)
      if (!body.ok) return body
      return { ok: true, response, text: body.text }
    }
    return { ok: false, reason: 'Too many redirects' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return { ok: false, reason: message }
  } finally {
    clearTimeout(timer)
  }
}
