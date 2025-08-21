
// app/dashboard/layout.tsx
import AuthProvider from "../../providers/AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
