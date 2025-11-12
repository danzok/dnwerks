"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Shield 
} from "lucide-react"

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

interface UserManagementTabProps {
  users: UserProfile[];
  onUsersChange: (users: UserProfile[]) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
  onRefresh: () => void;
}

export default function UserManagementTab({ 
  users, 
  onUsersChange, 
  onShowSuccess, 
  onShowError,
  onRefresh 
}: UserManagementTabProps) {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = totalUsers - adminUsers;

  // Create user with authentication
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting user creation...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      console.log('✅ Session found, creating user...');
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: userForm.email,
          password: userForm.password,
          full_name: userForm.full_name,
          role: userForm.role,
        }),
      });

      console.log('📡 Create user API response status:', response.status);

      const data = await response.json();
      console.log('📡 Create user API response:', data);

      if (!response.ok) {
        console.error('❌ Create user error:', data);
        setError(data.error || 'Failed to create user');
        return;
      }

      setSuccess(data.message || 'User created successfully!');
      setUserForm({ email: '', password: '', full_name: '', role: 'user' });
      onShowSuccess(data.message || 'User created successfully!');
      
      // Wait a moment then refresh users
      setTimeout(() => {
        onRefresh();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Create user exception:', error);
      setError(error.message || 'Failed to create user');
      onShowError(error.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete user with authentication
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Starting user deletion...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      console.log('✅ Session found, deleting user...');
      
      const response = await fetch(`/api/admin/users?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('📡 Delete user API response status:', response.status);

      const data = await response.json();
      console.log('📡 Delete user API response:', data);

      if (!response.ok) {
        console.error('❌ Delete user error:', data);
        setError(data.error || 'Failed to delete user');
        return;
      }

      setSuccess('User deleted successfully!');
      onShowSuccess('User deleted successfully!');
      
      // Wait a moment then refresh users
      setTimeout(() => {
        onRefresh();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Delete user exception:', error);
      setError(error.message || 'Failed to delete user');
      onShowError(error.message || 'Failed to delete user');
    }
  };

  // Toggle user role with authentication
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      console.log('🔄 Starting role toggle...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      console.log('✅ Session found, toggling role...');
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          role: newRole,
        }),
      });

      console.log('📡 Toggle role API response status:', response.status);

      const data = await response.json();
      console.log('📡 Toggle role API response:', data);

      if (!response.ok) {
        console.error('❌ Toggle role error:', data);
        setError(data.error || 'Failed to update user role');
        return;
      }

      setSuccess(`User role updated to ${newRole} successfully!`);
      onShowSuccess(`User role updated to ${newRole} successfully!`);
      
      // Wait a moment then refresh users
      setTimeout(() => {
        onRefresh();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Toggle role exception:', error);
      setError(error.message || 'Failed to update user role');
      onShowError(error.message || 'Failed to update user role');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, manage, and configure user accounts and permissions.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold font-mono text-foreground">
                    {totalUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Admin Users
                  </p>
                  <p className="text-3xl font-bold font-mono text-foreground">
                    {adminUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    System administrators
                  </p>
                </div>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Regular Users
                  </p>
                  <p className="text-3xl font-bold font-mono text-foreground">
                    {regularUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Standard user accounts
                  </p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create User Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Create New User
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Add a new user to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-3">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">{success}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-foreground">Role</Label>
                  <select
                    id="role"
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-2 border-input rounded-lg bg-background text-foreground"
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
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                User Management ({filteredUsers.length})
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Manage existing users and their permissions
              </CardDescription>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm bg-background border-input"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base font-medium text-muted-foreground mb-2">
                      {searchTerm ? 'No users found' : 'No users yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Try a different search term' : 'Create your first user to get started'}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-sm text-foreground">
                            {user.full_name || user.email?.split('@')[0] || 'Unknown User'}
                          </div>
                          <Badge variant={user.role === 'admin' ? 'secondary' : 'success'} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                          {user.last_login_at && ` • Last login: ${new Date(user.last_login_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRole(user.user_id, user.role)}
                          className="h-8 px-2 text-xs"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role === 'admin' ? 'User' : 'Admin'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
  );
}