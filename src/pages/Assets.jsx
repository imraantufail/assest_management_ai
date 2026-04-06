import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Badge, useToast, useConfirm } from '../components/UI'
import { fmtDate, fmtCost, warrantyStatus } from '../utils/helpers'
import AssetForm from '../components/AssetForm'
import AssetDetail from '../components/AssetDetail'
import TransferModal from '../components/TransferModal'
import DisposeModal from '../components/DisposeModal'

export default function Assets() {
  const { assets, employees, chain, settings, deleteAsset } = useStore()
  const toast   = useToast()
  const confirm = useConfirm()
  const cur     = settings?.currency || 'PKR'

  const [search,   setSearch]   = useState('')
  const [fStatus,  setFStatus]  = useState('')
  const [fType,    setFType]    = useState('')
  const [addOpen,  setAddOpen]  = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [tfId,     setTfId]     = useState(null)
  const [dpId,     setDpId]     = useState(null)

  const eName = (id) => id ? employees.find(e => e.id === id)?.name || null : null

  const filtered = assets.filter(a => {
    const q = search.toLowerCase()
    const match = !q || a.id.toLowerCase().includes(q) || a.model.toLowerCase().includes(q)
      || a.serial.toLowerCase().includes(q) || (a.make||'').toLowerCase().includes(q)
      || (eName(a.assignedTo)||'').toLowerCase().includes(q)
      || (a.dept||'').toLowerCase().includes(q) || (a.generation||'').toLowerCase().includes(q)
    return match && (!fStatus || a.status === fStatus) && (!fType || a.type === fType)
  })

  const handleDelete = (a) => {
    confirm(
      `Delete ${a.make} ${a.model} (${a.id})? All chain events, services, and upgrades for this asset will be removed permanently.`,
      () => { deleteAsset(a.id); toast(`${a.id} deleted`, 'info') },
      { title:'Delete Asset', danger:true, ok:'Delete Asset' }
    )
  }

  return (
    <div style={{ padding:24 }}>
      <div className="ph">
        <div>
          <div className="pt">Asset Register</div>
          <div className="ps">{filtered.length} of {assets.length} assets . devices rotate between employees independently</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ New Asset</button>
      </div>

      <div className="fbar">
        <input placeholder="Search ID, make, model, serial, employee, department..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Active','In Stock','Under Repair','Warranty Expired','Sold','Scrapped'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={fType} onChange={e => setFType(e.target.value)}>
          <option value="">All Types</option>
          {['Laptop','Desktop','Monitor','Docking Station','Printer','Server','Tablet','Other'].map(t=><option key={t}>{t}</option>)}
        </select>
        {(search||fStatus||fType) && <button className="btn btn-ghost btn-sm" onClick={()=>{setSearch('');setFStatus('');setFType('')}}>Clear</button>}
      </div>

      <div className="twrap">
        <table>
          <thead>
            <tr>
              <th>Asset ID</th><th>Type</th><th>Make / Model</th><th>Serial</th>
              <th>Generation</th><th>RAM</th><th>HDD/SSD</th>
              <th>Status</th><th>Holder</th><th>Dept</th>
              <th>Holders</th><th>Cost</th><th>Warranty</th>
              <th style={{ textAlign:'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={14} className="empty">No assets match filter</td></tr>}
            {filtered.map(a => {
              const evts    = chain.filter(e => e.assetId === a.id)
              const holders = [...new Set(evts.map(e=>e.to).filter(x=>x?.startsWith('EMP')))].length
              const holder  = eName(a.assignedTo)
              const ws      = warrantyStatus(a.warranty)
              return (
                <tr key={a.id} onClick={() => setDetailId(a.id)}>
                  <td className="td-mono">{a.id}</td>
                  <td style={{ fontSize:12 }}>{a.type}</td>
                  <td className="td-name">{a.make ? `${a.make} ${a.model}` : a.model}</td>
                  <td className="td-mono">{a.serial}</td>
                  <td style={{ fontSize:11, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.generation||'--'}</td>
                  <td style={{ fontSize:11 }}>{a.ram||'--'}</td>
                  <td style={{ fontSize:11 }}>{a.hdd||'--'}</td>
                  <td><Badge status={a.status} /></td>
                  <td style={{ fontSize:12 }}>{holder ? <span style={{ color:'var(--text)' }}>{holder}</span> : <span style={{ color:'var(--text3)' }}>Unassigned</span>}</td>
                  <td style={{ fontSize:11 }}>{a.dept||'--'}</td>
                  <td><span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text3)' }}>{holders}</span></td>
                  <td style={{ fontSize:11, fontFamily:'var(--mono)' }}>{a.cost ? `₨${parseFloat(a.cost).toLocaleString('en-PK')}` : '--'}</td>
                  <td>{ws ? <span className={`badge ${ws.cls}`}>{ws.label}</span> : '--'}</td>
                  <td className="td-act" onClick={e=>e.stopPropagation()}>
                    <div style={{ display:'flex', gap:3, justifyContent:'flex-end' }}>
                      <button className="btn btn-icon" data-tip="Edit" onClick={()=>setEditId(a.id)}>✏</button>
                      {!['Sold','Scrapped'].includes(a.status) && <>
                        <button className="btn btn-icon" data-tip="Transfer" onClick={()=>setTfId(a.id)}>↗</button>
                        <button className="btn btn-icon" data-tip="Dispose" onClick={()=>setDpId(a.id)}>🗑</button>
                      </>}
                      <button className="btn btn-icon btn-danger" data-tip="Delete" onClick={()=>handleDelete(a)}>✕</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AssetForm open={addOpen} onClose={()=>setAddOpen(false)} />
      <AssetForm assetId={editId} open={!!editId} onClose={()=>setEditId(null)} />
      <AssetDetail assetId={detailId} open={!!detailId} onClose={()=>setDetailId(null)} />
      <TransferModal assetId={tfId} open={!!tfId} onClose={()=>setTfId(null)} />
      <DisposeModal assetId={dpId} open={!!dpId} onClose={()=>setDpId(null)} />
    </div>
  )
}
