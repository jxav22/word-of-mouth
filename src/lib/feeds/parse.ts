export type FeedIntent =
  | 'employment'
  | 'events'
  | 'industry'
  | 'technology'
  | 'local'
  | 'general'

export type ParsedFeedQuery = {
  title: string
  keywords: string[]
  topics: string[]
  excludeKeywords: string[]
  intent: FeedIntent
  relevanceThreshold: number
  /** 0..1 heuristic of how specific/usable the NL config is */
  configQuality: number
  suggestedSources: Array<{
    kind: 'rss' | 'hn' | 'reddit' | 'api' | 'demo'
    url: string
    title: string
  }>
}

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'from', 'with',
  'about', 'me', 'my', 'i', 'want', 'need', 'looking', 'find', 'show', 'get', 'latest',
  'news', 'updates', 'feed', 'stories', 'please', 'that', 'this', 'those', 'these',
  'into', 'over', 'under', 'any', 'some', 'all', 'just', 'also', 'more', 'most',
  'what', 'when', 'where', 'which', 'who', 'how', 'are', 'is', 'be', 'keep',
  'track', 'following', 'follow', 'things', 'stuff', 'related', 'around', 'near',
])

const SHORT_KEEP = new Set(['ai', 'ml', 'nz', 'hn', 'ui', 'ux', 'qa', 'sre', 'cve'])

const PHRASE_BANK = [
  'new zealand',
  'machine learning',
  'software engineer',
  'software engineering',
  'open source',
  'remote work',
  'venture capital',
  'product management',
  'developer tools',
  'developer tooling',
  'artificial intelligence',
  'large language',
  'language model',
  'who is hiring',
  'series a',
  'series b',
  'y combinator',
  'silicon valley',
]

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'feed'
}

export function makeSlug(title: string, salt = ''): string {
  const base = slugify(title)
  return salt ? `${base}-${salt}` : base
}

function titleFromQuery(query: string): string {
  const cleaned = query.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= 60) return cleaned.replace(/^./, (c) => c.toUpperCase())
  return cleaned.slice(0, 57).trim() + '…'
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** Pull quoted phrases and "not X" / "-X" exclusions from NL. */
function extractQuotedAndExclusions(query: string): {
  quotes: string[]
  excludes: string[]
  cleaned: string
} {
  const quotes: string[] = []
  const excludes: string[] = []
  let cleaned = query

  cleaned = cleaned.replace(/"([^"]{2,80})"/g, (_, phrase: string) => {
    quotes.push(phrase.toLowerCase().trim())
    return ' '
  })

  cleaned = cleaned.replace(
    /\b(?:not|without|exclude|excluding|ignore)\s+([a-z0-9+#.\-]{2,40}(?:\s+[a-z0-9+#.\-]{2,40})?)/gi,
    (_, term: string) => {
      excludes.push(term.toLowerCase().trim())
      return ' '
    },
  )

  cleaned = cleaned.replace(/(?:^|\s)-([a-z0-9+#.]{2,40})/gi, (_, term: string) => {
    excludes.push(term.toLowerCase())
    return ' '
  })

  return { quotes, excludes, cleaned }
}

function extractBigrams(tokens: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i]
    const b = tokens[i + 1]
    if (STOP.has(a) || STOP.has(b)) continue
    if ((a.length < 3 && !SHORT_KEEP.has(a)) || (b.length < 3 && !SHORT_KEEP.has(b))) continue
    out.push(`${a} ${b}`)
  }
  return out
}

function extractKeywords(query: string): { keywords: string[]; excludes: string[] } {
  const { quotes, excludes, cleaned } = extractQuotedAndExclusions(query)
  const tokens = tokenize(cleaned).filter(
    (t) => !STOP.has(t) && (t.length > 2 || SHORT_KEEP.has(t)),
  )
  const phrases: string[] = [...quotes]
  const q = cleaned.toLowerCase()
  for (const p of PHRASE_BANK) if (q.includes(p)) phrases.push(p)
  phrases.push(...extractBigrams(tokens).slice(0, 4))

  const keywords = [...new Set([...phrases, ...tokens])]
    .filter((k) => !excludes.some((e) => k === e || k.includes(e)))
    .slice(0, 16)

  return { keywords, excludes: [...new Set(excludes)].slice(0, 8) }
}

function inferTopics(keywords: string[], query: string): string[] {
  const q = query.toLowerCase()
  const topics: string[] = []
  const rules: Array<[RegExp, string]> = [
    [/job|employ|hiring|career|role|recruit|who is hiring/, 'employment'],
    [/ai|llm|model|ml|machine learning|gpt|anthropic|openai/, 'ai'],
    [/startup|saas|founder|venture|funding|series [abc]/, 'startups'],
    [/auckland|wellington|christchurch|nz|new zealand/, 'nz'],
    [/event|meetup|conference|hackathon|festival/, 'events'],
    [/security|cve|breach|vuln|ransomware/, 'security'],
    [/devops|kubernetes|cloud|infra|sre|observability/, 'infrastructure'],
    [/frontend|react|next\.?js|ui|css|design system/, 'frontend'],
    [/backend|api|database|postgres|sqlite/, 'backend'],
    [/remote|distributed team|work from home/, 'remote'],
    [/crypto|bitcoin|ethereum|web3/, 'crypto'],
    [/climate|energy|sustainab/, 'climate'],
  ]
  for (const [re, topic] of rules) if (re.test(q)) topics.push(topic)
  if (topics.length === 0) topics.push('general')
  if (keywords.some((k) => k.includes('remote'))) topics.push('remote')
  return [...new Set(topics)].slice(0, 8)
}

function inferIntent(topics: string[], query: string): FeedIntent {
  const q = query.toLowerCase()
  if (topics.includes('employment') || /job|hiring|career/.test(q)) return 'employment'
  if (topics.includes('events') || /meetup|conference|event/.test(q)) return 'events'
  if (topics.includes('nz') && /local|auckland|wellington|christchurch/.test(q)) return 'local'
  if (topics.includes('startups') || /industry|competitive|market/.test(q)) return 'industry'
  if (topics.includes('ai') || topics.includes('infrastructure') || /tech|software|dev/.test(q)) {
    return 'technology'
  }
  return 'general'
}

/**
 * More specific queries get a slightly higher floor so noise drops out;
 * broad queries stay permissive so the feed still fills.
 */
export function computeRelevanceThreshold(
  keywords: string[],
  topics: string[],
  intent: FeedIntent,
): number {
  const specificity = Math.min(1, keywords.length / 10 + (topics.includes('general') ? 0 : 0.15))
  let base = 0.12 + specificity * 0.12
  if (intent === 'employment') base += 0.04
  if (intent === 'events') base += 0.03
  if (intent === 'general' && keywords.length < 3) base = 0.1
  return Math.round(Math.min(0.45, Math.max(0.08, base)) * 1000) / 1000
}

export function scoreConfigQuality(parsed: {
  keywords: string[]
  topics: string[]
  excludeKeywords: string[]
  intent: FeedIntent
  suggestedSources: unknown[]
}): number {
  let q = 0.25
  q += Math.min(0.3, parsed.keywords.length * 0.04)
  q += parsed.topics.includes('general') ? 0 : 0.15
  q += parsed.intent !== 'general' ? 0.1 : 0
  q += Math.min(0.1, parsed.excludeKeywords.length * 0.04)
  q += Math.min(0.15, Math.max(0, parsed.suggestedSources.length - 1) * 0.05)
  const hasPhrase = parsed.keywords.some((k) => k.includes(' '))
  if (hasPhrase) q += 0.08
  return Math.round(Math.min(1, q) * 1000) / 1000
}

function discoverSources(
  keywords: string[],
  topics: string[],
  query: string,
  intent: FeedIntent,
): ParsedFeedQuery['suggestedSources'] {
  const sources: ParsedFeedQuery['suggestedSources'] = []
  const q = query.toLowerCase()

  const hnQuery = encodeURIComponent(keywords.slice(0, 4).join(' ') || 'technology')
  sources.push({
    kind: 'hn',
    url: `https://hn.algolia.com/api/v1/search_by_date?query=${hnQuery}&tags=story&hitsPerPage=30`,
    title: 'Hacker News',
  })

  if (topics.includes('ai') || intent === 'technology' || /ai|llm|ml/.test(q)) {
    sources.push({
      kind: 'rss',
      url: 'https://news.ycombinator.com/rss',
      title: 'HN RSS',
    })
    sources.push({
      kind: 'rss',
      url: 'https://www.technologyreview.com/feed/',
      title: 'MIT Technology Review',
    })
  }

  if (intent === 'employment' || topics.includes('employment') || /job|hiring|career/.test(q)) {
    sources.push({
      kind: 'hn',
      url: `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent('hiring ' + keywords.slice(0, 3).join(' '))}&tags=story&hitsPerPage=25`,
      title: 'HN Hiring',
    })
    sources.push({
      kind: 'rss',
      url: 'https://news.ycombinator.com/rss',
      title: 'HN Who is Hiring signal',
    })
  }

  if (intent === 'industry' || topics.includes('startups') || /startup|saas|funding/.test(q)) {
    sources.push({
      kind: 'rss',
      url: 'https://techcrunch.com/category/startups/feed/',
      title: 'TechCrunch Startups',
    })
    sources.push({
      kind: 'rss',
      url: 'https://www.theverge.com/rss/index.xml',
      title: 'The Verge',
    })
  }

  if (
    intent === 'local' ||
    intent === 'events' ||
    topics.includes('nz') ||
    topics.includes('events') ||
    /auckland|new zealand|nz/.test(q)
  ) {
    sources.push({
      kind: 'rss',
      url: 'https://www.rnz.co.nz/rss/national.xml',
      title: 'RNZ National',
    })
    sources.push({
      kind: 'rss',
      url: 'https://www.stuff.co.nz/rss',
      title: 'Stuff NZ',
    })
  }

  if (topics.includes('security')) {
    sources.push({
      kind: 'rss',
      url: 'https://krebsonsecurity.com/feed/',
      title: 'Krebs on Security',
    })
  }

  if (sources.length < 3) {
    sources.push({
      kind: 'rss',
      url: 'https://www.theverge.com/rss/index.xml',
      title: 'The Verge',
    })
  }

  const seen = new Set<string>()
  return sources.filter((s) => {
    if (seen.has(s.url)) return false
    seen.add(s.url)
    return true
  })
}

export function parseFeedQuery(query: string, title?: string): ParsedFeedQuery {
  const q = query.trim()
  if (!q) throw new Error('Query is required')
  const { keywords, excludes } = extractKeywords(q)
  const topics = inferTopics(keywords, q)
  const intent = inferIntent(topics, q)
  const suggestedSources = discoverSources(keywords, topics, q, intent)
  const relevanceThreshold = computeRelevanceThreshold(keywords, topics, intent)
  const parsed = {
    title: (title?.trim() || titleFromQuery(q)).slice(0, 120),
    keywords,
    topics,
    excludeKeywords: excludes,
    intent,
    relevanceThreshold,
    suggestedSources,
  }
  return {
    ...parsed,
    configQuality: scoreConfigQuality(parsed),
  }
}
