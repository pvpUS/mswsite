import { useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import './LeaderboardTable.css'

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

function RankBadge({ rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  if (medals[rank]) return <span className="rank-medal">{medals[rank]}</span>
  return <span className="rank-num">#{rank}</span>
}

function PlayerAvatar({ uuid, name }) {
  const [ok, setOk] = useState(true)
  if (!uuid || !ok) {
    return (
      <div className="avatar-fallback">
        {(name || '?')[0].toUpperCase()}
      </div>
    )
  }
  return (
    <img
      className="avatar"
      src={`https://crafatar.com/avatars/${uuid}?size=32&overlay`}
      alt={name}
      onError={() => setOk(false)}
    />
  )
}

export default function LeaderboardTable({ apiBase, endpoint, title, type }) {
  const { data: rows, error, loading, refresh } = useApi(`${apiBase}${endpoint}`)

  return (
    <div>
      <div className="lb-header">
        <h2 className="section-title">{title}</h2>
        <button className="icon-btn" onClick={refresh} title="Refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      <div className="card">
        {loading && (
          <div className="state-box"><div className="spinner" /> Loading…</div>
        )}
        {!loading && error && (
          <div className="state-box error">Failed to load: {error}</div>
        )}
        {!loading && !error && rows && (
          <table className="lb-table">
            <thead>
              <tr>
                <th className="col-rank">Rank</th>
                <th className="col-player">Player</th>
                {type === 'ranked' && <>
                  <th className="col-stat">Rating</th>
                  <th className="col-stat">Division</th>
                </>}
                {type === 'avoidance' && <th className="col-stat">Completions</th>}
                {type === 'flawless' && <th className="col-stat">Flawless</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.uuid || row.rank} className="lb-row">
                  <td className="col-rank">
                    <RankBadge rank={row.rank} />
                  </td>
                  <td className="col-player">
                    <PlayerAvatar uuid={row.uuid} name={row.name} />
                    <span className="player-name">{row.name}</span>
                  </td>
                  {type === 'ranked' && <>
                    <td className="col-stat">
                      <span className="rating">{row.rating}</span>
                    </td>
                    <td className="col-stat">
                      <span className={`division-badge ${divClass(row.division)}`}>
                        {DIV_NAMES[row.division] || `Div ${row.division}`}
                      </span>
                    </td>
                  </>}
                  {type === 'avoidance' && (
                    <td className="col-stat">
                      <span className="stat-pill">{row.completions}</span>
                    </td>
                  )}
                  {type === 'flawless' && (
                    <td className="col-stat">
                      <span className="stat-pill flawless">{row.flawless}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
