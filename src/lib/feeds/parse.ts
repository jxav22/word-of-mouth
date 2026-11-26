export type ParsedFeedQuery = {
  title: string
  keywords: string[]
  topics: string[]
  relevanceThreshold: number
  suggestedSources: Array<{ kind: 'rss' | 'hn' | 'reddit' | 'api' | 'demo'; url: string; title: string }>
}

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'from', 'with',
  'about', 'me', 'my', 'i', 'want', 'need', 'looking', 'find', 'show', 'get', 'latest',
  'news', 'updates', 'feed', 'stories', 'please', 'that', 'this', 'those', 'these',
])

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

function extractKeywords(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t))

  const phrases: string[] = []
  const q = query.toLowerCase()
  const phraseBank = [
    'new zealand', 'auckland', 'software engineer', 'machine learning',
    'open source', 'remote work', 'venture capital', 'product management',
  ]
  for (const p of phraseBank) if (q.includes(p)) phrases.push(p)

  return [...new Set([...phrases, ...tokens])].slice(0, 12)
}

function inferTopics(keywords: string[], query: string): string[] {
  const q = query.toLowerCase()
  const topics: string[] = []
  const rules: Array<[RegExp, string]> = [
    [/job|employ|hiring|career|role|recruit/, 'employment'],
    [/ai|llm|model|ml|machine learning|gpt/, 'ai'],
    [/startup|saas|founder|venture|funding/, 'startups'],
    [/auckland|wellington|christchurch|nz|new zealand/, 'nz'],
    [/event|meetup|conference|hackathon/, 'events'],
    [/security|cve|breach|vuln/, 'security'],
    [/devops|kubernetes|cloud|infra/, 'infrastructure'],
    [/frontend|react|next\.?js|ui/, 'frontend'],
    [/backend|api|database|postgres/, 'backend'],
  ]
  for (const [re, topic] of rules) if (re.test(q)) topics.push(topic)
  if (topics.length === 0) topics.push('general')
  if (keywords.some((k) => k.includes('remote'))) topics.push('remote')
  return [...new Set(topics)].slice(0, 6)
}

function discoverSources(keywords: string[], topics: string[], query: string): ParsedFeedQuery['suggestedSources'] {
  const sources: ParsedFeedQuery['suggestedSources'] = []
  const q = query.toLowerCase()

  // Hacker News Algolia — public API
  const hnQuery = encodeURIComponent(keywords.slice(0, 4).join(' ') || 'technology')
  sources.push({
    kind: 'hn',
    url: `https://hn.algolia.com/api/v1/search_by_date?query=${hnQuery}&tags=story&hitsPerPage=30`,
    title: 'Hacker News',
  })

  // Curated public RSS by topic
  if (topics.includes('ai') || /ai|llm|ml/.test(q)) {
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

  if (topics.includes('employment') || /job|hiring|career/.test(q)) {
    sources.push({
      kind: 'rss',
      url: 'https://news.ycombinator.com/rss',
      title: 'HN Who is Hiring signal',
    })
    sources.push({
      kind: 'hn',
      url: `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent('hiring ' + keywords.slice(0, 3).join(' '))}&tags=story&hitsPerPage=25`,
      title: 'HN Hiring',
    })
  }

  if (topics.includes('startups') || /startup|saas|funding/.test(q)) {
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

  if (topics.includes('nz') || topics.includes('events') || /auckland|new zealand|nz/.test(q)) {
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

  // Reddit public RSS (no auth) — topic-mapped subs; adapter falls back to JSON
  if (topics.includes('ai') || /ai|llm|ml/.test(q)) {
    sources.push({
      kind: 'reddit',
      url: 'https://www.reddit.com/r/MachineLearning/.rss',
      title: 'r/MachineLearning',
    })
  }
  if (topics.includes('startups') || /startup|saas|funding/.test(q)) {
    sources.push({
      kind: 'reddit',
      url: 'https://www.reddit.com/r/startups/.rss',
      title: 'r/startups',
    })
  }
  if (topics.includes('employment') || /job|hiring|career/.test(q)) {
    sources.push({
      kind: 'reddit',
      url: 'https://www.reddit.com/r/cscareerquestions/.rss',
      title: 'r/cscareerquestions',
    })
  }

  // Public JSON APIs (extensible `api` kind)
  if (topics.includes('ai') || topics.includes('frontend') || topics.includes('backend') || /dev|engineer|programming/.test(q)) {
    const tag = topics.includes('ai') ? 'ai' : topics.includes('frontend') ? 'javascript' : 'programming'
    sources.push({
      kind: 'api',
      url: `https://dev.to/api/articles?per_page=20&tag=${encodeURIComponent(tag)}`,
      title: 'DEV Community',
    })
  }

  // Always include a general tech RSS fallback
  if (sources.length < 3) {
    sources.push({
      kind: 'rss',
      url: 'https://www.theverge.com/rss/index.xml',
      title: 'The Verge',
    })
  }

  // Deduplicate by URL
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
  const keywords = extractKeywords(q)
  const topics = inferTopics(keywords, q)
  return {
    title: (title?.trim() || titleFromQuery(q)).slice(0, 120),
    keywords,
    topics,
    relevanceThreshold: topics.includes('employment') ? 0.18 : 0.15,
    suggestedSources: discoverSources(keywords, topics, q),
  }
}
