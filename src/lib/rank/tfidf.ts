/** Lightweight bag-of-words TF-IDF + cosine similarity (no native deps). */

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'from', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'as', 'by', 'it', 'its',
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

export function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1)
  const n = tokens.length || 1
  for (const [k, v] of tf) tf.set(k, v / n)
  return tf
}

export function idfFromDocs(docs: string[][]): Map<string, number> {
  const df = new Map<string, number>()
  const N = docs.length || 1
  for (const doc of docs) {
    const uniq = new Set(doc)
    for (const t of uniq) df.set(t, (df.get(t) || 0) + 1)
  }
  const idf = new Map<string, number>()
  for (const [t, c] of df) {
    idf.set(t, Math.log((N + 1) / (c + 1)) + 1)
  }
  return idf
}

export function tfidfVector(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = termFreq(tokens)
  const vec = new Map<string, number>()
  for (const [t, f] of tf) {
    vec.set(t, f * (idf.get(t) ?? 1))
  }
  return vec
}

export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (const [, v] of a) na += v * v
  for (const [, v] of b) nb += v * v
  if (na === 0 || nb === 0) return 0
  const smaller = a.size <= b.size ? a : b
  const larger = a.size <= b.size ? b : a
  for (const [t, v] of smaller) {
    const u = larger.get(t)
    if (u !== undefined) dot += v * u
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/** Build query vector + corpus IDF, then score each document 0..1. */
export function semanticScores(queryText: string, documents: string[]): number[] {
  const queryTokens = tokenize(queryText)
  const docTokens = documents.map(tokenize)
  const idf = idfFromDocs([queryTokens, ...docTokens])
  const qVec = tfidfVector(queryTokens, idf)
  return docTokens.map((toks) => {
    const sim = cosine(qVec, tfidfVector(toks, idf))
    return Math.max(0, Math.min(1, sim))
  })
}
