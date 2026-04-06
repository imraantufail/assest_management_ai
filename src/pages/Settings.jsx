import React, { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { useToast, useConfirm } from '../components/UI'
import { exportToExcel, importFromExcel } from '../utils/excelIO'
import { generateFleetReport } from '../utils/pdfGen'

export default function Settings() {
  const store = useStore()
  const { assets, employees, chain, services, upgrades, returns, purchases, counters, settings, resetDatabase, loadSeedData, importData, updateSettings } = store
  const toast   = useToast()
  const confirm = useConfirm()
  const fileRef = useRef()
  const logoRef = useRef()
  const [orgName, setOrgName] = useState(settings?.orgName || 'My Organization')
  const [saved, setSaved] = useState(false)

  const handleSaveSettings = () => {
    updateSettings({ orgName })
    toast('Settings saved ✓', 'success')
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { updateSettings({ logo: ev.target.result }); toast('Logo updated ✓', 'success') }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleExport = () => {
    try { exportToExcel({ assets, employees, chain, services, upgrades, returns, purchases }); toast('Excel exported ✓', 'success') }
    catch (e) { toast('Export failed: ' + e.message, 'error') }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]; if (!file) return
    try {
      const data = await importFromExcel(file)
      confirm(`Import ${data.assets?.length||0} assets, ${data.employees?.length||0} employees? Current data will be replaced.`,
        () => { importData(data); toast('Data imported ✓', 'success') },
        { title:'Confirm Import', ok:'Import & Replace' })
    } catch (err) { toast('Import failed: ' + err.message, 'error') }
    e.target.value = ''
  }

  const handleReset = () => {
    confirm('This permanently deletes ALL data and resets all ID counters to zero. Your next asset will be AST-001, first employee EMP-001. This cannot be undone.',
      () => { resetDatabase(); toast('Database reset. All counters start from 1.', 'info') },
      { title:'⚠ Reset Entire Database', danger:true, ok:'Yes, Reset Everything' })
  }

  const Row = ({ title, desc, action }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
      <div><div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{title}</div>{desc && <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{desc}</div>}</div>
      <div style={{ marginLeft:16, flexShrink:0 }}>{action}</div>
    </div>
  )

  const Sec = ({ title, children }) => (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:12, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div style={{ padding:24, maxWidth:740 }}>
      <div className="ph"><div><div className="pt">Settings</div><div className="ps">Organization, import/export, database management</div></div></div>

      {/* DB stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:28 }}>
        {[
          ['Assets', assets.length, `Next: AST-${String((counters.AST||0)+1).padStart(3,'0')}`],
          ['Employees', employees.length, `Next: EMP-${String((counters.EMP||0)+1).padStart(3,'0')}`],
          ['Chain Events', chain.length, `Next: EVT-${String((counters.EVT||0)+1).padStart(3,'0')}`],
          ['Services', services.length, `Next: SVC-${String((counters.SVC||0)+1).padStart(3,'0')}`],
        ].map(([l,v,n]) => (
          <div key={l} className="stat-card">
            <div className="stat-label">{l}</div>
            <div className="stat-val" style={{ fontSize:22 }}>{v}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:4, fontFamily:'var(--mono)' }}>{n}</div>
          </div>
        ))}
      </div>

      <Sec title="Organization">
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'end', marginBottom:14 }}>
          <div className="field"><label>Organization Name</label>
            <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="My Company" />
          </div>
          <button className="btn btn-primary" onClick={handleSaveSettings}>{saved ? '✓ Saved' : 'Save'}</button>
        </div>
        <Row
          title="Custom Logo"
          desc="Upload PNG/JPG logo -- shown in PDF reports and QR code labels"
          action={<div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {settings?.logo && <img src={settings.logo} alt="logo" style={{ height:28, objectFit:'contain', borderRadius:4, border:'1px solid var(--border)' }} />}
            <input ref={logoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogo} />
            <button className="btn" onClick={() => logoRef.current.click()}>Upload Logo</button>
            {settings?.logo && <button className="btn btn-danger btn-sm" onClick={() => { updateSettings({ logo:'' }); toast('Logo removed','info') }}>Remove</button>}
          </div>}
        />
      </Sec>

      <Sec title="Export">
        <Row title="Export to Excel" desc="All data as .xlsx: Assets, Employees, Chain Log, Upgrades, Returns, Services" action={<button className="btn btn-success" onClick={handleExport}>⬇ Export Excel</button>} />
        <Row title="Fleet PDF Report" desc="Full printable PDF -- asset register, chain log, upgrades, KPI summary" action={<button className="btn btn-primary" onClick={() => { try { generateFleetReport(useStore.getState()); toast('PDF generated ✓','success') } catch(e) { toast('PDF failed: '+e.message,'error') } }}>⬇ Fleet PDF</button>} />
      </Sec>

      <Sec title="Import">
        <Row title="Import from Excel" desc="Upload a previously exported AssetFlow .xlsx -- replaces all current data"
          action={<><input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleImport} /><button className="btn" onClick={() => fileRef.current.click()}>⬆ Import Excel</button></>}
        />
      </Sec>

      <Sec title="Sample Data">
        <Row title="Load Sample Data" desc="Populate with 10 assets, 15 employees, full chain history for practice" action={<button className="btn" onClick={() => confirm('Load sample data? This replaces your current data.', () => { loadSeedData(); toast('Sample data loaded','success') }, { title:'Load Sample Data', ok:'Load' })}>Load Sample Data</button>} />
      </Sec>

      <Sec title="Danger Zone">
        <div className="dzone">
          <h4>⚠ Reset Database -- Start from Zero</h4>
          <p>Permanently deletes ALL assets, employees, chain events, upgrades, returns, service records and resets all ID counters to zero. After reset, the next asset will be <code style={{ fontFamily:'var(--mono)', fontSize:11, background:'var(--surface2)', padding:'1px 5px', borderRadius:3 }}>AST-001</code> and first employee <code style={{ fontFamily:'var(--mono)', fontSize:11, background:'var(--surface2)', padding:'1px 5px', borderRadius:3 }}>EMP-001</code>. Use this after practice runs before going live.</p>
          <button className="btn btn-danger" style={{ background:'rgba(240,93,110,.12)', border:'1px solid var(--red)' }} onClick={handleReset}>Reset Entire Database</button>
        </div>
      </Sec>

      <Sec title="About">
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.8 }}>
          <strong style={{ color:'var(--text)' }}>AssetFlow v2.0</strong> -- IT Asset Life Management System<br/>
          Built with React + Vite . Zustand state . Data persisted in browser <code style={{ fontFamily:'var(--mono)', fontSize:11 }}>localStorage</code><br/>
          Data is shared across all browser tabs in the same browser. Different browsers (Chrome/Firefox) have separate storage -- use Export/Import to sync.<br/>
          Export regularly to back up your data externally.
        </div>
      </Sec>
    </div>
  )
}
