import React, { useState, useEffect } from 'react'
import { Modal, useToast } from './UI'
import { useStore } from '../store/useStore'
import { today } from '../utils/helpers'

const EMPTY = { name:'', dept:'', role:'', join:'', status:'Active', left:'' }

export default function EmployeeForm({ empId, open, onClose }) {
  const { employees, addEmployee, updateEmployee } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (empId) { const e = employees.find(x => x.id === empId); if (e) setForm({ ...EMPTY, ...e }) }
    else setForm({ ...EMPTY, join: today() })
  }, [open, empId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return }
    if (empId) { updateEmployee(empId, form); toast('Employee updated ✓', 'success') }
    else { addEmployee(form); toast('Employee added ✓', 'success') }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" title={empId ? 'Edit Employee' : 'Add Employee'} sub={empId || 'Register staff member'}>
      <div className="fg1">
        <div className="fg2">
          <div className="field"><label>Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ali Hassan" />
          </div>
          <div className="field"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Active</option><option>Left</option>
            </select>
          </div>
          <div className="field"><label>Department</label>
            <input value={form.dept} onChange={e => set('dept', e.target.value)} placeholder="Engineering" />
          </div>
          <div className="field"><label>Role / Designation</label>
            <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Software Engineer" />
          </div>
          <div className="field"><label>Join Date</label>
            <input type="date" value={form.join} onChange={e => set('join', e.target.value)} />
          </div>
          {form.status === 'Left' && (
            <div className="field"><label>Leaving Date</label>
              <input type="date" value={form.left} onChange={e => set('left', e.target.value)} />
            </div>
          )}
        </div>
      </div>
      <div className="factions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>{empId ? 'Save Changes' : 'Add Employee'}</button>
      </div>
    </Modal>
  )
}
