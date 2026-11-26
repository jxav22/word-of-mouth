import type { RawArticle } from '../types'

export type DemoFeedSpec = {
  slug: string
  title: string
  query: string
  keywords: string[]
  topics: string[]
  articles: RawArticle[]
}

export const DEMO_FEEDS: DemoFeedSpec[] = [
  {
    slug: 'demo-employment',
    title: 'Employment opportunities',
    query: 'Software engineering jobs in New Zealand and remote roles',
    keywords: ['software', 'engineer', 'remote', 'new zealand', 'hiring', 'developer'],
    topics: ['employment', 'nz', 'remote'],
    articles: [
      {
        canonicalUrl: 'https://news.ycombinator.com/item?id=demo-emp-1',
        title: 'Ask HN: Who is hiring? (November 2026) — NZ & remote software roles',
        contentText:
          'A monthly hiring thread featuring remote TypeScript roles, Auckland product engineering openings, and New Zealand startups looking for full-stack developers. Several companies mention visa sponsorship and hybrid Wellington offices.',
        publishedAt: '2026-11-20T09:00:00.000Z',
        author: 'whoishiring',
        sourceTitle: 'Demo · HN Hiring',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/seek-nz-fullstack',
        title: 'Senior Full-Stack Engineer — Auckland (hybrid)',
        contentText:
          'Auckland product company seeks a senior full-stack engineer with React and Node experience. Competitive salary, four-day week option, and relocation support for candidates across New Zealand.',
        publishedAt: '2026-11-22T02:00:00.000Z',
        author: 'Demo Board',
        sourceTitle: 'Demo · NZ Jobs',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/remote-platform',
        title: 'Remote platform engineer roles trending across APAC',
        contentText:
          'Platform engineering openings emphasise Kubernetes, observability, and developer experience. Remote-first teams in APAC are competing for engineers who can own reliability and CI systems.',
        publishedAt: '2026-11-18T11:00:00.000Z',
        sourceTitle: 'Demo · Career Pulse',
        isDemo: true,
      },
    ],
  },
  {
    slug: 'demo-tech',
    title: 'Technology developments',
    query: 'Latest AI systems, infrastructure and developer tooling news',
    keywords: ['ai', 'systems', 'infrastructure', 'developer', 'tooling', 'llm'],
    topics: ['ai', 'infrastructure'],
    articles: [
      {
        canonicalUrl: 'https://example.com/demo/open-weights',
        title: 'Open-weight models push smaller teams into production AI',
        contentText:
          'New open-weight releases are narrowing the gap for teams that cannot rely on proprietary APIs alone. Engineers are combining local inference with retrieval pipelines to keep latency predictable.',
        publishedAt: '2026-11-24T08:00:00.000Z',
        sourceTitle: 'Demo · Systems Weekly',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/edge-runtime',
        title: 'Edge runtimes mature for long-lived agent workloads',
        contentText:
          'Runtime vendors are adding better streaming, longer timeouts, and sandbox isolation so agent workloads can survive flaky tool calls without dropping user sessions.',
        publishedAt: '2026-11-23T15:30:00.000Z',
        sourceTitle: 'Demo · Infra Digest',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/devtools',
        title: 'Developer tooling consolidates around typed eval harnesses',
        contentText:
          'Teams are standardising evaluation fixtures for prompt changes. Typed harnesses make regressions visible before agents ship brittle behaviour to production users.',
        publishedAt: '2026-11-21T10:00:00.000Z',
        sourceTitle: 'Demo · Tooling Watch',
        isDemo: true,
      },
    ],
  },
  {
    slug: 'demo-industry',
    title: 'Industry intelligence',
    query: 'Startup and SaaS industry intelligence, funding and competitive moves',
    keywords: ['startup', 'saas', 'funding', 'competitive', 'market'],
    topics: ['startups'],
    articles: [
      {
        canonicalUrl: 'https://example.com/demo/saas-pricing',
        title: 'SaaS pricing shifts toward usage with seat floors',
        contentText:
          'Operators are mixing usage meters with minimum seat floors to protect revenue while staying aligned to customer value. Finance teams want clearer unit economics from AI features.',
        publishedAt: '2026-11-19T13:00:00.000Z',
        sourceTitle: 'Demo · SaaS Signal',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/seed-climate',
        title: 'Seed climate favours narrow vertical AI wedges',
        contentText:
          'Investors are writing smaller cheques into vertical AI products with clear workflow replacement stories. Horizontal copilots face tougher diligence on retention.',
        publishedAt: '2026-11-17T07:45:00.000Z',
        sourceTitle: 'Demo · Venture Brief',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/competitor-packaging',
        title: 'Competitors package research agents as shared team memory',
        contentText:
          'Several SaaS vendors repositioned research agents as shared memory layers across sales and support. Packaging emphasises audit trails and source citations over raw generation.',
        publishedAt: '2026-11-25T01:20:00.000Z',
        sourceTitle: 'Demo · Competitive Wire',
        isDemo: true,
      },
    ],
  },
  {
    slug: 'demo-auckland',
    title: 'Local Auckland / NZ events',
    query: 'Local events meetups and tech gatherings in Auckland and New Zealand',
    keywords: ['auckland', 'new zealand', 'meetup', 'events', 'conference'],
    topics: ['events', 'nz'],
    articles: [
      {
        canonicalUrl: 'https://example.com/demo/akl-js',
        title: 'Auckland JS meetup: shipping resilient Next.js apps',
        contentText:
          'Auckland JS hosts a practical session on App Router caching, SQLite on the edge of practicality, and keeping demos honest when APIs flake. Doors open at GridAKL.',
        publishedAt: '2026-11-26T05:00:00.000Z',
        sourceTitle: 'Demo · Auckland Events',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/nz-opensource',
        title: 'NZ Open Source Summit calls for Auckland lightning talks',
        contentText:
          'Organisers invite lightning talks on civic tech, climate data, and developer education across New Zealand. Travel stipends available for speakers outside Auckland.',
        publishedAt: '2026-11-15T21:00:00.000Z',
        sourceTitle: 'Demo · NZ Community',
        isDemo: true,
      },
      {
        canonicalUrl: 'https://example.com/demo/wellington-product',
        title: 'Wellington product night features NZ-built agent tooling',
        contentText:
          'A product community night in Wellington showcases local teams building evaluation tooling and customer research assistants. Networking follows the demos.',
        publishedAt: '2026-11-14T08:30:00.000Z',
        sourceTitle: 'Demo · NZ Events',
        isDemo: true,
      },
    ],
  },
]
