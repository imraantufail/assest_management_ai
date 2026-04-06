import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Badge } from '../components/UI'
import { fmtDate, fmtCost } from '../utils/helpers'
import AssetDetail from '../components/AssetDetail'

export default function Disposed() {
  const { assets, employees, chain, settings } = useStore()
  const [detailId, setDI] = useState(null)
  const cur = settings?.currency || 'PKR'
  const disposed = assets.filter(a=>['Sold','Scrapped','Donated','Returned to Vendor'].includes(a.status))
  const eName = (id) => { if (!id) return '--'; if (id.startsWith('EMP')) return employees.find(e=>e.id===id)?.name||id; return id }

  return (
    <div style={{ padding:24 }}>
      <div className="ph"><div><div className="pt">Scrapped & Sold</div><div className="ps">End-of-life assets with full disposal history . {disposed.length} records</div></div></div>
      <div className="twrap">
        <table>
          <thead><tr><th>Asset ID</th><th>Type</th><th>Model</th><th>Method</th><th>Disposal Date</th><th>Sale Price</th><th>Buyer</th><th>Total Holders</th><th>Purchase Cost</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {disposed.length===0 && <tr><td colSpan={11} className="empty">No disposed assets</td></tr>}
            {disposed.map(a => {
              const evts    = chain.filter(e=>e.assetId===a.id)
              const dispEvt = evts.find(e=>['Scrapped','Sold','Donated','Returned to Vendor'].includes(e.type))
              const holders = [...new Set(evts.map(e=>e.to).filter(x=>x?.startsWith('EMP')))].length
              return (
                <tr key={a.id} onClick={()=>setDI(a.id)}>
                  <td className="td-mono">{a.id}</td>
                  <td style={{ fontSize:12 }}>{a.type}</td>
                  <td className="td-name">{a.make} {a.model}</td>
                  <td><Badge status={a.status} /></td>
                  <td style={{ fontSize:11, color:'var(--text3)' }}>{dispEvt?fmtDate(dispEvt.date):'--'}</td>
                  <td style={{ fontSize:11, fontFamily:'var(--mono)' }}>{dispEvt?.salePrice?`₨${parseFloat(dispEvt.salePrice).toLocaleString('en-PK')}`:'--'}</td>
                  <td style={{ fontSize:12 }}>{dispEvt?eName(dispEvt.to):'--'}</td>
                  <td style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text3)' }}>{holders} empl.</td>
                  <td style={{ fontSize:11, fontFamily:'var(--mono)' }}>{a.cost?`₨${parseFloat(a.cost).toLocaleString('en-PK')}`:'--'}</td>
                  <td style={{ fontSize:11, color:'var(--text3)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.notes||dispEvt?.notes||'--'}</td>
                  <td onClick={e=>e.stopPropagation()}><button className="btn btn-sm btn-ghost" onClick={()=>setDI(a.id)}>Chain</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <AssetDetail assetId={detailId} open={!!detailId} onClose={()=>setDI(null)} />
    </div>
  )
}
