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
};

type Employee = {
  id: string;
  full_name: string;
  employee_code: string;
};

type Asset = {
  id: string;
  asset_code: string;
  serial_number: string;
  asset_name?: string | null;
  status: string;
};

const initialForm = {
  asset_code: "",
  serial_number: "",
  asset_name: "",
  generation: "",
  ram: "",
  storage_spec: "",
  screen_size: "",
  purchase_date: "",
  warranty_expires_on: "",
  purchase_cost: "",
  notes: "",
  status: "IN_STOCK",
  category_id: "",
  current_employee_id: ""
};

export function AssetsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [bootstrap, categoryList, employeeList, assetList] = await Promise.all([
        fetchJson<Organization | null>("/organizations/bootstrap"),
        fetchJson<Category[]>("/catalog/categories"),
        fetchJson<Employee[]>("/employees"),
        fetchJson<Asset[]>("/assets")
      ]);
      setOrganization(bootstrap);
      setCategories(categoryList);
      setEmployees(employeeList);
      setAssets(assetList);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load assets");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) {
      setError("Create an organization in Settings first.");
      return;
    }

    setSaving(true);
    try {
      await fetchJson<Asset>("/assets", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          organization_id: organization.id,
          category_id: form.category_id || null,
          current_employee_id: form.current_employee_id || null,
          purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : null,
          asset_name: form.asset_name || null,
          generation: form.generation || null,
          ram: form.ram || null,
          storage_spec: form.storage_spec || null,
          screen_size: form.screen_size || null,
          purchase_date: form.purchase_date || null,
          warranty_expires_on: form.warranty_expires_on || null,
          notes: form.notes || null
        })
      });
      setForm(initialForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <h3>Asset register</h3>
        <p className="muted">
          First working CRUD slice for the new backend. Assets are created in PostgreSQL through the API.
        </p>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Asset code"
          value={form.asset_code}
          onChange={(event) => setForm((current) => ({ ...current, asset_code: event.target.value }))}
          required
        />
        <input
          placeholder="Serial number"
          value={form.serial_number}
          onChange={(event) => setForm((current) => ({ ...current, serial_number: event.target.value }))}
          required
        />
        <input
          placeholder="Asset name"
          value={form.asset_name}
          onChange={(event) => setForm((current) => ({ ...current, asset_name: event.target.value }))}
        />
        <select
          value={form.category_id}
          onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={form.current_employee_id}
          onChange={(event) => setForm((current) => ({ ...current, current_employee_id: event.target.value }))}
        >
          <option value="">Unassigned</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>
        <select
          value={form.status}
          onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="IN_STOCK">In stock</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="UNDER_REPAIR">Under repair</option>
        </select>
        <button type="submit" className="button button--primary" disabled={saving}>
          {saving ? "Saving..." : "Create asset"}
        </button>
      </form>

      <div className="card">
        <h4>Current assets</h4>
        <div className="table">
          <div className="table__head">
            <span>Code</span>
            <span>Serial</span>
            <span>Name</span>
            <span>Status</span>
          </div>
          {assets.map((asset) => (
            <div className="table__row" key={asset.id}>
              <span>{asset.asset_code}</span>
              <span>{asset.serial_number}</span>
              <span>{asset.asset_name || "--"}</span>
              <span>{asset.status}</span>
            </div>
          ))}
          {assets.length === 0 ? <p className="muted">No assets yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
