import { useApi } from '../hooks/useApi.js'
import './MapsGrid.css'

const DIFF_COLORS = [
  '', '#9e9e9e', '#9e9e9e', '#9e9e9e',
  '#ffff55', '#ffaa00', '#ff5555',
  '#ff5555', '#cc44ff', '#cc44ff', '#5b6ef5',
]

function DiffDots({ difficulty }) {
  return (
    <div className="diff-dots">
      {Array.from({ length: Math.min(difficulty, 10) }).map((_, i) => (
        <span
          key={i}
          className="diff-dot"
          style={{ background: DIFF_COLORS[difficulty] || '#5b6ef5' }}
        />
      ))}
    </div>
  )
}

function formatMapName(name) {
  return name
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function MapsGrid({ apiBase }) {
  const { data: maps, error, loading, refresh } = useApi(`${apiBase}/api/maps`)

  const active = maps?.filter(m => m.inProgress) ?? []
  const idle   = maps?.filter(m => !m.inProgress) ?? []

  return (
    <div>
      <div className="lb-header">
        <h2 className="section-title">Maps</h2>
        <button className="icon-btn" onClick={refresh} title="Refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      {loading && <div className="state-box"><div className="spinner" /> Loading…</div>}
      {!loading && error && <div className="state-box error">Failed to load: {error}</div>}

      {!loading && !error && maps && (
        <>
          {active.length > 0 && (
            <>
              <p className="maps-group-label">In Progress</p>
              <div className="maps-grid">
                {active.map(m => <MapCard key={m.map} map={m} />)}
              </div>
            </>
          )}
          <p className="maps-group-label" style={{ marginTop: active.length ? '1.5rem' : 0 }}>
            Idle
          </p>
          <div className="maps-grid">
            {idle.map(m => <MapCard key={m.map} map={m} />)}
          </div>
        </>
      )}
    </div>
  )
}

function MapCard({ map }) {
  return (
    <div className={`map-card card${map.inProgress ? ' active' : ''}`}>
      {map.inProgress && (
        <div className="live-badge">
          <span className="live-dot" />
          LIVE
        </div>
      )}
      <div className="map-name">{formatMapName(map.map)}</div>
      <div className="map-id">{map.map}</div>
      <div className="map-meta">
        <div className="map-meta-row">
          <span className="meta-label">Difficulty</span>
          <span className="meta-val">{map.difficulty}</span>
        </div>
        <DiffDots difficulty={map.difficulty} />
        {map.inProgress && (
          <div className="map-meta-row" style={{ marginTop: '0.5rem' }}>
            <span className="meta-label">Players</span>
            <span className="meta-val players-val">{map.playerCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}
