import type { ReactNode } from "react";
import { useState } from "react";

type Module = {
  key: string;
  label: string;
  component: ReactNode;
};

type AppShellProps = {
  modules: readonly Module[];
};

export function AppShell({ modules }: AppShellProps) {
  const [activeKey, setActiveKey] = useState(modules[0]?.key ?? "dashboard");
  const activeModule = modules.find((module) => module.key === activeKey) ?? modules[0];

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div>
          <p className="eyebrow">AssetFlow</p>
          <h1 className="title">Modern asset management</h1>
          <p className="muted">
            React, FastAPI, and PostgreSQL scaffolded for a production-grade rebuild.
          </p>
        </div>

        <nav className="nav">
          {modules.map((module) => (
            <button
              key={module.key}
              className={`nav__item ${module.key === activeKey ? "is-active" : ""}`}
              onClick={() => setActiveKey(module.key)}
              type="button"
            >
              {module.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="shell__content">
        <header className="hero">
          <div>
            <p className="eyebrow">Rebuild workspace</p>
            <h2>{activeModule?.label}</h2>
          </div>
          <div className="hero__badge">API target: /api</div>
        </header>

        <section className="panel">{activeModule?.component}</section>
      </main>
    </div>
  );
}
