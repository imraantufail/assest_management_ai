import { useEffect, useState } from "react";

import { fetchJson } from "../../lib/api";

type DashboardSummary = {
  total_assets: number;
  assigned_assets: number;
  in_stock_assets: number;
  under_repair_assets: number;
  disposed_assets: number;
  active_employees: number;
  pending_maintenance: number;
  expiring_warranties: number;
};

const emptySummary: DashboardSummary = {
  total_assets: 0,
  assigned_assets: 0,
  in_stock_assets: 0,
  under_repair_assets: 0,
  disposed_assets: 0,
  active_employees: 0,
  pending_maintenance: 0,
  expiring_warranties: 0
};

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<DashboardSummary>("/dashboard/summary")
      .then((data) => {
        setSummary(data);
        setError("");
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
      });
  }, []);

  const metricCards = [
    { label: "Assets", value: String(summary.total_assets), hint: "All registered assets" },
    { label: "Assigned", value: String(summary.assigned_assets), hint: "Currently issued assets" },
    { label: "Employees", value: String(summary.active_employees), hint: "Active staff members" },
    { label: "Open maintenance", value: String(summary.pending_maintenance), hint: "Planned or in progress" },
    { label: "In stock", value: String(summary.in_stock_assets), hint: "Available inventory" },
    { label: "Under repair", value: String(summary.under_repair_assets), hint: "Service queue visibility" },
    { label: "Disposed", value: String(summary.disposed_assets), hint: "Sold, scrapped, or retired" },
    { label: "Expiring warranties", value: String(summary.expiring_warranties), hint: "Next alert module target" }
  ];

  return (
    <div className="stack">
      <div>
        <h3>Live dashboard</h3>
        <p className="muted">
          This page now reads its metrics from the FastAPI backend instead of local browser state.
        </p>
      </div>

      {error ? <p className="error">{error}</p> : null}

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
