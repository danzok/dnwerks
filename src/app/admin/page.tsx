"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Users, UserPlus, Mail, Shield } from "lucide-react"

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

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  // Check if current user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get user profile to check if admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // User is admin, fetch users
      await fetchUsers();
    };

    checkAdminAccess();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        // Get auth user info for each profile
        const usersWithAuth = await Promise.all(
          (usersData || []).map(async (profile: any) => {
            try {
              const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
              return {
                ...profile,
                auth_user: authUser.user ? {
                  email: authUser.user.email,
                  created_at: authUser.user.created_at,
                  last_sign_in_at: authUser.user.last_sign_in_at
                } : null
              };
            } catch (authError) {
              return {
                ...profile,
                auth_user: null
              };
            }
          })
        );
        setUsers(usersWithAuth);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create Supabase user
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: userForm.email,
        password: userForm.password,
        email_confirm: true,
        user_metadata: {
          full_name: userForm.full_name || '',
        },
      });

      if (createError) {
        setError(createError.message);
        return;
      }

      // Create user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.user.id,
          email: userForm.email,
          full_name: userForm.full_name || null,
          role: userForm.role,
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, delete auth user to maintain consistency
        await supabase.auth.admin.deleteUser(authUser.user.id);
        setError(profileError.message);
        return;
      }

      setSuccess('User created successfully!');
      setUserForm({ email: '', password: '', full_name: '', role: 'user' });
      await fetchUsers(); // Refresh users list

    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center h-64">
              <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
                  <p className="text-muted-foreground">Please wait while we verify your access.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="ml-auto">
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Create User Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                Create New User
              </CardTitle>
              <CardDescription>
                Add a new user to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="•••••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating User...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                System Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No users found</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first user to get started
                    </p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900">
                            {user.full_name || user.email?.split('@')[0] || 'Unknown User'}
                          </div>
                          <Badge className={
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                          {user.last_login_at && ` • Last login: ${new Date(user.last_login_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.auth_user?.last_sign_in_at &&
                          `Auth: ${new Date(user.auth_user.last_sign_in_at).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}