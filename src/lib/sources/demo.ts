import type { SourceAdapter } from './types'

/** Demo sources are seeded in DB; adapter is a no-op success. */
export const demoAdapter: SourceAdapter = {
  id: 'demo',
  kinds: ['demo'],
  async fetch() {
    return {
      articles: [],
      meta: { adapter: 'demo', itemCount: 0 },
    }
  },
}
