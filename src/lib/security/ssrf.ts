import dns from 'dns/promises'
import net from 'net'

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.google',
  'instance-data',
])

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
    [ipv4ToInt('192.168.0.0'), ipv4ToInt('192.168.255.255')],
    [ipv4ToInt('198.18.0.0'), ipv4ToInt('198.19.255.255')],
    [ipv4ToInt('224.0.0.0'), ipv4ToInt('255.255.255.255')],
  ]
  return ranges.some(([start, end]) => n >= start && n <= end)
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  return (
    lower === '::1' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80') ||
    lower === '::' ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:192.168.') ||
    /^::ffff:(172\.(1[6-9]|2\d|3[0-1])\.)/.test(lower)
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

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { ok: false, reason: 'Blocked hostname' }
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

export async function safeFetch(
  rawUrl: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number; maxBytes?: number } = {},
): Promise<{ ok: true; response: Response; text: string } | { ok: false; reason: string }> {
  const safety = await assertSafeUrl(rawUrl)
  if (!safety.ok) return safety

  const timeoutMs = opts.timeoutMs ?? 12_000
  const maxBytes = opts.maxBytes ?? 1_500_000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(safety.url.toString(), {
      ...init,
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WordOfMouthBot/0.1 (+https://github.com/jxav22/word-of-mouth)',
        Accept: 'application/rss+xml, application/atom+xml, application/json, text/html, */*',
        ...(init.headers || {}),
      },
    })

    // Follow one hop only, re-validate each target
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const loc = response.headers.get('location')
      if (!loc) return { ok: false, reason: 'Redirect without location' }
      const next = new URL(loc, safety.url).toString()
      const nextSafety = await assertSafeUrl(next)
      if (!nextSafety.ok) return nextSafety
      const redirected = await fetch(nextSafety.url.toString(), {
        ...init,
        redirect: 'error',
        signal: controller.signal,
        headers: {
          'User-Agent': 'WordOfMouthBot/0.1 (+https://github.com/jxav22/word-of-mouth)',
          Accept: 'application/rss+xml, application/atom+xml, application/json, text/html, */*',
          ...(init.headers || {}),
        },
      })
      const buf = Buffer.from(await redirected.arrayBuffer())
      if (buf.byteLength > maxBytes) return { ok: false, reason: 'Response too large' }
      return { ok: true, response: redirected, text: buf.toString('utf8') }
    }

    const buf = Buffer.from(await response.arrayBuffer())
    if (buf.byteLength > maxBytes) return { ok: false, reason: 'Response too large' }
    return { ok: true, response, text: buf.toString('utf8') }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return { ok: false, reason: message }
  } finally {
    clearTimeout(timer)
  }
}
