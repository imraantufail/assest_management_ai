import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

export default function DisposeModal({ assetId, open, onClose }) {
  const { assets, disposeAsset, settings } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ method:'Scrapped', date:today(), salePrice:'', buyer:'', approvedBy:'Management', notes:'' })
  const asset = assets.find(a => a.id === assetId)
  const cur = settings?.currency || 'PKR'

  useEffect(() => { if (open) setForm({ method:'Scrapped', date:today(), salePrice:'', buyer:'', approvedBy:'Management', notes:'' }) }, [open])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    disposeAsset(assetId, form)
    toast(`Asset marked as ${form.method} ✓`, 'info')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Dispose / Sell Asset" sub={asset ? `${asset.id} -- ${asset.make} ${asset.model}` : ''}>
      <div className="fg1">
        <div className="field"><label>Method</label>
          <select value={form.method} onChange={e => set('method', e.target.value)}>
            {['Scrapped','Sold','Donated','Returned to Vendor'].map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="fg2">
          <div className="field"><label>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="field"><label>Sale Price ({cur})</label>
            <input value={form.salePrice} onChange={e => set('salePrice', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="field"><label>Buyer / Recipient</label>
          <input value={form.buyer} onChange={e => set('buyer', e.target.value)} placeholder="Name or organization" />
        </div>
        <div className="field"><label>Approved By</label>
          <input value={form.approvedBy} onChange={e => set('approvedBy', e.target.value)} />
        </div>
        <div className="field"><label>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Data wipe confirmed? Reason..." style={{ minHeight:56 }} />
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" style={{ background:'rgba(240,93,110,.15)', border:'1px solid var(--red)' }} onClick={save}>Confirm Disposal</button>
      </div>
    </Modal>
  )
}
