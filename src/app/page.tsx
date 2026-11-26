import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { CreateFeedForm } from '@/components/CreateFeedForm'
import { FeedList } from '@/components/FeedList'
import { SignalField } from '@/components/SignalField'
import { SiteHeader } from '@/components/SiteHeader'
import { bootstrap } from '@/lib/bootstrap'
import { listFeeds } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  await bootstrap()
  const feeds = listFeeds()
  const demo = feeds.filter((f) => f.isDemo)
  const live = feeds.filter((f) => !f.isDemo)

  return (
    <>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-50">
          <SiteHeader overHero />
        </div>

        <section className="hero-bleed">
          <SignalField />
          <div className="hero-inner space-y-6">
            <div className="animate-rise max-w-3xl space-y-5">
              <BrandMark large inverted />
              <h1 className="font-display text-[clamp(1.35rem,3.6vw,2.15rem)] leading-snug text-[var(--hero-mist)]">
                Natural language in. A living feed out.
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-[var(--hero-muted)] sm:text-lg">
                Describe what you care about. We discover sources, rank the signal, and keep a
                shareable listening post.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="#create" className="btn-primary cta-pulse">
                  Start listening
                </a>
                <Link href="/feeds" className="btn-ghost">
                  Browse feeds
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 sm:py-14">
        <section className="animate-fade">
          <CreateFeedForm />
        </section>

        <section className="animate-rise-delay space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label">Listening posts</p>
              <h2 className="font-display mt-1 text-3xl text-[var(--ink)] sm:text-4xl">Your feeds</h2>
              <p className="mt-1 max-w-xl text-sm text-[var(--ink-soft)]">
                Demo feeds are seeded fixtures. Live feeds pull public RSS and Hacker News.
              </p>
            </div>
            <p className="section-label">
              {demo.length} demo · {live.length} live
            </p>
          </div>
          <FeedList feeds={feeds} />
        </section>
      </div>
    </>
  )
}
