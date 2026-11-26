import { describe, expect, it } from 'vitest'
import {
  canonicalizeUrl,
  clusterStories,
  dedupeArticles,
  pickClusterRepresentatives,
  titleSimilarity,
} from '../../src/lib/cluster/dedupe'

describe('dedupe', () => {
  it('detects similar titles', () => {
    const sim = titleSimilarity(
      'Open-weight models push smaller teams into production AI',
      'Open weight models push smaller teams into production AI',
    )
    expect(sim).toBeGreaterThan(0.7)
  })

  it('canonicalizes tracking params and www', () => {
    const a = canonicalizeUrl('https://www.Example.com/post?utm_source=x&id=1')
    const b = canonicalizeUrl('https://example.com/post/?id=1')
    expect(a).toBe(b)
  })

  it('drops exact URL duplicates and near-identical titles', () => {
    const { kept, duplicates } = dedupeArticles([
      { canonicalUrl: 'https://example.com/a', title: 'Remote platform engineer roles trending' },
      { canonicalUrl: 'https://example.com/a/?utm_source=x', title: 'Something else' },
      {
        canonicalUrl: 'https://example.com/b',
        title: 'Remote platform engineer roles trending!',
      },
      { canonicalUrl: 'https://example.com/c', title: 'Totally different gardening news' },
    ])
    expect(kept.length).toBe(2)
    expect(duplicates.length).toBe(2)
  })

  it('prefix-containment titles hard-dedupe; looser cousins survive for clustering', () => {
    const contained = dedupeArticles(
      [
        { canonicalUrl: 'https://example.com/a', title: 'Remote platform engineer roles trending' },
        {
          canonicalUrl: 'https://example.com/b',
          title: 'Remote platform engineer roles trending across APAC',
        },
      ],
      0.78,
    )
    expect(contained.kept.length).toBe(1)

    const cousins = dedupeArticles(
      [
        { canonicalUrl: 'https://example.com/a', title: 'OpenAI ships new evaluation harness' },
        {
          canonicalUrl: 'https://example.com/b',
          title: 'Labs release model evaluation toolkit for LLM apps',
        },
      ],
      0.78,
    )
    expect(cousins.kept.length).toBe(2)
  })

  it('clusters cross-source same story without dropping members', () => {
    const { clusters, indexed } = clusterStories(
      [
        {
          canonicalUrl: 'https://hn.example/1',
          title: 'Acme raises $40M to expand AI coding agents',
        },
        {
          canonicalUrl: 'https://tech.example/2',
          title: 'Acme raises $40M to expand AI coding agents further',
        },
        {
          canonicalUrl: 'https://other.example/3',
          title: 'Municipal library hours change next week',
        },
      ],
      0.5,
    )
    expect(indexed).toHaveLength(3)
    expect(clusters.length).toBeLessThanOrEqual(3)
    const acmeCluster = clusters.find((c) => c.members.length >= 2)
    expect(acmeCluster).toBeTruthy()
    expect(new Set(acmeCluster!.members.map((m) => m.clusterId)).size).toBe(1)
  })

  it('picks highest-scored cluster representative', () => {
    const picked = pickClusterRepresentatives([
      {
        canonicalUrl: 'https://a',
        title: 'Same story A',
        score: 0.4,
        clusterId: 'c1',
      },
      {
        canonicalUrl: 'https://b',
        title: 'Same story B',
        score: 0.9,
        clusterId: 'c1',
      },
      {
        canonicalUrl: 'https://c',
        title: 'Other',
        score: 0.5,
        clusterId: 'c2',
      },
    ])
    expect(picked).toHaveLength(2)
    expect(picked.find((p) => p.clusterId === 'c1')?.score).toBe(0.9)
  })
})
