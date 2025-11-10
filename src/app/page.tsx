import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // BYPASS AUTHENTICATION IN DEVELOPMENT
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (!isDevelopment) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // If user is authenticated, redirect to dashboard
    if (session) {
      redirect("/dashboard");
    }
  }

  // Redirect to simple sign-in page instead of landing page
  redirect("/sign-in");
}