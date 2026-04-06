import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

export default function TransferModal({ assetId, open, onClose }) {
  const { assets, employees, transferAsset } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ toId:'', dept:'', location:'', date:today(), reason:'Role Change', approvedBy:'IT Manager', notes:'' })
  const asset = assets.find(a => a.id === assetId)

  useEffect(() => {
    if (open) setForm({ toId:'', dept:'', location:'', date:today(), reason:'Role Change', approvedBy:'IT Manager', notes:'' })
  }, [open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const active = employees.filter(e => e.status === 'Active')

  const save = () => {
    if (!form.toId) { toast('Select an employee', 'error'); return }
    transferAsset(assetId, form)
    toast('Asset transferred ✓', 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Transfer Asset" sub={asset ? `${asset.id} -- ${asset.make} ${asset.model}` : ''}>
      <div className="fg1">
        <div className="field"><label>Transfer To *</label>
          <select value={form.toId} onChange={e => set('toId', e.target.value)}>
            <option value="">-- Select employee --</option>
            {active.map(e=><option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
          </select>
        </div>
        <div className="fg2">
          <div className="field"><label>Department</label>
            <input value={form.dept} onChange={e => set('dept', e.target.value)} placeholder="Department" />
          </div>
          <div className="field"><label>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Office" />
          </div>
          <div className="field"><label>Transfer Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="field"><label>Reason</label>
            <select value={form.reason} onChange={e => set('reason', e.target.value)}>
              {['Role Change','New Joiner','Repair Return','Department Move','Temp Loan','Upgrade','Employee Left','Other'].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>Approved By</label>
          <input value={form.approvedBy} onChange={e => set('approvedBy', e.target.value)} />
        </div>
        <div className="field"><label>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Condition at transfer..." style={{ minHeight:56 }} />
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Confirm Transfer</button>
      </div>
    </Modal>
  )
}
