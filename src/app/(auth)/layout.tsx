import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";

// Force dynamic rendering for this layout and all child routes
export const dynamic = 'force-dynamic';

export default async function AuthRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const authResult = await auth();
  
  if (!authResult.userId) {
    redirect('/login');
  }

  return <>{children}</>;
}