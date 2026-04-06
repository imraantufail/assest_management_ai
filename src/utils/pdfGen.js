import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmtDate, fmtCost } from './helpers'

const ACCENT = [91, 141, 238]
const DARK   = [20, 24, 36]
const GRAY   = [100, 110, 130]
const LGRAY  = [240, 243, 250]

function addPageHeader(doc, orgName, logo, title, subtitle) {
  const W = doc.internal.pageSize.width
  doc.setFillColor(...DARK)
  doc.rect(0, 0, W, 22, 'F')
  doc.setFillColor(...ACCENT)
  doc.rect(0, 20, W, 3, 'F')

  let x = 14
  if (logo) {
    try { doc.addImage(logo, 'PNG', 12, 3, 28, 14, '', 'FAST'); x = 46 } catch {}
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(255, 255, 255)
  doc.text(orgName || 'AssetFlow', x, 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 195, 220)
  doc.text('IT Asset Management System', x, 17)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...ACCENT)
  doc.text(title, W - 14, 10, { align: 'right' })
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(subtitle, W - 14, 17, { align: 'right' })
  }
}

function addPageFooter(doc, orgName) {
  const W = doc.internal.pageSize.width
  const H = doc.internal.pageSize.height
  const pg = doc.internal.getCurrentPageInfo().pageNumber
  const total = doc.internal.getNumberOfPages()
  doc.setFillColor(...LGRAY)
  doc.rect(0, H - 12, W, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text(`${orgName || 'AssetFlow'} . Generated ${new Date().toLocaleString('en-PK')}`, 14, H - 4)
  doc.text(`Page ${pg} / ${total}`, W - 14, H - 4, { align: 'right' })
}

const TABLE_OPTS = {
  styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: [40, 45, 60] },
  headStyles: { fillColor: DARK, textColor: [180, 195, 220], fontStyle: 'bold', fontSize: 7.5, cellPadding: 5 },
  alternateRowStyles: { fillColor: [248, 250, 254] },
  tableLineColor: [220, 225, 235],
  tableLineWidth: 0.1,
  margin: { left: 14, right: 14 },
}

// -- Fleet report ----------------------------------------------
export function generateFleetReport(store) {
  const { assets, employees, chain, services, upgrades, settings } = store
  const org  = settings?.orgName || 'AssetFlow'
  const logo = settings?.logo || ''
  const cur  = settings?.currency || 'PKR'
  const dt   = new Date().toLocaleDateString('en-PK', { day:'2-digit', month:'long', year:'numeric' })
  const doc  = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' })
  const W    = doc.internal.pageSize.width

  const eName = (id) => {
    if (!id) return '--'
    if (id.startsWith('EMP')) return employees.find(e => e.id === id)?.name || id
    return id
  }

  // -- Page 1: Summary --------------------------------------
  addPageHeader(doc, org, logo, 'Fleet Report', dt)

  // KPI boxes
  const kpis = [
    { label:'Total Assets',    val: assets.length,     color: ACCENT },
    { label:'Active',          val: assets.filter(a=>a.status==='Active').length, color:[34,180,120] },
    { label:'Under Repair',    val: assets.filter(a=>a.status==='Under Repair').length, color:[220,140,50] },
    { label:'Scrapped/Sold',   val: assets.filter(a=>['Sold','Scrapped'].includes(a.status)).length, color:[210,80,90] },
    { label:'All-time Empl.',  val: employees.length,  color:[160,130,240] },
    { label:'Chain Events',    val: chain.length,       color:[60,190,235] },
  ]
  const boxW = (W - 28) / kpis.length
  kpis.forEach((k, i) => {
    const bx = 14 + i * boxW
    doc.setFillColor(...LGRAY)
    doc.roundedRect(bx, 30, boxW - 3, 22, 2, 2, 'F')
    doc.setDrawColor(...k.color)
    doc.setLineWidth(0.8)
    doc.line(bx, 30, bx, 52)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...k.color)
    doc.text(String(k.val), bx + 6, 44)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    doc.text(k.label.toUpperCase(), bx + 6, 49)
  })

  // Status breakdown table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text('Status Breakdown', 14, 62)
  const statuses = ['Active','In Stock','Under Repair','Warranty Expired','Sold','Scrapped']
  autoTable(doc, {
    ...TABLE_OPTS, startY: 65,
    tableWidth: 80,
    head: [['Status','Count','%']],
    body: statuses.map(s => {
      const cnt = assets.filter(a=>a.status===s).length
      return cnt > 0 ? [s, cnt, Math.round(cnt/assets.length*100)+'%'] : null
    }).filter(Boolean),
    didDrawPage: () => addPageFooter(doc, org),
  })

  // Department breakdown
  const depts = [...new Set(assets.map(a=>a.dept).filter(Boolean))]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text('By Department', 110, 62)
  autoTable(doc, {
    ...TABLE_OPTS, startY: 65,
    startX: 110, tableWidth: 80,
    head: [['Department','Assets','Active']],
    body: depts.map(d => [
      d,
      assets.filter(a=>a.dept===d).length,
      assets.filter(a=>a.dept===d && a.status==='Active').length,
    ]),
    margin: { left: 110, right: 14 },
    didDrawPage: () => addPageFooter(doc, org),
  })

  addPageFooter(doc, org)

  // -- Page 2: Asset Register -------------------------------
  doc.addPage()
  addPageHeader(doc, org, logo, 'Asset Register', dt)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text(`All Assets (${assets.length})`, 14, 32)

  autoTable(doc, {
    ...TABLE_OPTS, startY: 36,
    head: [['Asset ID','Type','Make','Model','Serial','Generation','RAM','HDD/SSD','Screen','Status','Holder','Dept','Purchase Date','Cost ('+cur+')','Warranty']],
    body: assets.map(a => [
      a.id, a.type, a.make||'--', a.model, a.serial,
      a.generation||'--', a.ram||'--', a.hdd||'--', a.screenSize||'--',
      a.status,
      a.assignedTo ? eName(a.assignedTo) : 'Unassigned',
      a.dept||'--', fmtDate(a.purchaseDate), a.cost||'--', fmtDate(a.warranty),
    ]),
    didDrawPage: (d) => { addPageHeader(doc, org, logo, 'Asset Register', dt); addPageFooter(doc, org) },
    columnStyles: {
      0:{cellWidth:20}, 1:{cellWidth:18}, 2:{cellWidth:14}, 3:{cellWidth:28},
      4:{cellWidth:28}, 9:{cellWidth:20}, 10:{cellWidth:24},
    },
  })
  addPageFooter(doc, org)

  // -- Page 3: Chain Log ------------------------------------
  doc.addPage()
  addPageHeader(doc, org, logo, 'Chain of Custody', dt)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text(`All Chain Events (${chain.length})`, 14, 32)

  const sortedChain = [...chain].sort((a,b)=>a.date.localeCompare(b.date))
  autoTable(doc, {
    ...TABLE_OPTS, startY: 36,
    head: [['Event ID','Asset ID','Model','Event','From','To','Date','Reason','Notes']],
    body: sortedChain.map(e => [
      e.id, e.assetId,
      assets.find(a=>a.id===e.assetId)?.model || '--',
      e.type, eName(e.from), eName(e.to),
      fmtDate(e.date), e.reason||'--', e.notes||'--',
    ]),
    didDrawPage: () => { addPageHeader(doc, org, logo, 'Chain of Custody', dt); addPageFooter(doc, org) },
    columnStyles: { 0:{cellWidth:20}, 1:{cellWidth:18}, 2:{cellWidth:30}, 5:{cellWidth:28} },
  })
  addPageFooter(doc, org)

  // -- Page 4: Upgrades -------------------------------------
  if (upgrades && upgrades.length) {
    doc.addPage()
    addPageHeader(doc, org, logo, 'Hardware Upgrades', dt)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...DARK)
    doc.text(`All Hardware Upgrades (${upgrades.length})`, 14, 32)
    autoTable(doc, {
      ...TABLE_OPTS, startY: 36,
      head: [['UPG ID','Asset ID','Model','Component','From','To','Date','Vendor','Cost','Invoice']],
      body: upgrades.map(u => [
        u.id, u.assetId,
        assets.find(a=>a.id===u.assetId)?.model||'--',
        u.component, u.fromSpec||'--', u.toSpec,
        fmtDate(u.date), u.vendor||'--', u.cost||'--', u.invoice||'--',
      ]),
      didDrawPage: () => { addPageHeader(doc, org, logo, 'Hardware Upgrades', dt); addPageFooter(doc, org) },
    })
    addPageFooter(doc, org)
  }

  doc.save(`${org.replace(/\s+/g,'_')}_Fleet_Report_${new Date().toISOString().split('T')[0]}.pdf`)
}

// -- Single asset report ---------------------------------------
export function generateAssetReport(assetId, store) {
  const { assets, employees, chain, services, upgrades, returns, purchases, settings } = store
  const a = assets.find(x => x.id === assetId)
  if (!a) return
  const org  = settings?.orgName || 'AssetFlow'
  const logo = settings?.logo || ''
  const cur  = settings?.currency || 'PKR'
  const dt   = new Date().toLocaleDateString('en-PK', { day:'2-digit', month:'long', year:'numeric' })
  const doc  = new jsPDF({ unit:'mm', format:'a4' })
  const W    = doc.internal.pageSize.width

  const eName = (id) => {
    if (!id) return '--'
    if (id.startsWith('EMP')) return employees.find(e => e.id === id)?.name || id
    return id
  }

  // Page 1 header
  addPageHeader(doc, org, logo, 'Asset Report', dt)

  // Asset identity block
  doc.setFillColor(...LGRAY)
  doc.roundedRect(14, 28, W - 28, 38, 3, 3, 'F')
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.6)
  doc.line(14, 28, 14, 66)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...DARK)
  doc.text(`${a.make || ''} ${a.model}`, 20, 37)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text([
    `Asset ID: ${a.id}`,
    `Serial: ${a.serial}`,
    `Status: ${a.status}`,
  ], 20, 44, { lineHeightFactor: 1.7 })

  // Spec pills
  const specs = [a.type, a.generation, a.ram, a.hdd, a.screenSize].filter(s=>s&&s!=='N/A')
  let px = W / 2
  specs.forEach(s => {
    doc.setFillColor(...ACCENT)
    doc.setFontSize(7.5)
    const tw = doc.getTextWidth(s) + 8
    doc.roundedRect(px, 44, tw, 8, 2, 2, 'F')
    doc.setTextColor(255,255,255)
    doc.text(s, px + 4, 49.5)
    px += tw + 4
  })

  // Current holder
  const holder = a.assignedTo ? employees.find(e => e.id === a.assignedTo) : null
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK)
  doc.text('Current Holder:', 20, 60)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(holder ? `${holder.name} -- ${holder.dept} -- ${a.location || '--'}` : 'Unassigned', 58, 60)

  // Asset info table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text('Asset Information', 14, 76)
  autoTable(doc, {
    ...TABLE_OPTS, startY: 79,
    head: [['Field','Value','Field','Value']],
    body: [
      ['Type', a.type,                 'Make / Brand',    a.make||'--'],
      ['Generation', a.generation||'--','RAM',             a.ram||'--'],
      ['HDD / SSD',  a.hdd||'--',       'Screen Size',     a.screenSize||'--'],
      ['Purchase Date', fmtDate(a.purchaseDate), 'Cost ('+cur+')', a.cost ? `₨ ${parseFloat(a.cost).toLocaleString('en-PK')}` : '--'],
      ['Warranty Expiry', fmtDate(a.warranty), 'Department', a.dept||'--'],
      ['Location', a.location||'--',    'Notes',           a.notes||'--'],
    ],
    columnStyles: { 0:{fontStyle:'bold',cellWidth:38}, 1:{cellWidth:55}, 2:{fontStyle:'bold',cellWidth:38}, 3:{cellWidth:55} },
    didDrawPage: () => { addPageHeader(doc, org, logo, 'Asset Report', dt); addPageFooter(doc, org) },
  })

  // Chain of custody
  const assetChain = [...chain.filter(e => e.assetId === assetId)].sort((a,b)=>a.date.localeCompare(b.date))
  const chainY = doc.lastAutoTable.finalY + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text(`Chain of Custody  (${assetChain.length} events)`, 14, chainY)
  autoTable(doc, {
    ...TABLE_OPTS, startY: chainY + 4,
    head: [['#','Event','From','To / Destination','Date','Reason','Approved By','Notes']],
    body: assetChain.map((e,i) => [
      i+1, e.type, eName(e.from), eName(e.to),
      fmtDate(e.date), e.reason||'--', e.approvedBy||'--', e.notes||'--',
    ]),
    columnStyles: { 0:{cellWidth:8}, 1:{cellWidth:22}, 2:{cellWidth:30}, 3:{cellWidth:30}, 4:{cellWidth:22} },
    didDrawPage: () => { addPageHeader(doc, org, logo, 'Asset Report', dt); addPageFooter(doc, org) },
  })
  addPageFooter(doc, org)

  // Upgrades & Services page
  const assetUpgs = (store.upgrades || []).filter(u => u.assetId === assetId)
  const assetSvcs = services.filter(s => s.assetId === assetId)
  if (assetUpgs.length || assetSvcs.length) {
    doc.addPage()
    addPageHeader(doc, org, logo, 'Asset Report -- Upgrades & Service', dt)
    let nextY = 32
    if (assetUpgs.length) {
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...DARK)
      doc.text(`Hardware Upgrades (${assetUpgs.length})`, 14, nextY)
      autoTable(doc, {
        ...TABLE_OPTS, startY: nextY + 4,
        head: [['Component','From','To','Date','Vendor','Cost','Invoice','Notes']],
        body: assetUpgs.map(u => [u.component, u.fromSpec||'--', u.toSpec, fmtDate(u.date), u.vendor||'--', u.cost||'--', u.invoice||'--', u.notes||'--']),
        didDrawPage: () => { addPageHeader(doc, org, logo, 'Asset Report -- Upgrades & Service', dt); addPageFooter(doc, org) },
      })
      nextY = doc.lastAutoTable.finalY + 10
    }
    if (assetSvcs.length) {
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...DARK)
      doc.text(`Service & Maintenance (${assetSvcs.length})`, 14, nextY)
      autoTable(doc, {
        ...TABLE_OPTS, startY: nextY + 4,
        head: [['Type','Date','Technician','Cost','Status','Issue','Next Due']],
        body: assetSvcs.map(s => [s.type, fmtDate(s.date), s.tech, s.cost||'0', s.status, s.issue, s.nextDue?fmtDate(s.nextDue):'--']),
        didDrawPage: () => { addPageHeader(doc, org, logo, 'Asset Report -- Service', dt); addPageFooter(doc, org) },
      })
    }
    addPageFooter(doc, org)
  }

  doc.save(`AssetReport_${assetId}_${new Date().toISOString().split('T')[0]}.pdf`)
}
