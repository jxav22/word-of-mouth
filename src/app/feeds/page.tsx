import { FeedList } from '@/components/FeedList'
import { bootstrap } from '@/lib/bootstrap'
import { listFeeds } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export default async function FeedsPage() {
  await bootstrap()
  const feeds = listFeeds()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Feeds</h1>
        <p className="text-[var(--ink-soft)] mt-1">All demo and live listening posts.</p>
      </div>
      <FeedList feeds={feeds} />
    </div>
  )
}
