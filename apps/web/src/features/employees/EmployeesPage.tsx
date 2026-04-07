import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { fetchJson } from "../../lib/api";

type Organization = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  employee_code: string;
  full_name: string;
  email?: string | null;
  job_title?: string | null;
  status: string;
};

const initialForm = {
  employee_code: "",
  full_name: "",
  email: "",
  job_title: "",
  status: "ACTIVE",
  joined_on: "",
  left_on: "",
  notes: ""
};

export function EmployeesPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
    try {
      const [bootstrap, employeeList] = await Promise.all([
        fetchJson<Organization | null>("/organizations/bootstrap"),
        fetchJson<Employee[]>("/employees")
      ]);
      setOrganization(bootstrap);
      setEmployees(employeeList);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load employees");
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) {
      setError("Create an organization in Settings first.");
      return;
    }

    setSaving(true);
    try {
      await fetchJson<Employee>("/employees", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          organization_id: organization.id,
          email: form.email || null,
          job_title: form.job_title || null,
          joined_on: form.joined_on || null,
          left_on: form.left_on || null,
          notes: form.notes || null
        })
      });
      setForm(initialForm);
      await loadEmployees();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create employee");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <h3>Employee directory</h3>
        <p className="muted">This screen is now wired to the API instead of browser-only state.</p>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Employee code"
          value={form.employee_code}
          onChange={(event) => setForm((current) => ({ ...current, employee_code: event.target.value }))}
          required
        />
        <input
          placeholder="Full name"
          value={form.full_name}
          onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
          required
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          placeholder="Job title"
          value={form.job_title}
          onChange={(event) => setForm((current) => ({ ...current, job_title: event.target.value }))}
        />
        <select
          value={form.status}
          onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="LEFT">Left</option>
        </select>
        <button type="submit" className="button button--primary" disabled={saving}>
          {saving ? "Saving..." : "Create employee"}
        </button>
      </form>

      <div className="card">
        <h4>Current employees</h4>
        <div className="table">
          <div className="table__head">
            <span>Code</span>
            <span>Name</span>
            <span>Email</span>
            <span>Status</span>
          </div>
          {employees.map((employee) => (
            <div className="table__row" key={employee.id}>
              <span>{employee.employee_code}</span>
              <span>{employee.full_name}</span>
              <span>{employee.email || "--"}</span>
              <span>{employee.status}</span>
            </div>
          ))}
          {employees.length === 0 ? <p className="muted">No employees yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
