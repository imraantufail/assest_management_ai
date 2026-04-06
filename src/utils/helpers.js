// Date formatting
export const fmtDate = (d) => {
  if (!d) return '--'
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' }) }
  catch { return d }
}
export const today = () => new Date().toISOString().split('T')[0]

// Currency - PKR
export const fmtCost = (v, currency = 'PKR') => {
  if (!v && v !== 0) return '--'
  const n = parseFloat(v)
  if (isNaN(n)) return v
  if (currency === 'PKR') return '₨ ' + n.toLocaleString('en-PK')
  return '$' + n.toLocaleString()
}

// Avatars
export const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'
const ACOLORS = [
  ['#5b8dee22','#5b8dee'],['#34d99b22','#34d99b'],['#f6a83222','#f6a832'],
  ['#a78bfa22','#a78bfa'],['#f8723922','#f87239'],['#38c4f022','#38c4f0'],['#f05d6e22','#f05d6e'],
]
export const avatarColor = (name) => {
  let h = 0; for (const c of (name||'?')) h = (h*31 + c.charCodeAt(0)) & 0xffff
  return ACOLORS[h % ACOLORS.length]
}

// Status badge class
export const statusClass = (s) => ({
  'Active':'badge-active','In Stock':'badge-stock','Under Repair':'badge-repair',
  'Warranty Expired':'badge-expired','Sold':'badge-sold','Scrapped':'badge-scrapped',
  'Transferred':'badge-transferred','Purchase':'badge-active','Transfer':'badge-transferred',
  'Repair':'badge-repair','Upgrade':'badge-upgrade','Return':'badge-return',
  'Donated':'badge-stock','Returned to Vendor':'badge-expired',
}[s] || 'badge-stock')

export const CHAIN_ICON = {
  Purchase:'🛒', Transfer:'↗', Repair:'🔧', Scrapped:'🗑', Sold:'💰',
  Donated:'🤝', 'Returned to Vendor':'↩', Upgrade:'⚡', Return:'↩',
}
export const CHAIN_CLASS = {
  Purchase:'ci-purchase', Transfer:'ci-transfer', Repair:'ci-repair',
  Scrapped:'ci-scrapped', Sold:'ci-sold', Donated:'ci-donated',
  'Returned to Vendor':'ci-donated', Upgrade:'ci-upgrade', Return:'ci-return',
}

export const warrantyStatus = (dateStr) => {
  if (!dateStr) return null
  const days = Math.round((new Date(dateStr) - new Date()) / 86400000)
  if (days < 0)   return { label:'Expired',       cls:'badge-scrapped', days }
  if (days < 90)  return { label:`${days}d left`,  cls:'badge-repair',  days }
  return               { label:'Valid',           cls:'badge-active',  days }
}

// QR code URL for an asset (uses free QR API)
export const qrUrl = (text) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
