import React from 'react'
import { useStore } from '../store/useStore'
import { Badge } from '../components/UI'
import { fmtDate, fmtCost, warrantyStatus } from '../utils/helpers'

export default function Dashboard() {
  const { assets, employees, chain, services, upgrades, settings } = useStore()
  const cur = settings?.currency || 'PKR'

  const eName = (id) => {
    if (!id) return '--'
    if (id.startsWith('EMP')) return employees.find(e => e.id === id)?.name || id
    return id
  }

  const active   = assets.filter(a => a.status === 'Active').length
  const repair   = assets.filter(a => a.status === 'Under Repair').length
  const disposed = assets.filter(a => ['Sold','Scrapped'].includes(a.status)).length
  const activeEmp = employees.filter(e => e.status === 'Active').length

  const recent = [...chain].sort((a,b) => b.date.localeCompare(a.date)).slice(0,8)

  const warnAssets = assets
    .filter(a => !['Sold','Scrapped'].includes(a.status) && a.warranty)
    .map(a => ({ ...a, ws: warrantyStatus(a.warranty) }))
    .filter(a => a.ws && a.ws.days < 90)
    .sort((a,b) => a.ws.days - b.ws.days)
    .slice(0,5)

  const statuses = ['Active','In Stock','Under Repair','Warranty Expired','Sold','Scrapped']
    .map(s => ({ s, count: assets.filter(a => a.status === s).length }))
    .filter(x => x.count > 0)

  // Assets with no chain events (bought but never moved)
  const noMove = assets.filter(a => {
    const evts = chain.filter(e => e.assetId === a.id)
    return evts.length <= 1 && a.assignedTo && !['Sold','Scrapped'].includes(a.status)
  })

  return (
    <div style={{ padding:24 }}>
      <div className="ph">
        <div>
          <div className="pt">Dashboard</div>
          <div className="ps">{assets.length} assets . {employees.length} employees (all-time) . {chain.length} chain events</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label:'Total Assets',       val:assets.length,            color:'var(--text)' },
          { label:'Active',             val:active,                   color:'var(--green)' },
          { label:'Under Repair',       val:repair,                   color:'var(--amber)' },
          { label:'Scrapped / Sold',    val:disposed,                 color:'var(--red)' },
          { label:'Active Employees',   val:activeEmp,                color:'var(--accent)' },
          { label:'All-time Employees', val:employees.length,         color:'var(--purple)' },
          { label:'Chain Events',       val:chain.length,             color:'var(--cyan)' },
          { label:'Upgrades Logged',    val:(upgrades||[]).length,    color:'var(--teal)' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-label">{k.label}</div>
            <div className="stat-val" style={{ color:k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Recent activity */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:10 }}>Recent Activity</div>
          <div className="twrap">
            <table>
              <thead><tr><th>Asset</th><th>Event</th><th>From → To</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map(e => (
                  <tr key={e.id}>
                    <td className="td-mono">{e.assetId}</td>
                    <td><Badge status={e.type} /></td>
                    <td style={{ fontSize:11 }}>{eName(e.from)} → {eName(e.to)}</td>
                    <td style={{ fontSize:11, color:'var(--text3)' }}>{fmtDate(e.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {/* Status breakdown */}
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:10 }}>Status Breakdown</div>
          <div className="twrap" style={{ marginBottom:16 }}>
            <table>
              <thead><tr><th>Status</th><th>Count</th><th>Share</th></tr></thead>
              <tbody>
                {statuses.map(({ s, count }) => (
                  <tr key={s}>
                    <td><Badge status={s} /></td>
                    <td style={{ fontFamily:'var(--mono)', fontSize:12 }}>{count}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:4, background:'var(--surface2)', borderRadius:2 }}>
                          <div style={{ width:`${Math.round(count/assets.length*100)}%`, height:'100%', background:'var(--accent)', borderRadius:2 }} />
                        </div>
                        <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', minWidth:30 }}>
                          {Math.round(count/assets.length*100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Warranty alerts */}
          {warnAssets.length > 0 && (
            <>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--amber)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:8 }}>⚠ Warranty Alerts</div>
              <div className="twrap" style={{ marginBottom:16 }}>
                <table>
                  <thead><tr><th>Asset ID</th><th>Model</th><th>Warranty</th></tr></thead>
                  <tbody>
                    {warnAssets.map(a => (
                      <tr key={a.id}>
                        <td className="td-mono">{a.id}</td>
                        <td style={{ fontSize:12 }}>{a.make} {a.model}</td>
                        <td><span className={`badge ${a.ws.cls}`}>{a.ws.label}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Assets with no transfers -- long-term holders */}
          {noMove.length > 0 && (
            <>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--cyan)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:8 }}>📌 Long-term Holders (no transfer)</div>
              <div className="twrap">
                <table>
                  <thead><tr><th>Asset</th><th>Model</th><th>Holder</th><th>Since</th></tr></thead>
                  <tbody>
                    {noMove.slice(0,5).map(a => {
                      const purchaseEvt = chain.find(e => e.assetId === a.id && e.type === 'Purchase')
                      return (
                        <tr key={a.id}>
                          <td className="td-mono">{a.id}</td>
                          <td style={{ fontSize:12 }}>{a.make} {a.model}</td>
                          <td style={{ fontSize:12 }}>{eName(a.assignedTo)}</td>
                          <td style={{ fontSize:11, color:'var(--text3)' }}>{purchaseEvt ? fmtDate(purchaseEvt.date) : fmtDate(a.purchaseDate)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
