import { DashboardLayout } from "@/components/dashboard-layout";
import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function DashboardRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const authResult = await auth();
  
  if (!authResult.userId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black">
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </div>
  );
}