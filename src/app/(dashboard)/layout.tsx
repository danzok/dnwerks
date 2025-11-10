import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}