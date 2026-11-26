import { describe, expect, it } from 'vitest'
import { extractiveSummary } from '../../src/lib/summarise'

describe('extractiveSummary', () => {
  it('returns title when body empty', () => {
    expect(extractiveSummary('Only title', '', ['ai'])).toBe('Only title')
  })

  it('prefers keyword-rich sentences', () => {
    const summary = extractiveSummary(
      'AI tooling',
      [
        'Gardening tips are popular in spring across many suburbs worldwide.',
        'Open-weight AI models are changing how small teams ship LLM infrastructure.',
        'Meanwhile tomatoes need consistent watering during dry Auckland summers.',
      ].join(' '),
      ['ai', 'llm', 'infrastructure'],
      2,
    )
    expect(summary.toLowerCase()).toContain('ai')
    expect(summary.toLowerCase()).toMatch(/llm|infrastructure/)
  })
})
