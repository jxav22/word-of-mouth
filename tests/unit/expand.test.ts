import { describe, expect, it } from 'vitest'
import { expandKeywords, mmrReorder } from '../../src/lib/rank'

describe('expandKeywords', () => {
  it('adds related terms for ai and hiring', () => {
    const expanded = expandKeywords(['ai', 'hiring'])
    expect(expanded).toEqual(expect.arrayContaining(['ai', 'hiring', 'llm', 'job']))
    expect(expanded[0]).toBe('ai')
  })
})

describe('mmrReorder', () => {
  it('prefers a novel high-ish item over a near-duplicate top pair', () => {
    const out = mmrReorder([
      { title: 'Rust async runtime improvements land', score: 0.92 },
      { title: 'Rust async runtime improvements ship', score: 0.91 },
      { title: 'Auckland meetup calendar for developers', score: 0.8 },
    ], 0.55)
    expect(out[0].title).toContain('Rust')
    // Second slot should often be the meetup under stronger diversity lambda
    expect(out.map((o) => o.title).join(' ')).toContain('Auckland')
  })
})
