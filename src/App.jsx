import React, { useState } from 'react'
import { useStore } from './store/useStore'
import { ToastProvider, ConfirmProvider } from './components/UI'
import Dashboard from './pages/Dashboard'
import Assets    from './pages/Assets'
import Employees from './pages/Employees'
import ChainLog  from './pages/ChainLog'
import Disposed  from './pages/Disposed'
import Settings  from './pages/Settings'

const NAV = [
  { key:'dashboard', label:'Dashboard',      icon:'#' },
  { key:'assets',    label:'Assets',          icon:'QR' },
  { key:'employees', label:'Employees',       icon:'👥' },
  { key:'chain',     label:'Chain Log',       icon:'🔗' },
  { key:'disposed',  label:'Scrapped / Sold', icon:'🗑' },
]

const PAGES = { dashboard:Dashboard, assets:Assets, employees:Employees, chain:ChainLog, disposed:Disposed, settings:Settings }

function App() {
  const [page, setPage] = useState('dashboard')
  const { assets, employees, chain, settings } = useStore()

  const counts = {
    assets:   assets.filter(a=>!['Sold','Scrapped'].includes(a.status)).length,
    employees:employees.length,
    chain:    chain.length,
    disposed: assets.filter(a=>['Sold','Scrapped'].includes(a.status)).length,
  }

  const Page = PAGES[page]

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="app-grid">
          {/* TOP BAR */}
          <header className="topbar">
            {settings?.logo
              ? <img src={settings.logo} alt="logo" style={{ height:30, objectFit:'contain' }} />
              : <div style={{ fontWeight:700, fontSize:16, color:'var(--text)', letterSpacing:'-0.3px' }}>Asset<span style={{ color:'var(--accent)' }}>Flow</span></div>
            }
            <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
              {settings?.orgName || 'IT Asset Management'}
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text3)', background:'var(--surface2)', padding:'3px 10px', borderRadius:4, border:'1px solid var(--border)' }}>
                {assets.filter(a=>a.status==='Active').length} active . {employees.filter(e=>e.status==='Active').length} staff
              </div>
              <button className="btn btn-sm" onClick={() => setPage('settings')}>⚙ Settings</button>
            </div>
          </header>

          {/* SIDEBAR */}
          <nav className="sidebar">
            <div className="nav-sec">Menu</div>
            {NAV.map(n => (
              <div key={n.key} className={`nav-item ${page===n.key?'active':''}`} onClick={()=>setPage(n.key)}>
                <span style={{ fontSize:14 }}>{n.icon}</span>
                {n.label}
                {counts[n.key] !== undefined && <span className="nav-count">{counts[n.key]}</span>}
              </div>
            ))}
            <div style={{ flex:1 }} />
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:4, paddingBottom:8 }}>
              <div className={`nav-item ${page==='settings'?'active':''}`} onClick={()=>setPage('settings')}>
                <span style={{ fontSize:14 }}>⚙</span> Settings
              </div>
            </div>
          </nav>

          {/* MAIN */}
          <main className="main-content"><Page /></main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  )
}

export default App
