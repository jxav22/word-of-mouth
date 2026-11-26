import { seedDemoFeeds } from '../src/lib/feeds/service'

async function main() {
  const feeds = await seedDemoFeeds(false)
  console.log(
    JSON.stringify(
      {
        seeded: feeds.length,
        feeds: feeds.map((f) => ({ slug: f.slug, title: f.title, isDemo: f.isDemo })),
      },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
