import * as XLSX from 'xlsx'
import { fmtDate } from './helpers'

export function exportToExcel(store) {
  const { assets, employees, chain, services, upgrades, returns, purchases } = store
  const wb = XLSX.utils.book_new()

  const eName = (id) => {
    if (!id) return ''
    if (id.startsWith('EMP')) return employees.find(e => e.id === id)?.name || id
    return id
  }

  // -- Assets ------------------------------------------------
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    assets.map(a => ({
      'Asset ID': a.id, 'Type': a.type, 'Make': a.make || '', 'Model': a.model,
      'Serial No.': a.serial, 'Generation': a.generation || '', 'RAM': a.ram || '',
      'HDD/SSD': a.hdd || '', 'Screen Size': a.screenSize || '',
      'Status': a.status, 'Assigned To (Name)': eName(a.assignedTo),
      'Employee ID': a.assignedTo || '', 'Department': a.dept || '', 'Location': a.location || '',
      'Purchase Date': fmtDate(a.purchaseDate), 'Cost (PKR)': a.cost || '',
      'Warranty Expiry': fmtDate(a.warranty), 'Notes': a.notes || '',
    }))
  ), 'Assets')

  // -- Employees ---------------------------------------------
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    employees.map(e => ({
      'Employee ID': e.id, 'Name': e.name, 'Department': e.dept,
      'Role': e.role, 'Join Date': fmtDate(e.join), 'Status': e.status,
      'Leaving Date': e.status === 'Left' ? fmtDate(e.left) : '',
      'Current Assets': assets.filter(a => a.assignedTo === e.id).length,
    }))
  ), 'Employees')

  // -- Chain of Custody --------------------------------------
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    [...chain].sort((a, b) => a.date.localeCompare(b.date)).map(e => ({
      'Event ID': e.id, 'Asset ID': e.assetId,
      'Asset Model': (assets.find(a => a.id === e.assetId) || {}).model || '',
      'Event Type': e.type, 'From': eName(e.from), 'To': eName(e.to),
      'Department': e.dept || '', 'Location': e.location || '',
      'Date': fmtDate(e.date), 'Reason': e.reason || '',
      'Approved By': e.approvedBy || '', 'Sale Price (PKR)': e.salePrice || '',
      'Notes': e.notes || '',
    }))
  ), 'Chain of Custody')

  // -- Upgrades ----------------------------------------------
  if (upgrades && upgrades.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      upgrades.map(u => ({
        'Upgrade ID': u.id, 'Asset ID': u.assetId,
        'Asset Model': (assets.find(a => a.id === u.assetId) || {}).model || '',
        'Component': u.component, 'From Spec': u.fromSpec || '',
        'To Spec': u.toSpec, 'Date': fmtDate(u.date),
        'Vendor': u.vendor || '', 'Cost (PKR)': u.cost || '',
        'Invoice No.': u.invoice || '', 'Approved By': u.approvedBy || '',
        'Notes': u.notes || '',
      }))
    ), 'Upgrades')
  }

  // -- Returns -----------------------------------------------
  if (returns && returns.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      returns.map(r => ({
        'Return ID': r.id, 'Asset ID': r.assetId,
        'Asset Model': (assets.find(a => a.id === r.assetId) || {}).model || '',
        'Employee': eName(r.empId), 'Employee ID': r.empId || '',
        'Return Date': fmtDate(r.returnDate), 'Condition': r.condition,
        'Data Wipe': r.datawipe, 'Accessories': r.accessories || '',
        'Checked By': r.checkedBy || '', 'Signed Off': r.signedOff ? 'Yes' : 'No',
        'Notes': r.notes || '',
      }))
    ), 'Returns')
  }

  // -- Employee Purchases ------------------------------------
  if (purchases && purchases.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      purchases.map(p => ({
        'Purchase ID': p.id, 'Asset ID': p.assetId,
        'Asset Model': (assets.find(a => a.id === p.assetId) || {}).model || '',
        'Buyer Name': p.buyerName, 'Buyer Employee ID': p.buyerEmpId || '',
        'Sale Date': fmtDate(p.saleDate), 'Sale Price (PKR)': p.salePrice || '',
        'Payment Method': p.paymentMethod, 'Invoice No.': p.invoiceNo || '',
        'Approved By': p.approvedBy || '', 'Signed Off': p.signedOff ? 'Yes' : 'No',
        'Notes': p.notes || '',
      }))
    ), 'Employee Purchases')
  }

  // -- Services ----------------------------------------------
  if (services && services.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      services.map(s => ({
        'Service ID': s.id, 'Asset ID': s.assetId,
        'Asset Model': (assets.find(a => a.id === s.assetId) || {}).model || '',
        'Type': s.type, 'Date': fmtDate(s.date), 'Technician': s.tech || '',
        'Cost (PKR)': s.cost || '', 'Issue / Work Done': s.issue || '',
        'Next Due': s.nextDue ? fmtDate(s.nextDue) : '', 'Status': s.status || '',
      }))
    ), 'Services')
  }

  XLSX.writeFile(wb, `AssetFlow_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// -- Import ----------------------------------------------------
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'binary' })
        const rows = (name) => {
          const ws = wb.Sheets[name]
          return ws ? XLSX.utils.sheet_to_json(ws) : []
        }

        const rawAssets    = rows('Assets')
        const rawEmployees = rows('Employees')
        const rawChain     = rows('Chain of Custody')
        const rawUpgrades  = rows('Upgrades')
        const rawReturns   = rows('Returns')
        const rawPurchases = rows('Employee Purchases')
        const rawServices  = rows('Services')

        const assets = rawAssets.map(r => ({
          id: r['Asset ID'] || '', type: r['Type'] || '', make: r['Make'] || '',
          model: r['Model'] || '', serial: r['Serial No.'] || '',
          generation: r['Generation'] || '', ram: r['RAM'] || '',
          hdd: r['HDD/SSD'] || '', screenSize: r['Screen Size'] || '',
          status: r['Status'] || 'Active', assignedTo: r['Employee ID'] || '',
          dept: r['Department'] || '', location: r['Location'] || '',
          purchaseDate: r['Purchase Date'] || '', cost: String(r['Cost (PKR)'] || ''),
          warranty: r['Warranty Expiry'] || '', notes: r['Notes'] || '',
        }))

        const employees = rawEmployees.map(r => ({
          id: r['Employee ID'] || '', name: r['Name'] || '', dept: r['Department'] || '',
          role: r['Role'] || '', join: r['Join Date'] || '',
          status: r['Status'] || 'Active', left: r['Leaving Date'] || '',
        }))

        const chain = rawChain.map(r => ({
          id: r['Event ID'] || '', assetId: r['Asset ID'] || '',
          type: r['Event Type'] || '', from: r['From'] || '', to: r['To'] || '',
          dept: r['Department'] || '', location: r['Location'] || '',
          date: r['Date'] || '', reason: r['Reason'] || '',
          approvedBy: r['Approved By'] || '', salePrice: String(r['Sale Price (PKR)'] || ''),
          notes: r['Notes'] || '',
        }))

        const upgrades = rawUpgrades.map(r => ({
          id: r['Upgrade ID'] || '', assetId: r['Asset ID'] || '',
          component: r['Component'] || '', fromSpec: r['From Spec'] || '',
          toSpec: r['To Spec'] || '', date: r['Date'] || '',
          vendor: r['Vendor'] || '', cost: String(r['Cost (PKR)'] || ''),
          invoice: r['Invoice No.'] || '', approvedBy: r['Approved By'] || '',
          notes: r['Notes'] || '',
        }))

        const returns = rawReturns.map(r => ({
          id: r['Return ID'] || '', assetId: r['Asset ID'] || '',
          empId: r['Employee ID'] || '', returnDate: r['Return Date'] || '',
          condition: r['Condition'] || '', datawipe: r['Data Wipe'] || '',
          accessories: r['Accessories'] || '', checkedBy: r['Checked By'] || '',
          signedOff: r['Signed Off'] === 'Yes', notes: r['Notes'] || '',
        }))

        const purchases = rawPurchases.map(r => ({
          id: r['Purchase ID'] || '', assetId: r['Asset ID'] || '',
          buyerName: r['Buyer Name'] || '', buyerEmpId: r['Buyer Employee ID'] || '',
          saleDate: r['Sale Date'] || '', salePrice: String(r['Sale Price (PKR)'] || ''),
          paymentMethod: r['Payment Method'] || '', invoiceNo: r['Invoice No.'] || '',
          approvedBy: r['Approved By'] || '', signedOff: r['Signed Off'] === 'Yes',
          notes: r['Notes'] || '',
        }))

        const services = rawServices.map(r => ({
          id: r['Service ID'] || '', assetId: r['Asset ID'] || '',
          type: r['Type'] || '', date: r['Date'] || '',
          tech: r['Technician'] || '', cost: String(r['Cost (PKR)'] || ''),
          issue: r['Issue / Work Done'] || '', nextDue: r['Next Due'] || '',
          status: r['Status'] || 'Done',
        }))

        // Recompute max counters from IDs
        const maxNum = (arr, prefix) => arr.reduce((m, x) => {
          const n = parseInt((x.id || '').replace(prefix + '-', '')) || 0
          return Math.max(m, n)
        }, 0)

        resolve({
          assets, employees, chain, upgrades, returns, purchases, services,
          counters: {
            AST: maxNum(assets,    'AST'),
            EMP: maxNum(employees, 'EMP'),
            EVT: maxNum(chain,     'EVT'),
            SVC: maxNum(services,  'SVC'),
            UPG: maxNum(upgrades,  'UPG'),
            RET: maxNum(returns,   'RET'),
            PUR: maxNum(purchases, 'PUR'),
          },
          settings: { orgName: 'My Organization', logo: '', currency: 'PKR' },
        })
      } catch (err) { reject(err) }
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}
