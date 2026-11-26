import { describe, expect, it } from 'vitest'
import { extractiveSummary, summariseArticle } from '../../src/lib/summarise'

describe('summarise', () => {
  const body = [
    'Researchers released an open evaluation harness for large language models this week.',
    'The toolkit measures factuality, latency, and cost across providers under identical prompts.',
    'Early adopters say it reduces week-long bake-offs to a few hours of scripted runs.',
    'Garden clubs also announced a new mulch festival unrelated to software.',
  ].join(' ')

  it('extractive summary prefers keyword-rich early sentences', () => {
    const summary = extractiveSummary('LLM evaluation harness', body, ['llm', 'evaluation', 'harness'])
    expect(summary.toLowerCase()).toContain('evaluation')
    expect(summary.length).toBeGreaterThan(40)
    expect(summary.toLowerCase()).not.toContain('mulch festival')
  })

  it('falls back to extractive with attribution when no AI keys', async () => {
    const prevO = process.env.OPENAI_API_KEY
    const prevA = process.env.ANTHROPIC_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    try {
      const result = await summariseArticle('LLM evaluation harness', body, {
        keywords: ['llm', 'evaluation'],
        sourceTitle: 'Demo Wire',
        author: 'Ada',
        allowAi: false,
      })
      expect(result.provider).toBe('extractive')
      expect(result.attribution).toContain('Extractive summary')
      expect(result.attribution).toContain('Demo Wire')
      expect(result.attribution).toContain('Ada')
      expect(result.summary.length).toBeGreaterThan(20)
    } finally {
      if (prevO) process.env.OPENAI_API_KEY = prevO
      if (prevA) process.env.ANTHROPIC_API_KEY = prevA
    }
  })
})
