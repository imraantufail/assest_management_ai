const metricCards = [
  { label: "Assets", value: "0", hint: "Backed by PostgreSQL in the rebuild" },
  { label: "Employees", value: "0", hint: "Directory, assignments, and exits" },
  { label: "Open maintenance", value: "0", hint: "Preventive and corrective work" },
  { label: "Expiring warranties", value: "0", hint: "Alert module placeholder" }
];

export function DashboardPage() {
  return (
    <div className="stack">
      <div>
        <h3>Migration-ready dashboard</h3>
        <p className="muted">
          This shell will replace the current localStorage summary with API-driven metrics,
          recent lifecycle events, warranty alerts, and branch-level insights.
        </p>
      </div>

      <div className="grid grid--metrics">
        {metricCards.map((card) => (
          <article key={card.label} className="card">
            <p className="card__label">{card.label}</p>
            <p className="card__value">{card.value}</p>
            <p className="muted">{card.hint}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
