import React, { useState } from 'react'
import { Modal, Badge, ChainTimeline, Tabs, useToast, useConfirm } from './UI'
import { useStore } from '../store/useStore'
import { fmtDate, fmtCost, warrantyStatus } from '../utils/helpers'
import { generateAssetReport } from '../utils/pdfGen'
import AssetForm from './AssetForm'
import TransferModal from './TransferModal'
import DisposeModal from './DisposeModal'
import ReturnForm from './ReturnForm'
import PurchaseForm from './PurchaseForm'
import UpgradeForm from './UpgradeForm'
import ServiceForm from './ServiceForm'
import QRModal from './QRModal'

export default function AssetDetail({ assetId, open, onClose }) {
  const store = useStore()
  const { assets, employees, chain, services, upgrades, returns, purchases, settings, deleteService, deleteUpgrade } = store
  const toast   = useToast()
  const confirm = useConfirm()
  const [tab, setTab]     = useState('info')
  const [editOpen, setE]  = useState(false)
  const [tfOpen,   setTf] = useState(false)
  const [dpOpen,   setDp] = useState(false)
  const [retOpen,  setRet]= useState(false)
  const [purOpen,  setPur]= useState(false)
  const [upgOpen,  setUpg]= useState(false)
  const [svcOpen,  setSvc]= useState(false)
  const [qrOpen,   setQr] = useState(false)
  const [editSvcId,  setEsvc] = useState(null)
  const [editUpgId,  setEupg] = useState(null)
  const cur = settings?.currency || 'PKR'

  const a = assets.find(x => x.id === assetId)
  if (!a) return null

  const assetChain = chain.filter(e => e.assetId === assetId)
  const assetSvcs  = services.filter(s => s.assetId === assetId)
  const assetUpgs  = upgrades.filter(u => u.assetId === assetId)
  const assetRets  = returns.filter(r => r.assetId === assetId)
  const assetPurs  = purchases.filter(p => p.assetId === assetId)
  const holder     = a.assignedTo ? employees.find(e => e.id === a.assignedTo) : null
  const wStatus    = warrantyStatus(a.warranty)
  const holders    = [...new Set(assetChain.map(e => e.to).filter(x => x?.startsWith('EMP')))].length

  const eName = (id) => {
    if (!id) return '--'
    if (id.startsWith('EMP')) return employees.find(e => e.id === id)?.name || id
    return id
  }

  const isDisposed = ['Sold','Scrapped'].includes(a.status)

  const TABS = [
    { key:'info',     label:'Info' },
    { key:'chain',    label:`Chain (${assetChain.length})` },
    { key:'upgrades', label:`Upgrades (${assetUpgs.length})` },
    { key:'service',  label:`Service (${assetSvcs.length})` },
    { key:'returns',  label:`Returns (${assetRets.length})` },
  ]

  const close = () => { onClose(); }

  return (
    <>
    <Modal open={open} onClose={close} size="xl"
      title={`${a.make} ${a.model}`}
      sub={`${a.id} . S/N: ${a.serial}`}
    >
      {/* Action bar */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <Badge status={a.status} />
        <span style={{ flex:1 }} />
        <button className="btn btn-sm" onClick={() => { close(); setTimeout(() => setE(true), 60) }}>✏ Edit</button>
        <button className="btn btn-sm" onClick={() => setQr(true)}>QR QR</button>
        {!isDisposed && <>
          <button className="btn btn-sm" onClick={() => setTf(true)}>↗ Transfer</button>
          <button className="btn btn-sm" onClick={() => setRet(true)}>↩ Return</button>
          <button className="btn btn-sm" onClick={() => { close(); setTimeout(() => setDp(true), 60) }}>🗑 Dispose</button>
          <button className="btn btn-sm" onClick={() => { close(); setTimeout(() => setPur(true), 60) }}>💰 Sell to Employee</button>
        </>}
        <button className="btn btn-sm btn-primary" onClick={() => generateAssetReport(assetId, useStore.getState())}>⬇ PDF</button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* INFO */}
      {tab === 'info' && (
        <div className="dgrid">
          {[
            ['Asset ID', a.id], ['Type', a.type],
            ['Make / Brand', a.make || '--'], ['Model', a.model],
            ['Serial Number', a.serial], ['Status', <Badge key="s" status={a.status} />],
            ['Generation', a.generation || '--'], ['RAM', a.ram || '--'],
            ['HDD / SSD', a.hdd || '--'], ['Screen Size', a.screenSize || '--'],
            ['Current Holder', holder ? `${holder.name} (${holder.dept})` : '-- Unassigned'],
            ['Total Holders (all-time)', `${holders} employee${holders!==1?'s':''}`],
            ['Department', a.dept || '--'], ['Location', a.location || '--'],
            ['Purchase Date', fmtDate(a.purchaseDate)],
            ['Purchase Cost', fmtCost(a.cost, cur)],
            ['Warranty Expiry', fmtDate(a.warranty)],
            ['Warranty Status', wStatus ? <span key="w" className={`badge ${wStatus.cls}`}>{wStatus.label}</span> : '--'],
            ['Chain Events', assetChain.length],
            ['Notes', a.notes || '--'],
          ].map(([l,v]) => (
            <div key={l}><div className="dl">{l}</div><div className="dv">{v}</div></div>
          ))}
        </div>
      )}

      {/* CHAIN */}
      {tab === 'chain' && (
        <div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>
            Full custody trail -- every person who held this device, from purchase to today
          </div>
          <ChainTimeline events={assetChain} employees={employees} />
        </div>
      )}

      {/* UPGRADES */}
      {tab === 'upgrades' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Hardware upgrades logged for this device</span>
            <button className="btn btn-sm btn-primary" onClick={() => { setEupg(null); setUpg(true) }}>+ Log Upgrade</button>
          </div>
          {assetUpgs.length === 0 ? <div className="empty">No upgrades recorded</div>
            : assetUpgs.map(u => (
              <div key={u.id} className="chain-step">
                <div className="chain-icon ci-upgrade">⚡</div>
                <div className="chain-body">
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div className="chain-label">{u.component} Upgrade</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => { setEupg(u.id); setUpg(true) }}>Edit</button>
                      <button className="btn btn-sm btn-danger btn-ghost" onClick={() => confirm('Delete this upgrade record?', () => { deleteUpgrade(u.id); toast('Deleted','info') }, { title:'Delete Upgrade', danger:true, ok:'Delete' })}>✕</button>
                    </div>
                  </div>
                  <div className="chain-meta">{fmtDate(u.date)} . {u.vendor} . {fmtCost(u.cost, cur)}{u.invoice ? ` . ${u.invoice}` : ''}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>
                    <span style={{ color:'var(--red)' }}>{u.fromSpec || '--'}</span>
                    <span style={{ color:'var(--text3)', margin:'0 6px' }}>→</span>
                    <span style={{ color:'var(--green)' }}>{u.toSpec}</span>
                  </div>
                  {u.notes && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{u.notes}</div>}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* SERVICE */}
      {tab === 'service' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Maintenance & repair history</span>
            <button className="btn btn-sm btn-primary" onClick={() => { setEsvc(null); setSvc(true) }}>+ Log Service</button>
          </div>
          {assetSvcs.length === 0 ? <div className="empty">No service records</div>
            : assetSvcs.map(s => (
              <div key={s.id} className="chain-step">
                <div className="chain-icon ci-repair">🔧</div>
                <div className="chain-body">
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div className="chain-label">{s.type}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => { setEsvc(s.id); setSvc(true) }}>Edit</button>
                      <button className="btn btn-sm btn-danger btn-ghost" onClick={() => confirm('Delete this service record?', () => { deleteService(s.id); toast('Deleted','info') }, { title:'Delete Service', danger:true, ok:'Delete' })}>✕</button>
                    </div>
                  </div>
                  <div className="chain-meta">{fmtDate(s.date)} . {s.tech} . {fmtCost(s.cost, cur)} . {s.status}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{s.issue}</div>
                  {s.nextDue && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Next due: {fmtDate(s.nextDue)}</div>}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* RETURNS */}
      {tab === 'returns' && (
        <div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>Asset return records</div>
          {assetRets.length === 0 ? <div className="empty">No return records</div>
            : assetRets.map(r => (
              <div key={r.id} className="chain-step">
                <div className="chain-icon ci-return">↩</div>
                <div className="chain-body">
                  <div className="chain-label">Return by {eName(r.empId)}</div>
                  <div className="chain-meta">{fmtDate(r.returnDate)} . Checked by {r.checkedBy} . Condition: {r.condition}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>
                    Data wipe: {r.datawipe} . Accessories: {r.accessories || '--'}
                    {r.signedOff && <span style={{ color:'var(--green)', marginLeft:8 }}>✓ Signed off</span>}
                  </div>
                  {r.notes && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{r.notes}</div>}
                </div>
              </div>
            ))}
          {assetPurs.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:8 }}>Employee Purchases</div>
              {assetPurs.map(p => (
                <div key={p.id} className="chain-step">
                  <div className="chain-icon ci-sold">💰</div>
                  <div className="chain-body">
                    <div className="chain-label">Sold to {p.buyerName}</div>
                    <div className="chain-meta">{fmtDate(p.saleDate)} . {fmtCost(p.salePrice, cur)} . {p.paymentMethod}{p.invoiceNo ? ` . ${p.invoiceNo}` : ''}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>Approved by {p.approvedBy}{p.signedOff ? <span style={{ color:'var(--green)', marginLeft:8 }}>✓ Signed</span> : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>

    <AssetForm assetId={assetId} open={editOpen} onClose={() => setE(false)} />
    <TransferModal assetId={assetId} open={tfOpen} onClose={() => setTf(false)} />
    <DisposeModal assetId={assetId} open={dpOpen} onClose={() => setDp(false)} />
    <ReturnForm assetId={assetId} open={retOpen} onClose={() => setRet(false)} />
    <PurchaseForm assetId={assetId} open={purOpen} onClose={() => setPur(false)} />
    <UpgradeForm assetId={assetId} upgradeId={editUpgId} open={upgOpen} onClose={() => { setUpg(false); setEupg(null) }} />
    <ServiceForm assetId={assetId} serviceId={editSvcId} open={svcOpen} onClose={() => { setSvc(false); setEsvc(null) }} />
    <QRModal assetId={assetId} open={qrOpen} onClose={() => setQr(false)} />
    </>
  )
}
