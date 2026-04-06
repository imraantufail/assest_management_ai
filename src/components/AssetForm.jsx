import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

const EMPTY = {
  type:'Laptop', make:'', model:'', serial:'',
  ram:'', hdd:'', generation:'', screenSize:'',
  purchaseDate:'', cost:'', warranty:'', status:'Active',
  assignedTo:'', dept:'', location:'', notes:'',
}

export default function AssetForm({ assetId, open, onClose }) {
  const { assets, employees, addAsset, updateAsset, settings } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const cur = settings?.currency || 'PKR'

  useEffect(() => {
    if (!open) return
    if (assetId) { const a = assets.find(x => x.id === assetId); if (a) setForm({ ...EMPTY, ...a }) }
    else setForm({ ...EMPTY, purchaseDate: today() })
  }, [open, assetId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.model.trim())  { toast('Model is required', 'error'); return }
    if (!form.serial.trim()) { toast('Serial number is required', 'error'); return }
    if (assetId) { updateAsset(assetId, form); toast('Asset updated ✓', 'success') }
    else { addAsset(form); toast('Asset added ✓', 'success') }
    onClose()
  }

  const active = employees.filter(e => e.status === 'Active')
  const former = employees.filter(e => e.status === 'Left')

  return (
    <Modal open={open} onClose={onClose} title={assetId ? 'Edit Asset' : 'New Asset'} sub={assetId || 'Register a new device'} size="lg">
      <div className="fsep">Device Identity</div>
      <div className="fg2">
        <div className="field"><label>Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}>
            {['Laptop','Desktop','Monitor','Docking Station','Printer','Server','Tablet','Other'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field"><label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {['Active','In Stock','Under Repair','Warranty Expired'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Make / Brand *</label>
          <input value={form.make} onChange={e => set('make', e.target.value)} placeholder="Dell, HP, Apple..." />
        </div>
        <div className="field"><label>Model *</label>
          <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="XPS 15 9500" />
        </div>
        <div className="field span2"><label>Serial Number *</label>
          <input value={form.serial} onChange={e => set('serial', e.target.value)} placeholder="e.g. DL-XPS-9500-001" />
        </div>
      </div>

      <div className="fsep">Specifications</div>
      <div className="fg2">
        <div className="field"><label>Generation / Processor</label>
          <input value={form.generation} onChange={e => set('generation', e.target.value)} placeholder="13th Gen Intel / Apple M3" />
        </div>
        <div className="field"><label>RAM</label>
          <input value={form.ram} onChange={e => set('ram', e.target.value)} placeholder="16GB DDR5" />
        </div>
        <div className="field"><label>HDD / SSD Size</label>
          <input value={form.hdd} onChange={e => set('hdd', e.target.value)} placeholder="512GB NVMe SSD" />
        </div>
        <div className="field"><label>Screen Size</label>
          <input value={form.screenSize} onChange={e => set('screenSize', e.target.value)} placeholder='15.6" / N/A' />
        </div>
      </div>

      <div className="fsep">Purchase & Warranty</div>
      <div className="fg3">
        <div className="field"><label>Purchase Date</label>
          <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
        </div>
        <div className="field"><label>Cost ({cur})</label>
          <input value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="285000" />
        </div>
        <div className="field"><label>Warranty Expiry</label>
          <input type="date" value={form.warranty} onChange={e => set('warranty', e.target.value)} />
        </div>
      </div>

      <div className="fsep">Assignment</div>
      <div className="fg2">
        <div className="field"><label>Assign To</label>
          <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
            <option value="">-- Unassigned / IT Store --</option>
            <optgroup label="Active Employees">{active.map(e=><option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}</optgroup>
            {former.length > 0 && <optgroup label="Former Employees">{former.map(e=><option key={e.id} value={e.id}>{e.name} (Left)</option>)}</optgroup>}
          </select>
        </div>
        <div className="field"><label>Department</label>
          <input value={form.dept} onChange={e => set('dept', e.target.value)} placeholder="Engineering" />
        </div>
        <div className="field span2"><label>Location / Office</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Lahore HQ" />
        </div>
      </div>
      <div className="fg1" style={{ marginTop:12 }}>
        <div className="field"><label>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any remarks..." />
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>{assetId ? 'Save Changes' : 'Add Asset'}</button>
      </div>
    </Modal>
  )
}
