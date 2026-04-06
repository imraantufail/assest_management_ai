import React, { useRef } from 'react'
import { Modal } from './UI'
import { useStore } from '../store/useStore'
import { qrUrl } from '../utils/helpers'

export default function QRModal({ assetId, open, onClose }) {
  const { assets, settings } = useStore()
  const printRef = useRef()
  const asset = assets.find(a => a.id === assetId)
  if (!asset) return null

  const org  = settings?.orgName || 'AssetFlow'
  const logo = settings?.logo || ''
  const qr   = qrUrl(`${org} | ${asset.id} | ${asset.make} ${asset.model} | S/N:${asset.serial}`)

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=400,height=500')
    win.document.write(`<!DOCTYPE html><html><head><title>QR -- ${asset.id}</title>
    <style>
      body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;font-family:Arial,sans-serif;}
      .card{background:white;border-radius:8px;padding:20px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.15);width:220px;}
      .card img.logo{max-height:36px;margin-bottom:10px;object-fit:contain;}
      .card img.qr{width:180px;height:180px;margin:8px 0;}
      .card .assetid{font-family:monospace;font-size:18px;font-weight:700;letter-spacing:1.5px;margin:6px 0 2px;}
      .card .model{font-size:11px;color:#555;margin-bottom:2px;}
      .card .serial{font-size:10px;color:#888;font-family:monospace;}
      .card .org{font-size:10px;color:#aaa;margin-top:8px;border-top:1px solid #eee;padding-top:6px;}
    </style></head><body>
    <div class="card">
      ${logo ? `<img class="logo" src="${logo}" alt="logo"/>` : `<div style="font-weight:700;font-size:14px;margin-bottom:10px;">${org}</div>`}
      <img class="qr" src="${qr}" alt="QR Code"/>
      <div class="assetid">${asset.id}</div>
      <div class="model">${asset.make} ${asset.model}</div>
      <div class="serial">S/N: ${asset.serial}</div>
      <div class="org">${org}</div>
    </div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>
    </body></html>`)
    win.document.close()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm"
      title="Asset QR Code"
      sub={`${asset.id} -- ${asset.make} ${asset.model}`}
    >
      <div style={{ display:'flex', justifyContent:'center', margin:'8px 0 20px' }}>
        <div style={{ background:'white', borderRadius:10, padding:20, textAlign:'center', boxShadow:'0 2px 16px rgba(0,0,0,.3)' }}>
          {logo && <img src={logo} alt="logo" style={{ maxHeight:36, marginBottom:10, objectFit:'contain', display:'block', margin:'0 auto 10px' }} />}
          {!logo && <div style={{ fontWeight:700, fontSize:14, color:'#111', marginBottom:10 }}>{org}</div>}
          <img src={qr} alt="QR Code" style={{ width:180, height:180, display:'block' }} />
          <div style={{ fontFamily:'monospace', fontSize:17, fontWeight:700, letterSpacing:1.5, color:'#111', margin:'8px 0 3px' }}>{asset.id}</div>
          <div style={{ fontSize:11, color:'#555' }}>{asset.make} {asset.model}</div>
          <div style={{ fontSize:10, color:'#888', fontFamily:'monospace' }}>S/N: {asset.serial}</div>
          <div style={{ fontSize:10, color:'#aaa', marginTop:8, paddingTop:6, borderTop:'1px solid #eee' }}>{org}</div>
        </div>
      </div>
      <div style={{ fontSize:12, color:'var(--text3)', textAlign:'center', marginBottom:16 }}>
        Scan to view asset details . Print and attach to the physical device
      </div>
      <div className="factions" style={{ justifyContent:'center' }}>
        <button className="btn" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={handlePrint}>🖨 Print QR Label</button>
      </div>
    </Modal>
  )
}
