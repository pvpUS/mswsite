const cache    = new Map() // url -> { data, ts }
const inflight = new Map() // url -> Promise<data>

const TTL = {
  status:      15_000,
  leaderboard: 60_000,
  maps:        20_000,
  player:      60_000,
}

function ttlFor(url) {
  if (url.includes('/api/status'))      return TTL.status
  if (url.includes('/api/leaderboard')) return TTL.leaderboard
  if (url.includes('/api/maps'))        return TTL.maps
  if (url.includes('/api/player'))      return TTL.player
  return 30_000
}

export function getCached(url) {
  const entry = cache.get(url)
  if (!entry) return null
  if (Date.now() - entry.ts > ttlFor(url)) return null
  return entry.data
}

export async function fetchCached(url) {
  const hit = getCached(url)
  if (hit) return hit

  if (inflight.has(url)) return inflight.get(url)

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      cache.set(url, { data, ts: Date.now() })
      inflight.delete(url)
      return data
    })
    .catch(err => {
      inflight.delete(url)
      throw err
    })

  inflight.set(url, promise)
  return promise
}

export function invalidate(url) {
  cache.delete(url)
}
