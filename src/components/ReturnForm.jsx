import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

const EMPTY = { empId:'', returnDate:'', condition:'Good', datawipe:'Yes', accessories:'Charger', checkedBy:'IT Manager', notes:'', signedOff:false }

export default function ReturnForm({ assetId, open, onClose }) {
  const { assets, employees, returns, addReturn } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const asset = assets.find(a => a.id === assetId)

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY, empId: asset?.assignedTo || '', returnDate: today() })
  }, [open, assetId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.empId) { toast('Select returning employee', 'error'); return }
    addReturn({ ...form, assetId })
    toast('Asset return recorded ✓', 'success')
    onClose()
  }

  const allEmps = employees

  return (
    <Modal open={open} onClose={onClose} size="sm"
      title="Asset Return Form"
      sub={asset ? `${asset.id} -- ${asset.make} ${asset.model}` : assetId}
    >
      <div className="fg1">
        <div className="field"><label>Returning Employee *</label>
          <select value={form.empId} onChange={e => set('empId', e.target.value)}>
            <option value="">-- Select employee --</option>
            {allEmps.map(e=><option key={e.id} value={e.id}>{e.name} ({e.dept}{e.status==='Left'?' . Left':''})</option>)}
          </select>
        </div>
        <div className="fg2">
          <div className="field"><label>Return Date</label>
            <input type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} />
          </div>
          <div className="field"><label>Condition on Return</label>
            <select value={form.condition} onChange={e => set('condition', e.target.value)}>
              {['Excellent','Good','Fair','Damaged','Missing Parts'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Data Wipe Done?</label>
            <select value={form.datawipe} onChange={e => set('datawipe', e.target.value)}>
              <option>Yes</option><option>No</option><option>N/A</option>
            </select>
          </div>
          <div className="field"><label>Accessories Returned</label>
            <input value={form.accessories} onChange={e => set('accessories', e.target.value)} placeholder="Charger, Bag, Mouse..." />
          </div>
        </div>
        <div className="field"><label>Checked / Received By</label>
          <input value={form.checkedBy} onChange={e => set('checkedBy', e.target.value)} placeholder="IT Manager" />
        </div>
        <div className="field"><label>Notes / Remarks</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any damage, missing items, remarks..." style={{ minHeight:60 }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input type="checkbox" id="signedOff" checked={form.signedOff} onChange={e => set('signedOff', e.target.checked)} style={{ width:16, height:16, cursor:'pointer' }} />
          <label htmlFor="signedOff" style={{ fontSize:13, color:'var(--text2)', cursor:'pointer', textTransform:'none', letterSpacing:'normal', fontWeight:400 }}>
            Employee has signed off the return form
          </label>
        </div>
      </div>
      <div style={{ background:'rgba(52,217,155,.06)', border:'1px solid rgba(52,217,155,.2)', borderRadius:'var(--r)', padding:'10px 14px', marginTop:14, fontSize:12, color:'var(--text2)' }}>
        <strong style={{ color:'var(--green)' }}>Note:</strong> Submitting this form will set the asset status to <strong>In Stock</strong> and unassign it from the employee.
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Submit Return</button>
      </div>
    </Modal>
  )
}
