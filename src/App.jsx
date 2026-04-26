import { useState, useEffect } from 'react'
import StatusBar from './components/StatusBar.jsx'
import LeaderboardTable from './components/LeaderboardTable.jsx'
import PlayerLookup from './components/PlayerLookup.jsx'
import MapsGrid from './components/MapsGrid.jsx'
import './App.css'

const TABS = [
  { id: 'ranked',    label: 'Ranked' },
  { id: 'avoidance', label: 'Avoidance' },
  { id: 'flawless',  label: 'Flawless' },
  { id: 'maps',      label: 'Maps' },
  { id: 'player',    label: 'Player Lookup' },
]

const DEFAULT_BASE = ''

export default function App() {
  const [apiBase, setApiBase] = useState(() => {
    const saved = localStorage.getItem('msw_api_base') || DEFAULT_BASE
    if (saved && !saved.startsWith('http://') && !saved.startsWith('https://')) {
      localStorage.removeItem('msw_api_base')
      return DEFAULT_BASE
    }
    return saved
  })
  const [draftBase, setDraftBase] = useState(apiBase)
  const [configOpen, setConfigOpen] = useState(!apiBase)
  const [activeTab, setActiveTab] = useState('ranked')

  useEffect(() => {
    if (apiBase) localStorage.setItem('msw_api_base', apiBase)
  }, [apiBase])

  function saveConfig(e) {
    e.preventDefault()
    let cleaned = draftBase.trim().replace(/\/$/, '')
    if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'http://' + cleaned
    }
    setApiBase(cleaned)
    setDraftBase(cleaned)
    setConfigOpen(false)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="pixel-font logo-text">MegaSkywars</span>
            <span className="logo-sub">live stats</span>
          </div>
          <button
            className="config-btn"
            onClick={() => setConfigOpen(o => !o)}
            title="Configure server"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            {apiBase
              ? <span className="config-url">{apiBase.replace('http://', '').replace('https://', '')}</span>
              : <span className="config-none">no server set</span>
            }
          </button>
        </div>

        {configOpen && (
          <div className="config-panel">
            <form onSubmit={saveConfig} className="config-form">
              <label className="config-label">Server API Base URL</label>
              <div className="config-row">
                <input
                  className="config-input"
                  type="text"
                  placeholder="http://your-server-ip:8031"
                  value={draftBase}
                  onChange={e => setDraftBase(e.target.value)}
                  autoFocus
                />
                <button className="btn-primary" type="submit">Save</button>
              </div>
              <p className="config-hint">
                The MegaSkywars API must be reachable from your browser. Port 8031 must be open on the server.
              </p>
            </form>
          </div>
        )}
      </header>

      {apiBase ? (
        <>
          <StatusBar apiBase={apiBase} />

          <nav className="tab-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <main className="main-content">
            {activeTab === 'ranked' && (
              <LeaderboardTable
                apiBase={apiBase}
                endpoint="/api/leaderboard/ranked"
                title="Ranked Leaderboard"
                type="ranked"
              />
            )}
            {activeTab === 'avoidance' && (
              <LeaderboardTable
                apiBase={apiBase}
                endpoint="/api/leaderboard/avoidance"
                title="Avoidance Leaderboard"
                type="avoidance"
              />
            )}
            {activeTab === 'flawless' && (
              <LeaderboardTable
                apiBase={apiBase}
                endpoint="/api/leaderboard/flawless"
                title="Flawless Avoidance Leaderboard"
                type="flawless"
              />
            )}
            {activeTab === 'maps' && <MapsGrid apiBase={apiBase} />}
            {activeTab === 'player' && <PlayerLookup apiBase={apiBase} />}
          </main>
        </>
      ) : (
        <div className="no-server">
          <div className="no-server-inner">
            <span className="pixel-font no-server-title">No Server Configured</span>
            <p>Enter your MegaSkywars server URL above to get started.</p>
            <button className="btn-primary" onClick={() => setConfigOpen(true)}>
              Set Server URL
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        MegaSkywars Live Stats &mdash; data served live from your server
      </footer>
    </div>
  )
}
