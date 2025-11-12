"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  BarChart3,
  Activity,
  LogOut,
  Search,
  Edit,
  Trash2,
  Save,
  Bell,
  Database,
  Mail,
  Phone,
  Home
} from "lucide-react"

// Import tab components
import OverviewTab from './tabs/OverviewTab'
import UserManagementTab from './tabs/UserManagementTab'
import SystemSettingsTab from './tabs/SystemSettingsTab'

// Type definitions
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string | null;
  role: 'admin' | 'user';
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  auth_user?: {
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
  };
}

interface SystemSettings {
  id: string;
  site_name: string;
  site_description: string;
  allow_user_registration: boolean;
  require_email_verification: boolean;
  default_user_role: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  max_campaigns_per_user: number;
  max_contacts_per_user: number;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboardClient() {
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('🔐 No session found, redirecting to login');
        router.push('/login');
        return;
      }

      // Check if user is admin by fetching their profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Profile fetch error:', profileError);
        setError('User profile not found');
        return;
      }

      if (profile.role !== 'admin') {
        console.log('🚫 User is not admin, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }

      setAuthChecked(true);

      // Fetch users
      const usersResponse = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      } else {
        console.error('Failed to fetch users');
      }

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code === 'PGRST116') {
        // Create default settings if none exist
        await createDefaultSettings();
      } else if (settingsData) {
        setSettings(settingsData);
      }

    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Create default settings
  const createDefaultSettings = async () => {
    const defaultSettings = {
      site_name: 'DNwerks SMS Dashboard',
      site_description: 'Professional SMS marketing platform',
      allow_user_registration: true,
      require_email_verification: true,
      default_user_role: 'user',
      maintenance_mode: false,
      maintenance_message: 'System is currently under maintenance. Please try again later.',
      email_notifications: true,
      sms_notifications: true,
      max_campaigns_per_user: 10,
      max_contacts_per_user: 1000
    };

    try {
      const { data } = await supabase
        .from('system_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Show success message
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Refresh data
  const refreshData = () => {
    fetchInitialData();
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-semibold mb-2">Verifying Admin Access</h2>
                <p className="text-muted-foreground">Please wait while we verify your permissions...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
               <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Manage system settings and users</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="gap-2 h-9 px-3 text-sm">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 h-9 px-3 text-sm">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Success/Error Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <AlertDescription className="text-blue-700 dark:text-blue-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-11 p-1 bg-muted">
            <TabsTrigger value="overview" className="gap-2 font-medium text-sm">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 font-medium text-sm">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 font-medium text-sm">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <OverviewTab 
              users={users} 
              settings={settings}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <UserManagementTab 
              users={users}
              onUsersChange={setUsers}
              onShowSuccess={showSuccess}
              onShowError={setError}
              onRefresh={refreshData}
            />
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <SystemSettingsTab
              onShowSuccess={showSuccess}
              onShowError={setError}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}