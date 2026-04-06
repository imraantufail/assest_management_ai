import React, { createContext, useContext, useState, useCallback } from 'react'
import { fmtDate, statusClass, CHAIN_ICON, CHAIN_CLASS, initials, avatarColor } from '../utils/helpers'

// -- Toast ----------------------------------------------------
const ToastCtx = createContext(null)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// -- Confirm --------------------------------------------------
const ConfirmCtx = createContext(null)
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const confirm = useCallback((msg, onOk, opts = {}) => setState({ msg, onOk, opts }), [])
  const close = () => setState(null)
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="overlay" style={{ alignItems:'center' }}>
          <div className="modal sm">
            <div className="confirm-box">
              <h3>{state.opts.title || 'Confirm'}</h3>
              <p>{state.msg}</p>
              <div className="confirm-actions">
                <button className="btn" onClick={close}>Cancel</button>
                <button
                  className={`btn ${state.opts.danger ? 'btn-danger' : 'btn-primary'}`}
                  style={state.opts.danger ? { background:'rgba(240,93,110,.15)', border:'1px solid var(--red)' } : {}}
                  onClick={() => { state.onOk(); close() }}
                >{state.opts.ok || 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  )
}
export const useConfirm = () => useContext(ConfirmCtx)

// -- Modal ----------------------------------------------------
export function Modal({ open, onClose, title, sub, size = '', children }) {
  if (!open) return null
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <button className="modal-x" onClick={onClose}>✕</button>
        {title && <div className="modal-hdr"><div className="modal-title">{title}</div>{sub && <div className="modal-sub">{sub}</div>}</div>}
        {children}
      </div>
    </div>
  )
}

// -- Badge ----------------------------------------------------
export function Badge({ status }) {
  return <span className={`badge ${statusClass(status)}`}>{status}</span>
}

// -- Tabs -----------------------------------------------------
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.key} className={`tab ${active === t.key ? 'active' : ''}`} onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// -- Avatar ---------------------------------------------------
export function Avatar({ name, size = 38 }) {
  const [bg, color] = avatarColor(name || '?')
  return <div className="avatar" style={{ width:size, height:size, background:bg, color }}>{initials(name || '?')}</div>
}

// -- Chain timeline -------------------------------------------
export function ChainTimeline({ events, employees }) {
  const eName = (id) => {
    if (!id) return '--'
    if (id.startsWith('EMP')) return employees.find(e => e.id === id)?.name || id
    return id
  }
  if (!events.length) return <div className="empty">No chain events yet</div>
  return (
    <div>
      {[...events].sort((a,b)=>a.date.localeCompare(b.date)).map(e => (
        <div key={e.id} className="chain-step">
          <div className={`chain-icon ${CHAIN_CLASS[e.type] || 'ci-transfer'}`}>{CHAIN_ICON[e.type] || '•'}</div>
          <div className="chain-body">
            <div className="chain-label">
              {e.type}
              {e.reason && <span style={{ color:'var(--text2)', fontWeight:400 }}> -- {e.reason}</span>}
            </div>
            <div className="chain-meta">{fmtDate(e.date)} . Approved by {e.approvedBy || '--'}{e.salePrice ? ` . ₨ ${parseFloat(e.salePrice).toLocaleString('en-PK')}` : ''}</div>
            <div className="chain-fto">
              <span className="chain-person">{eName(e.from)}</span>
              <span style={{ color:'var(--text3)', fontSize:11 }}>→</span>
              <span className="chain-person to">{eName(e.to)}</span>
              {e.dept && <span style={{ fontSize:11, color:'var(--text3)' }}>. {e.dept}</span>}
              {e.location && <span style={{ fontSize:11, color:'var(--text3)' }}>. {e.location}</span>}
            </div>
            {e.notes && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{e.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
