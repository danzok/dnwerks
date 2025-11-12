import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black">
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </div>
  );
}