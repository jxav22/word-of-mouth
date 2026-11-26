import { seedDemoFeeds } from './feeds/service'
import { ensureScheduler } from '../workers/scheduler'

declare global {
  // eslint-disable-next-line no-var
  var __womBootstrapped: boolean | undefined
}

export async function bootstrap() {
  if (global.__womBootstrapped) return
  global.__womBootstrapped = true
  await seedDemoFeeds(false)
  ensureScheduler()
}
