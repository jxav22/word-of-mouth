/** Lightweight synonym / related-term expansion for ranking (no network). */

const GROUPS: string[][] = [
  ['ai', 'llm', 'ml', 'model', 'models', 'gpt', 'openai', 'anthropic'],
  ['job', 'jobs', 'hiring', 'career', 'careers', 'role', 'roles', 'recruit'],
  ['startup', 'startups', 'saas', 'founder', 'funding', 'venture'],
  ['kubernetes', 'k8s', 'devops', 'sre', 'infra', 'infrastructure', 'cloud'],
  ['observability', 'tracing', 'telemetry', 'opentelemetry', 'monitoring', 'metrics'],
  ['auckland', 'wellington', 'christchurch', 'nz', 'new zealand'],
  ['remote', 'distributed', 'wfh'],
  ['security', 'cve', 'vulnerability', 'vuln', 'breach'],
  ['frontend', 'react', 'nextjs', 'ui'],
  ['backend', 'api', 'database', 'postgres', 'sqlite'],
]

/**
 * Expand feed keywords with related terms from small synonym groups.
 * Keeps originals first; caps growth so scoring stays focused.
 */
export function expandKeywords(keywords: string[], limit = 24): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const k of keywords) {
    const kl = k.toLowerCase().trim()
    if (!kl || seen.has(kl)) continue
    seen.add(kl)
    out.push(kl)
  }
  for (const k of [...out]) {
    const parts = k.split(/\s+/)
    for (const group of GROUPS) {
      const hit = parts.some((p) => group.includes(p)) || group.includes(k)
      if (!hit) continue
      for (const g of group) {
        if (seen.has(g)) continue
        seen.add(g)
        out.push(g)
        if (out.length >= limit) return out
      }
    }
  }
  return out.slice(0, limit)
}
