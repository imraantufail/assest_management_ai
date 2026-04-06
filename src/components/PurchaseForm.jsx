import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

const EMPTY = { buyerName:'', buyerEmpId:'', saleDate:'', salePrice:'', paymentMethod:'Bank Transfer', invoiceNo:'', approvedBy:'Management', notes:'', signedOff:false }

export default function PurchaseForm({ assetId, open, onClose }) {
  const { assets, employees, addPurchase, settings } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const cur = settings?.currency || 'PKR'
  const asset = assets.find(a => a.id === assetId)

  useEffect(() => {
    if (!open) return
    const holder = asset?.assignedTo ? employees.find(e => e.id === asset.assignedTo) : null
    setForm({ ...EMPTY, saleDate: today(), buyerEmpId: asset?.assignedTo || '', buyerName: holder?.name || '' })
  }, [open, assetId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleEmpSelect = (empId) => {
    const emp = employees.find(e => e.id === empId)
    setForm(f => ({ ...f, buyerEmpId: empId, buyerName: emp ? emp.name : f.buyerName }))
  }

  const save = () => {
    if (!form.buyerName.trim()) { toast('Buyer name is required', 'error'); return }
    if (!form.salePrice)        { toast('Sale price is required', 'error'); return }
    addPurchase({ ...form, assetId })
    toast('Employee purchase recorded ✓', 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm"
      title="Employee Asset Purchase"
      sub={asset ? `${asset.id} -- ${asset.make} ${asset.model}` : assetId}
    >
      <div className="fg1">
        <div style={{ background:'rgba(167,139,250,.08)', border:'1px solid rgba(167,139,250,.2)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:12, color:'var(--text2)' }}>
          <strong style={{ color:'var(--purple)' }}>Employee Purchase:</strong> Use this form when a company employee buys a company asset. The asset will be marked as <strong>Sold</strong> and a sale event will be logged.
        </div>
        <div className="field"><label>Buyer (Employee)</label>
          <select value={form.buyerEmpId} onChange={e => handleEmpSelect(e.target.value)}>
            <option value="">-- Select employee (optional) --</option>
            {employees.map(e=><option key={e.id} value={e.id}>{e.name} ({e.dept}{e.status==='Left'?' . Left':''})</option>)}
          </select>
        </div>
        <div className="field"><label>Buyer Full Name *</label>
          <input value={form.buyerName} onChange={e => set('buyerName', e.target.value)} placeholder="Full name of buyer" />
        </div>
        <div className="fg2">
          <div className="field"><label>Sale Date</label>
            <input type="date" value={form.saleDate} onChange={e => set('saleDate', e.target.value)} />
          </div>
          <div className="field"><label>Sale Price ({cur}) *</label>
            <input value={form.salePrice} onChange={e => set('salePrice', e.target.value)} placeholder="45000" />
          </div>
          <div className="field"><label>Payment Method</label>
            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
              {['Bank Transfer','Cash','Cheque','Salary Deduction'].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field"><label>Invoice No.</label>
            <input value={form.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} placeholder="SALE-2024-001" />
          </div>
        </div>
        <div className="field"><label>Approved By</label>
          <input value={form.approvedBy} onChange={e => set('approvedBy', e.target.value)} />
        </div>
        <div className="field"><label>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any remarks..." style={{ minHeight:56 }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input type="checkbox" id="purSigned" checked={form.signedOff} onChange={e => set('signedOff', e.target.checked)} style={{ width:16, height:16, cursor:'pointer' }} />
          <label htmlFor="purSigned" style={{ fontSize:13, color:'var(--text2)', cursor:'pointer', textTransform:'none', letterSpacing:'normal', fontWeight:400 }}>
            Purchase agreement signed by both parties
          </label>
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Confirm Sale</button>
      </div>
    </Modal>
  )
}
