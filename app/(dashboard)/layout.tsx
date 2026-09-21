import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell user={{ name: user.name, role: user.role, organization: { name: user.organization.name } }}>{children}</AppShell>;
}
