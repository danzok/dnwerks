import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email?: string;
  name?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // DEVELOPMENT BYPASS: Check if we're in development mode without Supabase config
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_supabase_anon_key_here');

    // If no Supabase config in production or development without proper setup, use mock user
    if (!hasSupabaseConfig) {
      console.log('🔐 useUser: Using mock user - Supabase not configured');
      const mockUser: User = {
        id: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User'
      };

      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    // Get initial user session
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading };
}