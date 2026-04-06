import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const pad = (n) => String(n).padStart(3, '0')
const genId = (prefix, counters) => {
  const next = (counters[prefix] || 0) + 1
  return { id: `${prefix}-${pad(next)}`, next }
}

const SEED = {
  counters: { AST: 10, EMP: 15, EVT: 18, SVC: 4, UPG: 2, RET: 1, PUR: 1 },
  settings: { orgName: 'My Organization', logo: '', currency: 'PKR' },
  assets: [
    { id:'AST-001', type:'Laptop', make:'Dell', model:'XPS 15 9500', serial:'DL-XPS-9500-001',
      hdd:'1TB NVMe SSD', ram:'32GB DDR4', generation:'10th Gen Intel', screenSize:'15.6"',
      purchaseDate:'2022-03-15', cost:'285000', warranty:'2025-03-15', status:'Active',
      assignedTo:'EMP-001', dept:'Engineering', location:'Lahore HQ', notes:'Company issued' },
    { id:'AST-002', type:'Desktop', make:'HP', model:'EliteDesk 800 G6', serial:'HP-ED-800G6-002',
      hdd:'512GB SSD', ram:'16GB DDR4', generation:'10th Gen Intel', screenSize:'N/A',
      purchaseDate:'2021-07-10', cost:'195000', warranty:'2025-07-10', status:'Active',
      assignedTo:'EMP-002', dept:'Finance', location:'Lahore HQ', notes:'' },
    { id:'AST-003', type:'Laptop', make:'Lenovo', model:'ThinkPad E15 Gen 2', serial:'LN-TP-E15G2-003',
      hdd:'256GB SSD', ram:'8GB DDR4', generation:'11th Gen Intel', screenSize:'15.6"',
      purchaseDate:'2020-01-20', cost:'165000', warranty:'2023-01-20', status:'Under Repair',
      assignedTo:'', dept:'IT', location:'Repair Bay', notes:'Keyboard issue' },
    { id:'AST-004', type:'Desktop', make:'Apple', model:'iMac 24" M2', serial:'AP-IMAC-24M2-004',
      hdd:'512GB SSD', ram:'16GB Unified', generation:'Apple M2', screenSize:'24"',
      purchaseDate:'2023-05-05', cost:'420000', warranty:'2026-05-05', status:'Active',
      assignedTo:'EMP-005', dept:'Design', location:'Karachi Office', notes:'Creative team' },
    { id:'AST-005', type:'Laptop', make:'Dell', model:'Latitude 5540', serial:'DL-LAT-5540-005',
      hdd:'512GB SSD', ram:'16GB DDR5', generation:'13th Gen Intel', screenSize:'15.6"',
      purchaseDate:'2019-09-12', cost:'210000', warranty:'2022-09-12', status:'Scrapped',
      assignedTo:'', dept:'', location:'Disposed', notes:'End of life' },
    { id:'AST-006', type:'Laptop', make:'HP', model:'ProBook 450 G9', serial:'HP-PB-450G9-006',
      hdd:'256GB SSD', ram:'8GB DDR4', generation:'12th Gen Intel', screenSize:'15.6"',
      purchaseDate:'2022-11-01', cost:'148000', warranty:'2025-11-01', status:'Active',
      assignedTo:'EMP-007', dept:'HR', location:'Islamabad Office', notes:'' },
    { id:'AST-007', type:'Desktop', make:'Lenovo', model:'IdeaCentre 5i', serial:'LN-IC-5I-007',
      hdd:'256GB SSD', ram:'8GB DDR4', generation:'10th Gen Intel', screenSize:'N/A',
      purchaseDate:'2021-03-18', cost:'120000', warranty:'2024-03-18', status:'Warranty Expired',
      assignedTo:'EMP-008', dept:'Operations', location:'Lahore HQ', notes:'Warranty lapsed' },
    { id:'AST-008', type:'Laptop', make:'Apple', model:'MacBook Pro 14" M3 Pro', serial:'AP-MBP-14M3-008',
      hdd:'512GB SSD', ram:'18GB Unified', generation:'Apple M3 Pro', screenSize:'14.2"',
      purchaseDate:'2024-01-10', cost:'475000', warranty:'2027-01-10', status:'Active',
      assignedTo:'EMP-009', dept:'Management', location:'Lahore HQ', notes:"Director's device" },
    { id:'AST-009', type:'Laptop', make:'Dell', model:'XPS 13 Plus', serial:'DL-XPS-13P-009',
      hdd:'256GB SSD', ram:'8GB DDR5', generation:'12th Gen Intel', screenSize:'13.4"',
      purchaseDate:'2021-05-01', cost:'198000', warranty:'2024-05-01', status:'Sold',
      assignedTo:'', dept:'', location:'Sold', notes:'Sold to employee' },
    { id:'AST-010', type:'Monitor', make:'LG', model:'27UK850-W 4K', serial:'LG-27UK-850-010',
      hdd:'N/A', ram:'N/A', generation:'N/A', screenSize:'27"',
      purchaseDate:'2022-08-10', cost:'82000', warranty:'2025-08-10', status:'Active',
      assignedTo:'EMP-014', dept:'Engineering', location:'Lahore HQ', notes:'' },
  ],
  employees: [
    { id:'EMP-001', name:'Ali Hassan',     dept:'Engineering', role:'Software Engineer',  join:'2021-03-01', status:'Active', left:'' },
    { id:'EMP-002', name:'Sara Khan',      dept:'Finance',     role:'Finance Manager',    join:'2020-07-15', status:'Active', left:'' },
    { id:'EMP-003', name:'Bilal Ahmed',    dept:'Sales',       role:'Sales Executive',    join:'2022-01-10', status:'Left',   left:'2024-03-31' },
    { id:'EMP-004', name:'Omer Farooq',    dept:'Finance',     role:'Senior Accountant',  join:'2019-09-01', status:'Left',   left:'2023-01-01' },
    { id:'EMP-005', name:'Mehwish Rao',    dept:'Design',      role:'UI/UX Designer',     join:'2023-05-05', status:'Active', left:'' },
    { id:'EMP-006', name:'Usman Malik',    dept:'Marketing',   role:'Marketing Lead',     join:'2021-06-01', status:'Left',   left:'2024-11-30' },
    { id:'EMP-007', name:'Zara Siddiqui', dept:'HR',          role:'HR Officer',         join:'2022-11-01', status:'Active', left:'' },
    { id:'EMP-008', name:'Tariq Mehmood', dept:'Operations',  role:'Ops Executive',      join:'2021-03-18', status:'Active', left:'' },
    { id:'EMP-009', name:'Nadia Qureshi', dept:'Management',  role:'Director',           join:'2024-01-01', status:'Active', left:'' },
    { id:'EMP-010', name:'Hamid Riaz',     dept:'Engineering', role:'Backend Dev',        join:'2023-08-01', status:'Left',   left:'2023-10-31' },
    { id:'EMP-011', name:'Ayesha Butt',    dept:'Engineering', role:'QA Engineer',        join:'2023-11-01', status:'Left',   left:'2024-01-15' },
    { id:'EMP-012', name:'Raza Noor',      dept:'Sales',       role:'Sales Rep',          join:'2024-02-01', status:'Left',   left:'2024-04-30' },
    { id:'EMP-013', name:'Faiza Malik',    dept:'HR',          role:'Recruiter',          join:'2024-05-01', status:'Active', left:'' },
    { id:'EMP-014', name:'Sohail Akhtar', dept:'Engineering', role:'Frontend Dev',       join:'2024-06-01', status:'Active', left:'' },
    { id:'EMP-015', name:'Imran Shah',     dept:'Operations',  role:'Admin Officer',      join:'2024-07-01', status:'Active', left:'' },
  ],
  chain: [
    { id:'EVT-001', assetId:'AST-001', type:'Purchase',  from:'Procurement', to:'EMP-001', dept:'Engineering', location:'Lahore HQ',      date:'2022-03-20', reason:'New Purchase',   approvedBy:'IT Manager', notes:'Sealed box', salePrice:'' },
    { id:'EVT-002', assetId:'AST-002', type:'Purchase',  from:'Procurement', to:'EMP-004', dept:'Finance',      location:'Lahore HQ',      date:'2021-07-15', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
    { id:'EVT-003', assetId:'AST-002', type:'Transfer',  from:'EMP-004',     to:'EMP-002', dept:'Finance',      location:'Lahore HQ',      date:'2023-01-05', reason:'Role Change',    approvedBy:'Finance Head',notes:'Omer Farooq left', salePrice:'' },
    { id:'EVT-004', assetId:'AST-003', type:'Purchase',  from:'Procurement', to:'EMP-003', dept:'Sales',        location:'Karachi Office', date:'2020-01-25', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
    { id:'EVT-005', assetId:'AST-003', type:'Transfer',  from:'EMP-003',     to:'EMP-010', dept:'Engineering',  location:'Lahore HQ',      date:'2023-09-01', reason:'Reallocation',   approvedBy:'IT Manager', notes:'Bilal moved', salePrice:'' },
    { id:'EVT-006', assetId:'AST-003', type:'Transfer',  from:'EMP-010',     to:'EMP-011', dept:'Engineering',  location:'Lahore HQ',      date:'2023-11-01', reason:'New Joiner',     approvedBy:'IT Manager', notes:'Hamid left', salePrice:'' },
    { id:'EVT-007', assetId:'AST-003', type:'Repair',    from:'EMP-011',     to:'IT Dept', dept:'IT',           location:'Repair Bay',     date:'2024-11-12', reason:'Hardware Fault', approvedBy:'IT Manager', notes:'Keyboard not working', salePrice:'' },
    { id:'EVT-008', assetId:'AST-005', type:'Purchase',  from:'Procurement', to:'EMP-006', dept:'Marketing',    location:'Lahore HQ',      date:'2019-09-15', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
    { id:'EVT-009', assetId:'AST-005', type:'Transfer',  from:'EMP-006',     to:'EMP-012', dept:'Sales',        location:'Lahore HQ',      date:'2024-02-01', reason:'Reallocation',   approvedBy:'COO',        notes:'Usman moved', salePrice:'' },
    { id:'EVT-010', assetId:'AST-005', type:'Scrapped',  from:'EMP-012',     to:'NGO Donation', dept:'',        location:'Disposed',       date:'2024-12-01', reason:'End of Life',    approvedBy:'COO',        notes:'Data wiped, donated', salePrice:'' },
    { id:'EVT-011', assetId:'AST-004', type:'Purchase',  from:'Procurement', to:'EMP-005', dept:'Design',       location:'Karachi Office', date:'2023-05-06', reason:'New Purchase',   approvedBy:'IT Manager', notes:'Factory sealed', salePrice:'' },
    { id:'EVT-012', assetId:'AST-009', type:'Purchase',  from:'Procurement', to:'EMP-001', dept:'Engineering',  location:'Lahore HQ',      date:'2021-05-05', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
    { id:'EVT-013', assetId:'AST-009', type:'Transfer',  from:'EMP-001',     to:'EMP-010', dept:'Engineering',  location:'Lahore HQ',      date:'2023-08-05', reason:'Upgrade issued', approvedBy:'IT Manager', notes:'Ali received new device', salePrice:'' },
    { id:'EVT-014', assetId:'AST-009', type:'Sold',      from:'EMP-010',     to:'Hamid Riaz (personal)', dept:'', location:'Personal',     date:'2023-11-01', reason:'End of contract sale', approvedBy:'HR', notes:'', salePrice:'45000' },
    { id:'EVT-015', assetId:'AST-006', type:'Purchase',  from:'Procurement', to:'EMP-007', dept:'HR',           location:'Islamabad',      date:'2022-11-02', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
    { id:'EVT-016', assetId:'AST-007', type:'Purchase',  from:'Procurement', to:'EMP-008', dept:'Operations',   location:'Lahore HQ',      date:'2021-03-18', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
    { id:'EVT-017', assetId:'AST-008', type:'Purchase',  from:'Procurement', to:'EMP-009', dept:'Management',   location:'Lahore HQ',      date:'2024-01-11', reason:'New Purchase',   approvedBy:'CEO',        notes:'Director allocation', salePrice:'' },
    { id:'EVT-018', assetId:'AST-010', type:'Purchase',  from:'Procurement', to:'EMP-014', dept:'Engineering',  location:'Lahore HQ',      date:'2022-08-10', reason:'New Purchase',   approvedBy:'IT Manager', notes:'', salePrice:'' },
  ],
  services: [
    { id:'SVC-001', assetId:'AST-001', type:'Preventive Maintenance', date:'2024-06-01', tech:'Internal IT', cost:'0',     issue:'Dust cleaning, thermal paste, OS update',  nextDue:'2025-06-01', status:'Done' },
    { id:'SVC-002', assetId:'AST-002', type:'Hardware Upgrade',       date:'2024-01-10', tech:'Internal IT', cost:'8500',  issue:'RAM upgraded 8GB to 16GB + thermal paste', nextDue:'2025-01-10', status:'Done' },
    { id:'SVC-003', assetId:'AST-003', type:'Corrective Repair',      date:'2024-11-12', tech:'TechFix Ltd',  cost:'16500', issue:'Keyboard replacement (parts + labor)',      nextDue:'',          status:'In Progress' },
    { id:'SVC-004', assetId:'AST-007', type:'Inspection',             date:'2023-12-01', tech:'Internal IT', cost:'0',     issue:'Post-warranty health check',               nextDue:'2024-12-01', status:'Done' },
  ],
  upgrades: [
    { id:'UPG-001', assetId:'AST-002', date:'2024-01-10', component:'RAM', fromSpec:'8GB DDR4', toSpec:'16GB DDR4', cost:'8500', vendor:'Internal IT', approvedBy:'IT Manager', notes:'Performance upgrade', invoice:'' },
    { id:'UPG-002', assetId:'AST-003', date:'2022-06-01', component:'SSD', fromSpec:'128GB HDD', toSpec:'256GB SSD', cost:'12000', vendor:'TechZone Pvt', approvedBy:'IT Manager', notes:'HDD was failing', invoice:'INV-2022-041' },
  ],
  returns: [
    { id:'RET-001', assetId:'AST-009', empId:'EMP-010', returnDate:'2023-10-30', condition:'Fair', datawipe:'Yes', accessories:'Charger, Bag', checkedBy:'IT Manager', notes:'Returned on last working day', signedOff:true },
  ],
  purchases: [
    { id:'PUR-001', assetId:'AST-009', buyerName:'Hamid Riaz', buyerEmpId:'EMP-010', saleDate:'2023-11-01', salePrice:'45000', paymentMethod:'Bank Transfer', invoiceNo:'SALE-2023-001', approvedBy:'HR Manager', notes:'Sold at book value', signedOff:true },
  ],
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...SEED,

      nextId(prefix) {
        const { counters } = get()
        const { id, next } = genId(prefix, counters)
        set(s => ({ counters: { ...s.counters, [prefix]: next } }))
        return id
      },

      // -- Settings ------------------------------------------
      updateSettings(data) { set(s => ({ settings: { ...s.settings, ...data } })) },

      // -- Assets --------------------------------------------
      addAsset(data) {
        const id = get().nextId('AST')
        const asset = { ...data, id }
        set(s => ({ assets: [...s.assets, asset] }))
        get().addChainEvent({
          assetId: id, type: 'Purchase',
          from: 'Procurement', to: data.assignedTo || 'IT Store',
          dept: data.dept, location: data.location,
          date: data.purchaseDate, reason: 'New Purchase',
          approvedBy: 'IT Manager', notes: data.notes || '', salePrice: '',
        })
        return id
      },
      updateAsset(id, data) {
        set(s => ({ assets: s.assets.map(a => a.id === id ? { ...a, ...data } : a) }))
      },
      deleteAsset(id) {
        set(s => ({
          assets:    s.assets.filter(a => a.id !== id),
          chain:     s.chain.filter(e => e.assetId !== id),
          services:  s.services.filter(v => v.assetId !== id),
          upgrades:  s.upgrades.filter(u => u.assetId !== id),
          returns:   s.returns.filter(r => r.assetId !== id),
          purchases: s.purchases.filter(p => p.assetId !== id),
        }))
      },

      // -- Employees -----------------------------------------
      addEmployee(data) {
        const id = get().nextId('EMP')
        set(s => ({ employees: [...s.employees, { ...data, id }] }))
        return id
      },
      updateEmployee(id, data) {
        set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e) }))
      },
      deleteEmployee(id) {
        set(s => ({
          employees: s.employees.filter(e => e.id !== id),
          assets: s.assets.map(a => a.assignedTo === id ? { ...a, assignedTo: '' } : a),
        }))
      },

      // -- Chain events --------------------------------------
      addChainEvent(data) {
        const id = get().nextId('EVT')
        set(s => ({ chain: [...s.chain, { ...data, id }] }))
        return id
      },
      deleteChainEvent(id) {
        set(s => ({ chain: s.chain.filter(e => e.id !== id) }))
      },

      // -- Services ------------------------------------------
      addService(data) {
        const id = get().nextId('SVC')
        set(s => ({ services: [...s.services, { ...data, id }] }))
        return id
      },
      updateService(id, data) {
        set(s => ({ services: s.services.map(v => v.id === id ? { ...v, ...data } : v) }))
      },
      deleteService(id) {
        set(s => ({ services: s.services.filter(v => v.id !== id) }))
      },

      // -- Upgrades ------------------------------------------
      addUpgrade(data) {
        const id = get().nextId('UPG')
        const upg = { ...data, id }
        set(s => ({ upgrades: [...s.upgrades, upg] }))
        // Update the asset spec field
        const asset = get().assets.find(a => a.id === data.assetId)
        if (asset) {
          const fieldMap = { RAM: 'ram', SSD: 'hdd', HDD: 'hdd', 'Battery': 'notes' }
          const field = fieldMap[data.component]
          if (field && field !== 'notes') get().updateAsset(data.assetId, { [field]: data.toSpec })
        }
        get().addChainEvent({
          assetId: data.assetId, type: 'Upgrade',
          from: 'IT Dept', to: asset?.assignedTo || 'IT Store',
          dept: asset?.dept || '', location: asset?.location || '',
          date: data.date, reason: `${data.component} Upgrade: ${data.fromSpec} -> ${data.toSpec}`,
          approvedBy: data.approvedBy, notes: data.notes || '', salePrice: '',
        })
        return id
      },
      updateUpgrade(id, data) {
        set(s => ({ upgrades: s.upgrades.map(u => u.id === id ? { ...u, ...data } : u) }))
      },
      deleteUpgrade(id) {
        set(s => ({ upgrades: s.upgrades.filter(u => u.id !== id) }))
      },

      // -- Returns -------------------------------------------
      addReturn(data) {
        const id = get().nextId('RET')
        const ret = { ...data, id }
        set(s => ({ returns: [...s.returns, ret] }))
        const asset = get().assets.find(a => a.id === data.assetId)
        get().addChainEvent({
          assetId: data.assetId, type: 'Return',
          from: data.empId, to: 'IT Store',
          dept: 'IT', location: 'IT Store',
          date: data.returnDate, reason: 'Asset Returned',
          approvedBy: data.checkedBy, notes: `Condition: ${data.condition}. ${data.notes || ''}`, salePrice: '',
        })
        get().updateAsset(data.assetId, { assignedTo: '', status: 'In Stock' })
        return id
      },
      updateReturn(id, data) {
        set(s => ({ returns: s.returns.map(r => r.id === id ? { ...r, ...data } : r) }))
      },
      deleteReturn(id) {
        set(s => ({ returns: s.returns.filter(r => r.id !== id) }))
      },

      // -- Employee Purchases (buy from company) -------------
      addPurchase(data) {
        const id = get().nextId('PUR')
        set(s => ({ purchases: [...s.purchases, { ...data, id }] }))
        get().disposeAsset(data.assetId, {
          method: 'Sold', date: data.saleDate,
          salePrice: data.salePrice,
          buyer: data.buyerName + (data.buyerEmpId ? ` (${data.buyerEmpId})` : ''),
          approvedBy: data.approvedBy,
          notes: `Invoice: ${data.invoiceNo || '--'}. ${data.notes || ''}`,
          _fromPurchaseForm: true,
        })
        return id
      },
      updatePurchase(id, data) {
        set(s => ({ purchases: s.purchases.map(p => p.id === id ? { ...p, ...data } : p) }))
      },
      deletePurchase(id) {
        set(s => ({ purchases: s.purchases.filter(p => p.id !== id) }))
      },

      // -- Transfer ------------------------------------------
      transferAsset(assetId, d) {
        const asset = get().assets.find(a => a.id === assetId)
        get().addChainEvent({
          assetId, type: 'Transfer',
          from: asset.assignedTo || 'IT Store',
          to: d.toId,
          dept: d.dept, location: d.location,
          date: d.date, reason: d.reason,
          approvedBy: d.approvedBy || 'IT Manager',
          notes: d.notes || '', salePrice: '',
        })
        get().updateAsset(assetId, {
          assignedTo: d.toId,
          dept: d.dept || asset.dept,
          location: d.location || asset.location,
          status: 'Active',
        })
      },

      // -- Dispose -------------------------------------------
      disposeAsset(assetId, d) {
        if (d._fromPurchaseForm) {
          const asset = get().assets.find(a => a.id === assetId)
          get().addChainEvent({
            assetId, type: 'Sold',
            from: asset.assignedTo || 'IT Dept',
            to: d.buyer, dept: '', location: 'Sold',
            date: d.date, reason: 'Employee Purchase',
            approvedBy: d.approvedBy, notes: d.notes || '', salePrice: d.salePrice,
          })
          get().updateAsset(assetId, { status: 'Sold', assignedTo: '' })
          return
        }
        const asset = get().assets.find(a => a.id === assetId)
        get().addChainEvent({
          assetId, type: d.method,
          from: asset.assignedTo || 'IT Dept',
          to: d.buyer || d.method,
          dept: '', location: d.method,
          date: d.date, reason: d.method,
          approvedBy: d.approvedBy || 'Management',
          notes: d.notes || '', salePrice: d.salePrice || '',
        })
        get().updateAsset(assetId, {
          status: d.method === 'Sold' ? 'Sold' : 'Scrapped',
          assignedTo: '',
          notes: d.notes || asset.notes,
        })
      },

      // -- Reset / Seed / Import -----------------------------
      resetDatabase() {
        set({
          assets: [], employees: [], chain: [], services: [],
          upgrades: [], returns: [], purchases: [],
          counters: { AST: 0, EMP: 0, EVT: 0, SVC: 0, UPG: 0, RET: 0, PUR: 0 },
          settings: { orgName: 'My Organization', logo: '', currency: 'PKR' },
        })
      },
      loadSeedData() { set({ ...SEED }) },
      importData(data) {
        set({
          assets:    data.assets    || [],
          employees: data.employees || [],
          chain:     data.chain     || [],
          services:  data.services  || [],
          upgrades:  data.upgrades  || [],
          returns:   data.returns   || [],
          purchases: data.purchases || [],
          counters:  data.counters  || { AST:0, EMP:0, EVT:0, SVC:0, UPG:0, RET:0, PUR:0 },
          settings:  data.settings  || { orgName:'My Organization', logo:'', currency:'PKR' },
        })
      },
    }),
    {
      name: 'assetflow-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
