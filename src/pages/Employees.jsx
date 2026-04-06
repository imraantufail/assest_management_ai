import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Avatar, Badge, Modal, useToast, useConfirm } from '../components/UI'
import { fmtDate } from '../utils/helpers'
import EmployeeForm from '../components/EmployeeForm'
import AssetDetail from '../components/AssetDetail'

export default function Employees() {
  const { employees, assets, chain, deleteEmployee } = useStore()
  const toast   = useToast()
  const confirm = useConfirm()
  const [search,  setSearch]  = useState('')
  const [fStatus, setFStatus] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editId,  setEditId]  = useState(null)
  const [detailEmp, setDE]    = useState(null)
  const [detailAId, setDA]    = useState(null)

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    return (!q || e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      && (!fStatus || e.status === fStatus)
  })

  const handleDelete = (e) => {
    const cur = assets.filter(a => a.assignedTo === e.id).length
    confirm(
      cur > 0 ? `${e.name} holds ${cur} asset(s). They'll be unassigned. Continue?` : `Delete ${e.name} (${e.id})? Chain history is preserved.`,
      () => { deleteEmployee(e.id); toast(`${e.name} removed`, 'info') },
      { title:'Delete Employee', danger:true, ok:'Delete' }
    )
  }

  return (
    <div style={{ padding:24 }}>
      <div className="ph">
        <div>
          <div className="pt">Employees</div>
          <div className="ps">{employees.filter(e=>e.status==='Active').length} active . {employees.filter(e=>e.status==='Left').length} former . assets are independent of turnover</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setAddOpen(true)}>+ Add Employee</button>
      </div>
      <div className="fbar">
        <input placeholder="Search name, department, ID..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="">All</option><option>Active</option><option>Left</option></select>
        {(search||fStatus) && <button className="btn btn-ghost btn-sm" onClick={()=>{setSearch('');setFStatus('')}}>Clear</button>}
      </div>
      <div className="emp-grid">
        {filtered.length===0 && <div className="empty" style={{ gridColumn:'1/-1' }}>No employees match filter</div>}
        {filtered.map(e => {
          const curAssets = assets.filter(a=>a.assignedTo===e.id)
          const totalHeld = [...new Set(chain.filter(c=>c.to===e.id||c.from===e.id).map(c=>c.assetId))].length
          return (
            <div key={e.id} className="emp-card" onClick={()=>setDE(e)}>
              <Avatar name={e.name} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontWeight:500, color:'var(--text)', fontSize:13 }}>{e.name}</span>
                  <span className={`badge ${e.status==='Active'?'badge-empactive':'badge-left'}`}>{e.status}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{e.role} . {e.dept}</div>
                <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:1 }}>{e.id}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--text)' }}>{curAssets.length} asset{curAssets.length!==1?'s':''}</div>
                <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)' }}>{totalHeld} held total</div>
                <div style={{ display:'flex', gap:4, marginTop:6, justifyContent:'flex-end' }} onClick={ev=>ev.stopPropagation()}>
                  <button className="btn btn-icon btn-ghost" onClick={()=>setEditId(e.id)}>✏</button>
                  <button className="btn btn-icon btn-danger" onClick={()=>handleDelete(e)}>✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {detailEmp && (
        <Modal open={!!detailEmp} onClose={()=>setDE(null)} size="sm" title={detailEmp.name} sub={`${detailEmp.id} . ${detailEmp.dept}`}>
          <div className="dgrid" style={{ marginBottom:16 }}>
            {[['ID',detailEmp.id],['Status',detailEmp.status],['Dept',detailEmp.dept],['Role',detailEmp.role],['Joined',fmtDate(detailEmp.join)],['Left',detailEmp.status==='Left'?fmtDate(detailEmp.left):'--']].map(([l,v])=>(
              <div key={l}><div className="dl">{l}</div><div className="dv">{v}</div></div>
            ))}
          </div>
          {(() => {
            const cur = assets.filter(a=>a.assignedTo===detailEmp.id)
            return cur.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:8 }}>Current Assets ({cur.length})</div>
                {cur.map(a=>(
                  <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span className="td-mono">{a.id}</span>
                    <span style={{ fontSize:13, color:'var(--text)', flex:1 }}>{a.make} {a.model}</span>
                    <Badge status={a.status} />
                    <button className="btn btn-sm btn-ghost" onClick={()=>{setDE(null);setDA(a.id)}}>View</button>
                  </div>
                ))}
              </div>
            )
          })()}
          {(() => {
            const heldIds = [...new Set(chain.filter(c=>c.to===detailEmp.id||c.from===detailEmp.id).map(c=>c.assetId))]
            const past = heldIds.filter(id=>!assets.find(a=>a.id===id&&a.assignedTo===detailEmp.id))
            return past.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:8 }}>Previously Held ({past.length})</div>
                {past.map(id=>{const a=assets.find(x=>x.id===id);return a?(
                  <div key={id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                    <span className="td-mono">{a.id}</span>
                    <span style={{ fontSize:12, color:'var(--text2)', flex:1 }}>{a.make} {a.model}</span>
                    <Badge status={a.status} />
                    <button className="btn btn-sm btn-ghost" onClick={()=>{setDE(null);setDA(a.id)}}>View</button>
                  </div>
                ):null})}
              </div>
            )
          })()}
          <div className="factions" style={{ paddingTop:14 }}>
            <button className="btn" onClick={()=>setDE(null)}>Close</button>
            <button className="btn btn-primary" onClick={()=>{setEditId(detailEmp.id);setDE(null)}}>Edit</button>
          </div>
        </Modal>
      )}
      <EmployeeForm open={addOpen} onClose={()=>setAddOpen(false)} />
      <EmployeeForm empId={editId} open={!!editId} onClose={()=>setEditId(null)} />
      <AssetDetail assetId={detailAId} open={!!detailAId} onClose={()=>setDA(null)} />
    </div>
  )
}
