import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Badge, useToast, useConfirm } from '../components/UI'
import { fmtDate } from '../utils/helpers'
import AssetDetail from '../components/AssetDetail'

export default function ChainLog() {
  const { chain, assets, employees, deleteChainEvent } = useStore()
  const toast = useToast(); const confirm = useConfirm()
  const [search, setSearch] = useState('')
  const [fType, setFType]   = useState('')
  const [detailId, setDI]   = useState(null)

  const eName = (id) => {
    if (!id) return '--'
    if (id.startsWith('EMP')) return employees.find(e=>e.id===id)?.name || id
    return id
  }

  const filtered = [...chain].sort((a,b)=>b.date.localeCompare(a.date)).filter(e => {
    const q = search.toLowerCase()
    return (!q || e.id.toLowerCase().includes(q) || e.assetId.toLowerCase().includes(q)
      || eName(e.from).toLowerCase().includes(q) || eName(e.to).toLowerCase().includes(q))
      && (!fType || e.type === fType)
  })

  const handleDel = (ev) => confirm(
    `Delete event ${ev.id}?`,
    () => { deleteChainEvent(ev.id); toast('Event deleted','info') },
    { title:'Delete Chain Event', danger:true, ok:'Delete' }
  )

  return (
    <div style={{ padding:24 }}>
      <div className="ph"><div><div className="pt">Chain of Custody Log</div><div className="ps">Full traceability -- every event for every asset . {chain.length} total</div></div></div>
      <div className="fbar">
        <input placeholder="Search event ID, asset, person..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select value={fType} onChange={e=>setFType(e.target.value)}>
          <option value="">All Events</option>
          {['Purchase','Transfer','Repair','Upgrade','Return','Sold','Scrapped','Donated','Returned to Vendor'].map(t=><option key={t}>{t}</option>)}
        </select>
        {(search||fType) && <button className="btn btn-ghost btn-sm" onClick={()=>{setSearch('');setFType('')}}>Clear</button>}
      </div>
      <div className="twrap">
        <table>
          <thead><tr><th>Event ID</th><th>Asset ID</th><th>Model</th><th>Event</th><th>From</th><th>To</th><th>Date</th><th>Reason</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={10} className="empty">No events match filter</td></tr>}
            {filtered.map(ev => (
              <tr key={ev.id} onClick={()=>setDI(ev.assetId)}>
                <td className="td-mono">{ev.id}</td>
                <td className="td-mono">{ev.assetId}</td>
                <td style={{ fontSize:12, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {(()=>{const a=assets.find(x=>x.id===ev.assetId);return a?`${a.make||''} ${a.model}`.trim():'--'})()}
                </td>
                <td><Badge status={ev.type} /></td>
                <td style={{ fontSize:12 }}>{eName(ev.from)}</td>
                <td style={{ fontSize:12, color:'var(--green)' }}>{eName(ev.to)}</td>
                <td style={{ fontSize:11, color:'var(--text3)' }}>{fmtDate(ev.date)}</td>
                <td style={{ fontSize:11 }}>{ev.reason||'--'}</td>
                <td style={{ fontSize:11, color:'var(--text3)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.notes||'--'}</td>
                <td onClick={e=>e.stopPropagation()}>
                  <button className="btn btn-icon btn-danger" onClick={()=>handleDel(ev)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AssetDetail assetId={detailId} open={!!detailId} onClose={()=>setDI(null)} />
    </div>
  )
}
