# AssetFlow — IT Asset Life Management System

A full-featured React + Vite web application for tracking IT assets (laptops, desktops) with complete chain-of-custody, high-turnover employee support, Excel import/export, and PDF report generation.

## Features

- **Asset Register** — Track every device with full lifecycle status
- **Chain of Custody** — Full traceability: Procurement → Employee A → Employee B → Scrapped
- **High-turnover Safe** — 35 assets can pass through 50+ employees; each handover is logged
- **Employee Management** — Active and former employees, assets held history
- **Transfer** — Move any asset between employees with reason & approval
- **Dispose / Sell / Scrap** — End-of-life with disposal method and sale price
- **Service Log** — Maintenance and repair records per asset
- **Excel Import / Export** — Full data round-trip via .xlsx
- **PDF Reports** — Per-asset chain report + full fleet PDF
- **Reset Database** — Wipe all data and reset ID counters to zero (start fresh)
- **Persistent Storage** — Data saved in browser localStorage automatically

## Setup & Run

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Steps

```bash
# 1. Unzip the project
unzip assetflow.zip
cd assetflow

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Starting Fresh (Practice Mode)
1. Go to **Settings → Reset Database**
2. Click "Reset Entire Database"
3. All counters reset to zero — first asset will be `AST-001`, first employee `EMP-001`

### Adding Assets
1. Click **+ New Asset** from the Assets page
2. Fill in device info, purchase details, and assign to an employee
3. A "Purchase" chain event is automatically created

### Transferring an Asset
1. From the Assets table, click the **↗** icon on any active asset
2. Select the receiving employee, reason, and date
3. The chain log is automatically updated

### Disposing / Selling
1. Click the **🗑** icon on any active asset
2. Choose method: Scrapped, Sold, Donated, or Returned to Vendor
3. Asset moves to the Scrapped & Sold page with full history

### Export & Backup
- **Settings → Export Excel** — downloads all data as .xlsx
- **Settings → Fleet PDF** — full printable report
- From any asset detail modal → **⬇ PDF** for single-asset chain report

### Import
- **Settings → Import Excel** — upload a previously exported .xlsx file
- Counters are automatically calculated from the imported IDs

## Data Storage

Data is stored in **browser localStorage** under the key `assetflow-db`.
- No backend or database server required
- Use Export regularly to create external backups
- Each browser/device has its own separate data store

## Tech Stack

| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Zustand | State management + localStorage persistence |
| xlsx | Excel import/export |
| jsPDF + jspdf-autotable | PDF generation |
| Inter + JetBrains Mono | Typography |
