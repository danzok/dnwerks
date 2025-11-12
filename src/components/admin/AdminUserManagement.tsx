'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Search, Edit, Trash2, Shield } from 'lucide-react'

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

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
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

  const supabase = createClient();

  // Fetch users with authentication
  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found');
        setError('Not authenticated');
        return;
      }

      console.log('✅ Session found, fetching users...');
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setError(errorData.error || 'Failed to fetch users');
        return;
      }

      const data = await response.json();
      console.log('✅ Users fetched successfully:', data.data?.length || 0);
      setUsers(data.data || []);
    } catch (error) {
      console.error('❌ Fetch users error:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

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
        console.error('❌ No session found');
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
      
      // Wait a moment then refresh users
      setTimeout(async () => {
        await fetchUsers();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Create user exception:', error);
      setError(error.message || 'Failed to create user');
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
        console.error('❌ No session found');
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
      
      // Wait a moment then refresh users
      setTimeout(async () => {
        await fetchUsers();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Delete user exception:', error);
      setError(error.message || 'Failed to delete user');
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
        console.error('❌ No session found');
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
      
      // Wait a moment then refresh users
      setTimeout(async () => {
        await fetchUsers();
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Toggle role exception:', error);
      setError(error.message || 'Failed to update user role');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = totalUsers - adminUsers;

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </CardTitle>
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
              <Users className="h-5 w-5" />
              User Management ({filteredUsers.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {searchTerm ? 'No users found' : 'No users yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try a different search term' : 'Create your first user to get started'}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(user.user_id, user.role)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteUser(user.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
}