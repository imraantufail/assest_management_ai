import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { fetchJson } from "../../lib/api";

type Organization = {
  id: string;
  name: string;
  code: string;
  currency_code: string;
};

type Category = {
  id: string;
  name: string;
  code?: string | null;
};

export function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizationForm, setOrganizationForm] = useState({
    name: "",
    code: "",
    currency_code: "PKR",
    logo_url: ""
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", code: "", description: "" });
  const [error, setError] = useState("");

  async function loadSettings() {
    try {
      const [bootstrap, categoryList] = await Promise.all([
        fetchJson<Organization | null>("/organizations/bootstrap"),
        fetchJson<Category[]>("/catalog/categories")
      ]);
      setOrganization(bootstrap);
      setCategories(categoryList);
      if (bootstrap) {
        setOrganizationForm({
          name: bootstrap.name,
          code: bootstrap.code,
          currency_code: bootstrap.currency_code,
          logo_url: ""
        });
      }
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load settings");
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function handleOrganizationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await fetchJson<Organization>("/organizations", {
        method: "POST",
        body: JSON.stringify({
          ...organizationForm,
          logo_url: organizationForm.logo_url || null
        })
      });
      setOrganization(created);
      await loadSettings();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create organization");
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await fetchJson<Category>("/catalog/categories", {
        method: "POST",
        body: JSON.stringify({
          ...categoryForm,
          code: categoryForm.code || null,
          description: categoryForm.description || null
        })
      });
      setCategoryForm({ name: "", code: "", description: "" });
      await loadSettings();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create category");
    }
  }

  return (
    <div className="stack">
      <div>
        <h3>Settings and bootstrap</h3>
        <p className="muted">
          Create your first organization here, then use categories, employees, and assets against the live API.
        </p>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <form className="card form-grid" onSubmit={handleOrganizationSubmit}>
        <h4>Organization</h4>
        <input
          placeholder="Organization name"
          value={organizationForm.name}
          onChange={(event) => setOrganizationForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <input
          placeholder="Organization code"
          value={organizationForm.code}
          onChange={(event) => setOrganizationForm((current) => ({ ...current, code: event.target.value }))}
          required
        />
        <input
          placeholder="Currency code"
          value={organizationForm.currency_code}
          onChange={(event) =>
            setOrganizationForm((current) => ({ ...current, currency_code: event.target.value.toUpperCase() }))
          }
          required
        />
        <button type="submit" className="button button--primary" disabled={Boolean(organization)}>
          {organization ? "Organization created" : "Create organization"}
        </button>
      </form>

      <form className="card form-grid" onSubmit={handleCategorySubmit}>
        <h4>Asset categories</h4>
        <input
          placeholder="Category name"
          value={categoryForm.name}
          onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <input
          placeholder="Code"
          value={categoryForm.code}
          onChange={(event) => setCategoryForm((current) => ({ ...current, code: event.target.value }))}
        />
        <input
          placeholder="Description"
          value={categoryForm.description}
          onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
        />
        <button type="submit" className="button button--primary">
          Create category
        </button>
      </form>

      <div className="card">
        <h4>Current configuration</h4>
        <p className="muted">
          Organization: {organization ? `${organization.name} (${organization.code})` : "Not created yet"}
        </p>
        <ul className="list">
          {categories.map((category) => (
            <li key={category.id}>
              {category.name} {category.code ? `(${category.code})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
