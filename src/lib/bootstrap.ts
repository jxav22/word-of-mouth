import { seedDemoFeeds } from './feeds/service'
import { ensureScheduler } from '../workers/scheduler'

declare global {
  var __womBootstrapped: boolean | undefined
}

export async function bootstrap() {
  if (global.__womBootstrapped) return
  global.__womBootstrapped = true
  await seedDemoFeeds(false)
  ensureScheduler()
}
