import Link from 'next/link'
import { FeedList } from '@/components/FeedList'
import { bootstrap } from '@/lib/bootstrap'
import { listFeeds } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export default async function FeedsPage() {
  await bootstrap()
  const feeds = listFeeds()
  const demo = feeds.filter((f) => f.isDemo).length
  const live = feeds.filter((f) => !f.isDemo).length

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label">Browse</p>
          <h1 className="font-display mt-1 text-4xl text-[var(--ink)]">Feeds</h1>
          <p className="mt-1 text-[var(--ink-soft)]">
            All demo and live listening posts · {demo} demo · {live} live
          </p>
        </div>
        <Link href="/#create" className="btn-ink">
          New feed
        </Link>
      </div>
      <FeedList feeds={feeds} />
    </div>
  )
}
