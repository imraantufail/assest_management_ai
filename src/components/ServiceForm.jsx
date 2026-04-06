import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

const EMPTY = { type:'Preventive Maintenance', date:'', tech:'', cost:'0', issue:'', nextDue:'', status:'Done' }

export default function ServiceForm({ serviceId, assetId, open, onClose }) {
  const { services, assets, settings, addService, updateService } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const cur = settings?.currency || 'PKR'
  const asset = assets.find(a => a.id === assetId)

  useEffect(() => {
    if (!open) return
    if (serviceId) { const s = services.find(x => x.id === serviceId); if (s) setForm({ ...EMPTY, ...s }) }
    else setForm({ ...EMPTY, date: today() })
  }, [open, serviceId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = () => {
    if (!form.issue.trim()) { toast('Issue description required', 'error'); return }
    if (serviceId) { updateService(serviceId, form); toast('Service updated ✓', 'success') }
    else { addService({ ...form, assetId }); toast('Service logged ✓', 'success') }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm"
      title={serviceId ? 'Edit Service Record' : 'Log Service Event'}
      sub={asset ? `${asset.id} -- ${asset.make} ${asset.model}` : assetId}
    >
      <div className="fg1">
        <div className="fg2">
          <div className="field"><label>Service Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {['Preventive Maintenance','Corrective Repair','Hardware Upgrade','Software Issue','Inspection','Battery Check','OS Reinstall','Other'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {['Done','In Progress','Pending','Cancelled'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="field"><label>Cost ({cur})</label>
            <input value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="field"><label>Technician / Vendor</label>
          <input value={form.tech} onChange={e => set('tech', e.target.value)} placeholder="Internal IT or vendor name" />
        </div>
        <div className="field"><label>Issue / Work Done *</label>
          <textarea value={form.issue} onChange={e => set('issue', e.target.value)} placeholder="Describe what was done..." />
        </div>
        <div className="field"><label>Next Service Due</label>
          <input type="date" value={form.nextDue} onChange={e => set('nextDue', e.target.value)} />
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>{serviceId ? 'Save Changes' : 'Log Service'}</button>
      </div>
    </Modal>
  )
}
