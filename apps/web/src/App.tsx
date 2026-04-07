import { AppShell } from "./components/layout/AppShell";
import { AssetsPage } from "./features/assets/AssetsPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { EmployeesPage } from "./features/employees/EmployeesPage";
import { SettingsPage } from "./features/settings/SettingsPage";

const modules = [
  { key: "dashboard", label: "Dashboard", component: <DashboardPage /> },
  { key: "assets", label: "Assets", component: <AssetsPage /> },
  { key: "employees", label: "Employees", component: <EmployeesPage /> },
  { key: "settings", label: "Settings", component: <SettingsPage /> }
] as const;

export default function App() {
  return <AppShell modules={modules} />;
}
