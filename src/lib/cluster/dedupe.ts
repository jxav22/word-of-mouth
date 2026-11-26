import { createHash } from 'crypto'

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

/** Strip tracking params / fragments / trailing slash for cross-source URL identity. */
export function canonicalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim())
    u.hash = ''
    const drop = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'mc_cid',
      'mc_eid',
      'ref',
      'ref_src',
    ]
    for (const k of drop) u.searchParams.delete(k)
    // sort remaining params for stable identity
    const params = [...u.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b))
    u.search = ''
    for (const [k, v] of params) u.searchParams.append(k, v)
    const host = u.hostname.toLowerCase().replace(/^www\./, '')
    u.hostname = host
    const path = u.pathname.replace(/\/+$/, '') || '/'
    u.pathname = path
    return u.toString().toLowerCase()
  } catch {
    return raw.trim().replace(/\/$/, '').toLowerCase()
  }
}

export type DedupeItem = {
  canonicalUrl: string
  title: string
}

export type DedupeResult<T extends DedupeItem> = {
  kept: T[]
  duplicates: Array<{ item: T; ofUrl: string; similarity: number }>
}

/** Keep first occurrence; drop near-duplicate titles or exact (canonical) URLs. */
export function dedupeArticles<T extends DedupeItem>(
  items: T[],
  threshold = 0.72,
): DedupeResult<T> {
  const kept: T[] = []
  const duplicates: Array<{ item: T; ofUrl: string; similarity: number }> = []
  const seenUrls = new Set<string>()

  for (const item of items) {
    const url = canonicalizeUrl(item.canonicalUrl)
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

export type ClusterMember<T> = T & { clusterId: string; clusterSimilarity: number }

export type StoryCluster<T extends DedupeItem> = {
  id: string
  representative: T
  members: ClusterMember<T>[]
}

/**
 * Group near-duplicate / same-story articles across sources.
 * Unlike dedupeArticles (which drops), this keeps members and assigns a shared clusterId.
 * Union-find over title similarity + canonical URL identity.
 */
export function clusterStories<T extends DedupeItem>(
  items: T[],
  similarityThreshold = 0.55,
): {
  clusters: StoryCluster<T>[]
  indexed: ClusterMember<T>[]
} {
  const n = items.length
  const parent = Array.from({ length: n }, (_, i) => i)

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  function union(a: number, b: number) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[rb] = ra
  }

  const urls = items.map((it) => canonicalizeUrl(it.canonicalUrl))
  const urlFirst = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    const prev = urlFirst.get(urls[i])
    if (prev !== undefined) union(prev, i)
    else urlFirst.set(urls[i], i)
  }

  // Pairwise title similarity — O(n²) fine for ingest batches ≤ ~200
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (find(i) === find(j)) continue
      const sim = titleSimilarity(items[i].title, items[j].title)
      if (sim >= similarityThreshold) union(i, j)
    }
  }

  const groups = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const r = find(i)
    const list = groups.get(r) || []
    list.push(i)
    groups.set(r, list)
  }

  const clusters: StoryCluster<T>[] = []
  const indexed: ClusterMember<T>[] = new Array(n)

  for (const indices of groups.values()) {
    const rootItem = items[indices[0]]
    const idSeed = normalizeTitle(rootItem.title).split(' ').slice(0, 6).join(' ')
    const hash = createHash('sha1').update(idSeed || urls[indices[0]]).digest('hex').slice(0, 10)
    const id = `c_${hash}`

    const members: ClusterMember<T>[] = indices.map((i) => {
      const sim = titleSimilarity(items[i].title, rootItem.title)
      const member: ClusterMember<T> = {
        ...items[i],
        clusterId: id,
        clusterSimilarity: Math.round(sim * 1000) / 1000,
      }
      indexed[i] = member
      return member
    })

    // Representative: prefer longer content-ish title uniqueness; first is fine, refine by URL host diversity later
    clusters.push({
      id,
      representative: members[0],
      members,
    })
  }

  return { clusters, indexed }
}

/**
 * Collapse each story cluster to its best-scored member (requires pre-scored items).
 * Use after ranking when the feed should show one card per story.
 */
export function pickClusterRepresentatives<
  T extends DedupeItem & { score: number; clusterId?: string },
>(items: T[]): T[] {
  const best = new Map<string, T>()
  const singles: T[] = []
  for (const item of items) {
    const cid = item.clusterId
    if (!cid) {
      singles.push(item)
      continue
    }
    const prev = best.get(cid)
    if (!prev || item.score > prev.score) best.set(cid, item)
  }
  return [...singles, ...best.values()].sort((a, b) => b.score - a.score)
}
