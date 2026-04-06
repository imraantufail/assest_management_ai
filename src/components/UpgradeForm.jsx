import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

const EMPTY = { component:'RAM', fromSpec:'', toSpec:'', cost:'', vendor:'', approvedBy:'IT Manager', date:'', invoice:'', notes:'' }

export default function UpgradeForm({ upgradeId, assetId, open, onClose }) {
  const { assets, upgrades, addUpgrade, updateUpgrade, settings } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const cur = settings?.currency || 'PKR'
  const asset = assets.find(a => a.id === assetId)

  useEffect(() => {
    if (!open) return
    if (upgradeId) { const u = upgrades.find(x => x.id === upgradeId); if (u) setForm({ ...EMPTY, ...u }) }
    else {
      const pre = { RAM: asset?.ram || '', SSD: asset?.hdd || '', HDD: asset?.hdd || '' }
      setForm({ ...EMPTY, date: today(), fromSpec: pre.RAM })
    }
  }, [open, upgradeId, assetId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.toSpec.trim()) { toast('New spec is required', 'error'); return }
    if (upgradeId) { updateUpgrade(upgradeId, form); toast('Upgrade updated ✓', 'success') }
    else { addUpgrade({ ...form, assetId }); toast('Upgrade logged ✓', 'success') }
    onClose()
  }

  // Auto-fill fromSpec when component changes
  const handleComponent = (v) => {
    const map = { RAM: asset?.ram || '', SSD: asset?.hdd || '', HDD: asset?.hdd || '', Battery:'', Screen:'', Keyboard:'' }
    setForm(f => ({ ...f, component: v, fromSpec: map[v] || f.fromSpec }))
  }

  return (
    <Modal open={open} onClose={onClose} size="sm"
      title={upgradeId ? 'Edit Upgrade' : 'Log Hardware Upgrade'}
      sub={asset ? `${asset.id} -- ${asset.make} ${asset.model}` : assetId}
    >
      <div className="fg1">
        <div className="fg2">
          <div className="field"><label>Component</label>
            <select value={form.component} onChange={e => handleComponent(e.target.value)}>
              {['RAM','SSD','HDD','Battery','Screen','Keyboard','Motherboard','GPU','CPU','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="field"><label>From (old spec)</label>
            <input value={form.fromSpec} onChange={e => set('fromSpec', e.target.value)} placeholder="e.g. 8GB DDR4" />
          </div>
          <div className="field"><label>To (new spec) *</label>
            <input value={form.toSpec} onChange={e => set('toSpec', e.target.value)} placeholder="e.g. 16GB DDR4" />
          </div>
          <div className="field"><label>Cost ({cur})</label>
            <input value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="8500" />
          </div>
          <div className="field"><label>Invoice No.</label>
            <input value={form.invoice} onChange={e => set('invoice', e.target.value)} placeholder="INV-2024-001" />
          </div>
        </div>
        <div className="field"><label>Vendor / Technician</label>
          <input value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="Internal IT / vendor name" />
        </div>
        <div className="field"><label>Approved By</label>
          <input value={form.approvedBy} onChange={e => set('approvedBy', e.target.value)} />
        </div>
        <div className="field"><label>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Reason for upgrade, remarks..." style={{ minHeight:60 }} />
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>{upgradeId ? 'Save Changes' : 'Log Upgrade'}</button>
      </div>
    </Modal>
  )
}
