import { BrandMark } from '@/components/BrandMark'
import { CreateFeedForm } from '@/components/CreateFeedForm'
import { FeedList } from '@/components/FeedList'
import { bootstrap } from '@/lib/bootstrap'
import { listFeeds } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  await bootstrap()
  const feeds = listFeeds()
  const demo = feeds.filter((f) => f.isDemo)
  const live = feeds.filter((f) => !f.isDemo)

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-5 animate-rise">
          <BrandMark large />
          <h1 className="sr-only">Word of Mouth</h1>
          <p className="max-w-xl text-lg sm:text-xl text-[var(--ink-soft)] leading-relaxed">
            Say what you care about in plain language. We discover sources, ingest the chatter, rank
            what matters, and keep a living feed you can share.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-demo">Demo feeds seeded</span>
            <span className="badge badge-live">Live RSS / HN</span>
            <span className="badge">Extractive summaries without AI keys</span>
          </div>
        </div>
        <CreateFeedForm />
      </section>

      <section className="space-y-4 animate-rise-delay">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-[var(--ink)]">Your listening posts</h2>
            <p className="text-sm text-[var(--ink-soft)] mt-1">
              Demo feeds are labelled. Live feeds refresh on a schedule and on demand.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            {demo.length} demo · {live.length} live
          </p>
        </div>
        <FeedList feeds={feeds} />
      </section>
    </div>
  )
}
