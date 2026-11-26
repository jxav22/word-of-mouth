function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shingles(text: string, size = 3): Set<string> {
  const tokens = text.split(' ').filter(Boolean)
  const out = new Set<string>()
  if (tokens.length < size) {
    out.add(tokens.join(' '))
    return out
  }
  for (let i = 0; i <= tokens.length - size; i++) {
    out.add(tokens.slice(i, i + size).join(' '))
  }
  return out
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

export function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitle(a)
  const nb = normalizeTitle(b)
  if (!na || !nb) return 0
  if (na === nb) return 1

  const tri = jaccard(shingles(na, 3), shingles(nb, 3))
  const bi = jaccard(shingles(na, 2), shingles(nb, 2))
  // Prefer shared phrasing; boost near-prefix / containment cases common in headlines.
  const shorter = na.length <= nb.length ? na : nb
  const longer = na.length <= nb.length ? nb : na
  const containment = longer.includes(shorter) ? 0.85 : 0
  return Math.max(tri, bi * 0.95, containment)
}

export type DedupeItem = {
  canonicalUrl: string
  title: string
}

export type DedupeResult<T extends DedupeItem> = {
  kept: T[]
  duplicates: Array<{ item: T; ofUrl: string; similarity: number }>
}

/** Keep first occurrence; drop near-duplicate titles or exact URLs. */
export function dedupeArticles<T extends DedupeItem>(
  items: T[],
  threshold = 0.72,
): DedupeResult<T> {
  const kept: T[] = []
  const duplicates: Array<{ item: T; ofUrl: string; similarity: number }> = []
  const seenUrls = new Set<string>()

  for (const item of items) {
    const url = item.canonicalUrl.trim().replace(/\/$/, '').toLowerCase()
    if (seenUrls.has(url)) {
      duplicates.push({ item, ofUrl: url, similarity: 1 })
      continue
    }

    let dupOf: { url: string; similarity: number } | null = null
    for (const existing of kept) {
      const sim = titleSimilarity(item.title, existing.title)
      if (sim >= threshold) {
        dupOf = { url: existing.canonicalUrl, similarity: sim }
        break
      }
    }

    if (dupOf) {
      duplicates.push({ item, ofUrl: dupOf.url, similarity: dupOf.similarity })
      continue
    }

    seenUrls.add(url)
    kept.push(item)
  }

  return { kept, duplicates }
}

export function clusterIdFor(title: string): string {
  const norm = normalizeTitle(title).split(' ').slice(0, 8).join('-')
  return `c_${norm.slice(0, 48) || 'misc'}`
}
