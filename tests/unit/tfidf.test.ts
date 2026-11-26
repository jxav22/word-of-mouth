import { describe, expect, it } from 'vitest'
import { cosine, semanticScores, tfidfVector, tokenize, idfFromDocs } from '../../src/lib/rank/tfidf'

describe('tfidf semantic', () => {
  it('tokenizes and drops stopwords', () => {
    const toks = tokenize('The AI model is training on the dataset')
    expect(toks).toContain('ai')
    expect(toks).toContain('model')
    expect(toks).not.toContain('the')
  })

  it('ranks on-topic docs higher via cosine', () => {
    const scores = semanticScores('kubernetes observability tracing', [
      'Garden mulch and compost tips for summer',
      'OpenTelemetry tracing for Kubernetes clusters and SLOs',
      'Football scores from the weekend matches',
    ])
    expect(scores[1]).toBeGreaterThan(scores[0])
    expect(scores[1]).toBeGreaterThan(scores[2])
  })

  it('cosine of identical vectors is ~1', () => {
    const docs = [['rust', 'async'], ['rust', 'async']]
    const idf = idfFromDocs(docs)
    const a = tfidfVector(docs[0], idf)
    const b = tfidfVector(docs[1], idf)
    expect(cosine(a, b)).toBeGreaterThan(0.99)
  })
})
