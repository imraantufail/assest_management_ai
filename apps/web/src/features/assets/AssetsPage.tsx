const assetFeatures = [
  "Asset register with normalized category, brand, model, branch, department, and location",
  "Assignment, transfer, return, repair, and disposal workflows",
  "Attachments, QR labels, and warranty tracking",
  "Bulk import/export and advanced filters"
];

export function AssetsPage() {
  return (
    <div className="stack">
      <div>
        <h3>Asset module blueprint</h3>
        <p className="muted">
          The new backend will become the source of truth for every asset, instead of the browser.
        </p>
      </div>

      <div className="card">
        <ul className="list">
          {assetFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
