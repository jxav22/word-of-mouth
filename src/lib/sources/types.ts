import type { RawArticle, SourceKind } from '../types'

export type SourceAdapterContext = {
  sourceId: string
  feedId: string
  kind: SourceKind
  url: string
  title: string
  keywords?: string[]
}

export type SourceAdapterResult = {
  articles: RawArticle[]
  error?: string
  meta?: {
    adapter: string
    fetchedBytes?: number
    itemCount?: number
  }
}

export type SourceAdapter = {
  /** Stable adapter id used in diagnostics */
  id: string
  /** Source kinds this adapter can handle */
  kinds: SourceKind[]
  /**
   * Optional URL matcher. When provided, registry prefers the first adapter
   * whose `match` returns true for the source URL among kind-compatible adapters.
   */
  match?: (url: string) => boolean
  fetch: (ctx: SourceAdapterContext) => Promise<SourceAdapterResult>
}
