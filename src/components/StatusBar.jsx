import { useApi } from '../hooks/useApi.js'
import './StatusBar.css'

const REFRESH_MS = 30_000

export default function StatusBar({ apiBase }) {
  const { data, error, refresh, loading } = useApi(
    `${apiBase}/api/status`,
    { refreshInterval: REFRESH_MS }
  )

  return (
    <div className="status-bar">
      <div className="status-bar-inner">
        {error ? (
          <div className="status-error">
            <span className="status-dot offline" />
            Unable to reach server — {error}
          </div>
        ) : (
          <>
            <div className="status-stat">
              <span className="status-dot online" />
              <span className="stat-value">{data?.online ?? '—'}</span>
              <span className="stat-label">online</span>
            </div>
            <div className="status-divider" />
            <div className="status-stat">
              <span className="stat-value queued">{data?.queued ?? '—'}</span>
              <span className="stat-label">in queue</span>
            </div>
            <div className="status-divider" />
            <div className="status-stat">
              <span className="stat-value season">S{data?.season ?? '—'}</span>
              <span className="stat-label">season</span>
            </div>
          </>
        )}
        <button
          className={`refresh-btn${loading ? ' spinning' : ''}`}
          onClick={refresh}
          title="Refresh"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
