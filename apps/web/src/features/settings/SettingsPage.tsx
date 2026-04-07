const settingsAreas = [
  "Organization profile, currency, logo, and branch setup",
  "Role and permission management",
  "Import/export templates and migration tools",
  "Retention, audit, and storage configuration"
];

export function SettingsPage() {
  return (
    <div className="stack">
      <div>
        <h3>Administration and migration controls</h3>
        <p className="muted">
          The old reset-and-replace settings page becomes a safer admin area with backups, imports, and permissions.
        </p>
      </div>

      <div className="card">
        <ul className="list">
          {settingsAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
