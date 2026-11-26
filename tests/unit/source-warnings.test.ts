import { describe, expect, it } from 'vitest'
import {
  classifyIngestErrorKind,
  mapErrorSourcesToWarnings,
  mapIngestErrorsToWarnings,
} from '@/lib/ingest/source-warnings'

describe('classifyIngestErrorKind', () => {
  it('classifies Reddit dual-fail egress (rss + json 403) as reddit, not rss', () => {
    const msg = 'r/MachineLearning: rss: HTTP 404; json: HTTP 403'
    expect(classifyIngestErrorKind(msg)).toBe('reddit')
  })

  it('classifies explicit reddit token as reddit', () => {
    expect(classifyIngestErrorKind('reddit adapter failed: HTTP 403')).toBe('reddit')
  })

  it('classifies HN RSS JSON-parse noise as hn', () => {
    expect(
      classifyIngestErrorKind('HN RSS: Unexpected token \'<\', "<rss versi"... is not valid JSON'),
    ).toBe('hn')
  })

  it('returns undefined for opaque messages', () => {
    expect(classifyIngestErrorKind('upstream timed out')).toBeUndefined()
  })
})

describe('mapIngestErrorsToWarnings (create → banner data path)', () => {
  it('returns empty when create ingest has no errors (banner hidden)', () => {
    expect(mapIngestErrorsToWarnings([])).toEqual([])
  })

  it('maps Reddit 403 composite into banner rows with kind=reddit', () => {
    const warnings = mapIngestErrorsToWarnings([
      'r/cscareerquestions: rss: HTTP 404; json: HTTP 403',
      'HN Who is Hiring signal: Unexpected token \'<\', "<rss versi"... is not valid JSON',
    ])
    expect(warnings).toHaveLength(2)
    expect(warnings[0]).toEqual({
      title: 'Source ingest',
      kind: 'reddit',
      message: 'r/cscareerquestions: rss: HTTP 404; json: HTTP 403',
    })
    expect(warnings[1]?.kind).toBe('hn')
  })
})

describe('mapErrorSourcesToWarnings (feed/sources → banner data path)', () => {
  it('maps only errored sources and falls back when lastError is null', () => {
    const warnings = mapErrorSourcesToWarnings([
      {
        title: 'r/MachineLearning',
        kind: 'reddit',
        status: 'error',
        lastError: 'rss: HTTP 404; json: HTTP 403',
      },
      { title: 'Hacker News', kind: 'hn', status: 'ok', lastError: null },
      { title: 'Broken RSS', kind: 'rss', status: 'error', lastError: null },
    ])
    expect(warnings).toEqual([
      {
        title: 'r/MachineLearning',
        kind: 'reddit',
        message: 'rss: HTTP 404; json: HTTP 403',
      },
      { title: 'Broken RSS', kind: 'rss', message: 'Fetch failed' },
    ])
  })
})
