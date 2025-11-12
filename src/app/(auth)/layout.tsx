import { auth } from "@/lib/auth-server";
import { redirect } from "next/navigation";

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