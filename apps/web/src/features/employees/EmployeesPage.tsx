const employeeFeatures = [
  "Employee directory with branch, department, location, and lifecycle status",
  "User account linkage for role-based access",
  "Asset assignment history and offboarding workflow",
  "Former employee traceability for audit and chain-of-custody"
];

export function EmployeesPage() {
  return (
    <div className="stack">
      <div>
        <h3>Employee and user management</h3>
        <p className="muted">
          This module will absorb the current employee forms and extend them into a proper access and ownership system.
        </p>
      </div>

      <div className="card">
        <ul className="list">
          {employeeFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
