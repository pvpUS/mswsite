import { useState, useCallback } from 'react'
import { fetchCached, invalidate } from '../apiCache.js'
import './PlayerLookup.css'

const DIV_NAMES = [
  '', 'Gray', 'White', 'Yellow', 'Light Purple', 'Gold',
  'Aqua', 'Green', 'Red', 'Purple', 'Black',
  'Blue', 'Blue', 'Blue', 'Blue', 'Blue',
]

function divClass(div) {
  if (!div) return ''
  if (div >= 11) return 'div-color-top'
  return `div-color-${div}`
}

const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i

function StatBlock({ label, value, sub, className = '' }) {
  return (
    <div className={`stat-block ${className}`}>
      <span className="stat-block-value">{value ?? '—'}</span>
      {sub !== undefined && <span className="stat-block-sub">{sub}</span>}
      <span className="stat-block-label">{label}</span>
    </div>
  )
}

export default function PlayerLookup({ apiBase }) {
  const [input, setInput] = useState('')
  const [player, setPlayer] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const lookup = useCallback(async (uuid, force = false) => {
    const url = `${apiBase}/api/player/${uuid.trim()}`
    setLoading(true)
    setError(null)
    if (force) invalidate(url)
    try {
      const json = await fetchCached(url)
      if (json.error) throw new Error(json.error)
      setPlayer(json)
    } catch (e) {
      setError(e.message)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  function handleSubmit(e) {
    e.preventDefault()
    const v = input.trim()
    if (!v) return
    if (!UUID_RE.test(v)) {
      setError('invalid uuid — must be a valid Minecraft UUID')
      return
    }
    lookup(v)
  }

  const hasRated = player && player.rating !== undefined

  return (
    <div>
      <h2 className="section-title">Player Lookup</h2>

      <form onSubmit={handleSubmit} className="lookup-form">
        <input
          className="lookup-input"
          type="text"
          placeholder="Paste Minecraft UUID  (e.g. 069a79f4-44e9-4726-a5be-fca90e38aaf5)"
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Look Up'}
        </button>
        {player && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => lookup(player.uuid, true)}
            disabled={loading}
          >
            Refresh
          </button>
        )}
      </form>

      {error && (
        <div className="lookup-error card">{error}</div>
      )}

      {player && (
        <div className="player-card card">
          <div className="player-card-header">
            <PlayerAvatar uuid={player.uuid} name={player.name} />
            <div className="player-card-info">
              <span className="player-card-name">{player.name ?? 'Unknown'}</span>
              <span className="player-card-uuid">{player.uuid}</span>
            </div>
            {hasRated && (
              <div className={`player-division ${divClass(player.division)}`}>
                {DIV_NAMES[player.division] || `Div ${player.division}`}
              </div>
            )}
          </div>

          <div className="player-stats">
            {hasRated && (
              <StatBlock label="ELO Rating" value={player.rating} className="highlight" />
            )}
            <StatBlock
              label="Avoidance"
              value={player.completions}
              sub={player.flawless != null ? `${player.flawless} flawless` : undefined}
            />
            {(player.bonusCompletions > 0 || player.bonusFlawless > 0) && (
              <StatBlock
                label="Bonus"
                value={player.bonusCompletions}
                sub={player.bonusFlawless != null ? `${player.bonusFlawless} flawless` : undefined}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerAvatar({ uuid, name }) {
  const [ok, setOk] = useState(true)
  if (!uuid || !ok) {
    return (
      <div className="lookup-avatar-fallback">
        {(name || '?')[0].toUpperCase()}
      </div>
    )
  }
  return (
    <img
      className="lookup-avatar"
      src={`https://crafatar.com/avatars/${uuid}?size=64&overlay`}
      alt={name}
      onError={() => setOk(false)}
    />
  )
}
