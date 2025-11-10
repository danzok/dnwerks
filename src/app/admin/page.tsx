"use client"

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, Settings, Search, Filter, UserPlus, Mail, Key, Database, TrendingUp, BarChart3, UserCheck, UserX, Settings2, Activity } from "lucide-react";

interface User {
  id: string;
  name?: string;
  email?: string;
  status: string;
  role: string;
  created_at?: string;
  joined?: string;
  auth_user?: {
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
  };
}

interface Invite {
  id: string;
  email?: string;
  code: string;
  used: boolean;
  created_at?: string;
  expires_at?: string;
  notes?: string;
}

interface DashboardStats {
  users: {
    total: number;
    active: number;
    pending: number;
    admins: number;
    new_this_month: number;
  };
  invites: {
    total: number;
    active: number;
    used: number;
  };
  campaigns: {
    total: number;
    active: number;
    completed: number;
    total_messages: number;
    messages_today: number;
  };
  system_health: {
    database: string;
    auth: string;
    storage: string;
    realtime: string;
  };
  recent_activity: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user',
    message: ''
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all required data in parallel
      const [
        usersResponse,
        invitesResponse,
        dashboardResponse,
        pendingUsersResponse
      ] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/invites'),
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/users/pending')
      ]);

      // Handle responses with better error handling
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      if (invitesResponse.ok) {
        const invitesData = await invitesResponse.json();
        setInvites(invitesData.invites || []);
      }

      if (dashboardResponse.ok) {
        const statsData = await dashboardResponse.json();
        setDashboardStats(statsData);
      }

      if (pendingUsersResponse.ok) {
        const pendingData = await pendingUsersResponse.json();
        setPendingUsers(pendingData.pending_users || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteForm.email) {
      alert('Please enter an email address');
      return;
    }

    setInviteLoading(true);
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
          maxUses: 1,
          expiresDays: 7,
          notes: inviteForm.message || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear form
        setInviteForm({ email: '', role: 'user', message: '' });
        // Refresh data
        fetchDashboardData();
        alert('Invitation sent successfully!');
      } else {
        alert(`Error: ${data.error || 'Failed to send invitation'}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground mt-2">Manage users, system settings, and platform administration</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>

            {/* Main Tabbed Interface */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="invite">Invite User</TabsTrigger>
                <TabsTrigger value="requests">User Requests</TabsTrigger>
                <TabsTrigger value="roles">User Roles</TabsTrigger>
                <TabsTrigger value="database">Database Status</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border bg-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold text-foreground mt-1">
                            {loading ? '...' : (dashboardStats?.users.total || users.length)}
                          </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border bg-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                          <p className="text-2xl font-bold text-foreground mt-1">
                            {loading ? '...' : (dashboardStats?.users.active || users.filter(u => u.status === 'approved').length)}
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border bg-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                          <p className="text-2xl font-bold text-foreground mt-1">
                            {loading ? '...' : (dashboardStats?.users.pending || pendingUsers.length)}
                          </p>
                        </div>
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border bg-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Invites</p>
                          <p className="text-2xl font-bold text-foreground mt-1">
                            {loading ? '...' : (dashboardStats?.invites.active || invites.filter(i => !i.used).length)}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Overview */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      System Overview
                    </CardTitle>
                    <CardDescription>
                      Platform health and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-foreground">System Health</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Database</span>
                            <Badge className={
                              dashboardStats?.system_health.database === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {loading ? '...' : (dashboardStats?.system_health.database || 'Unknown')}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Authentication</span>
                            <Badge className={
                              dashboardStats?.system_health.auth === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {loading ? '...' : (dashboardStats?.system_health.auth || 'Unknown')}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Storage</span>
                            <Badge className={
                              dashboardStats?.system_health.storage === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {loading ? '...' : (dashboardStats?.system_health.storage || 'Unknown')}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Real-time</span>
                            <Badge className={
                              dashboardStats?.system_health.realtime === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {loading ? '...' : (dashboardStats?.system_health.realtime || 'Unknown')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium text-foreground">Recent Activity</h4>
                        <div className="space-y-3">
                          {loading ? (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-sm text-muted-foreground">Loading activity...</div>
                            </div>
                          ) : dashboardStats?.recent_activity?.length > 0 ? (
                            dashboardStats.recent_activity.slice(0, 3).map((activity) => (
                              <div key={activity.id} className="p-3 bg-muted/50 rounded-lg">
                                <div className="text-sm text-foreground">{activity.message}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-sm text-muted-foreground">No recent activity</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Invite User Tab */}
              <TabsContent value="invite" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Invite Form */}
                  <Card className="border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                        Send Invitation
                      </CardTitle>
                      <CardDescription>
                        Invite a new user to join the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          className="border border-border"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Role</label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger className="border border-border">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Message (Optional)</label>
                        <textarea
                          placeholder="Add a personal message to the invitation"
                          className="w-full p-3 border border-border rounded-md resize-none h-24"
                          value={inviteForm.message}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleSendInvitation}
                        disabled={inviteLoading || !inviteForm.email}
                      >
                        {inviteLoading ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Active Invites */}
                  <Card className="border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle>Active Invitations</CardTitle>
                      <CardDescription>
                        Currently pending invitations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {loading ? (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">Loading invitations...</div>
                          </div>
                        ) : invites.filter(i => !i.used).length > 0 ? (
                          invites.filter(i => !i.used).map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {invite.email || 'General invitation'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Code: {invite.code}
                                  {invite.expires_at && ` • Expires: ${new Date(invite.expires_at).toLocaleDateString()}`}
                                </div>
                                {invite.notes && (
                                  <div className="text-xs text-muted-foreground mt-1">Notes: {invite.notes}</div>
                                )}
                              </div>
                              <Button size="sm" variant="outline">Revoke</Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">No active invitations</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* User Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <Card className="border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-muted-foreground" />
                      Pending User Approvals
                    </CardTitle>
                    <CardDescription>
                      Review and approve user registration requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Loading pending users...</div>
                        </div>
                      ) : pendingUsers.length > 0 ? (
                        pendingUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div>
                              <div className="font-medium text-foreground">
                                {user.auth_user?.email ? user.auth_user.email.split('@')[0] : 'Unknown User'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.auth_user?.email || 'No email available'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Requested: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown date'}
                              </div>
                              {user.auth_user?.last_sign_in_at && (
                                <div className="text-xs text-muted-foreground">
                                  Last seen: {new Date(user.auth_user.last_sign_in_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                  try {
                                    const response = await fetch('/api/admin/users/approve', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: user.id })
                                    });
                                    if (response.ok) {
                                      fetchDashboardData(); // Refresh data
                                    }
                                  } catch (error) {
                                    console.error('Error approving user:', error);
                                  }
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const response = await fetch('/api/admin/users/reject', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: user.id })
                                    });
                                    if (response.ok) {
                                      fetchDashboardData(); // Refresh data
                                    }
                                  } catch (error) {
                                    console.error('Error rejecting user:', error);
                                  }
                                }}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground text-center">
                            No pending user approvals
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Roles Tab */}
              <TabsContent value="roles" className="space-y-6">
                <Card className="border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-muted-foreground" />
                      User Role Management
                    </CardTitle>
                    <CardDescription>
                      Manage user roles and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11 border border-border"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40 h-11 border border-border">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Users Table */}
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-4 font-medium text-foreground">User</th>
                              <th className="text-left p-4 font-medium text-foreground">Status</th>
                              <th className="text-left p-4 font-medium text-foreground">Current Role</th>
                              <th className="text-left p-4 font-medium text-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                  Loading users...
                                </td>
                              </tr>
                            ) : users.length > 0 ? (
                              users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/30">
                                  <td className="p-4">
                                    <div>
                                      <div className="font-medium text-foreground">
                                        {user.auth_user?.email ? user.auth_user.email.split('@')[0] : 'Unknown User'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {user.auth_user?.email || 'No email available'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <Badge className={
                                      user.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {user.status}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-sm text-muted-foreground capitalize">
                                      {user.role || 'user'}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex gap-2">
                                      <Select
                                        defaultValue={user.role || 'user'}
                                        onValueChange={async (newRole) => {
                                          try {
                                            const response = await fetch('/api/admin/users', {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                userId: user.id,
                                                action: 'update_role',
                                                role: newRole
                                              })
                                            });
                                            if (response.ok) {
                                              fetchDashboardData(); // Refresh data
                                            }
                                          } catch (error) {
                                            console.error('Error updating user role:', error);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-32">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="user">User</SelectItem>
                                          <SelectItem value="admin">Admin</SelectItem>
                                          <SelectItem value="moderator">Moderator</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                  No users found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Role Definitions */}
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-foreground mb-3">Role Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-foreground mb-2">User</h5>
                          <p className="text-sm text-muted-foreground">Can view campaigns, create messages, and manage own content</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Moderator</h5>
                          <p className="text-sm text-muted-foreground">Can manage campaigns and approve content, plus all user permissions</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Admin</h5>
                          <p className="text-sm text-muted-foreground">Full system access including user management and system settings</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Database Status Tab */}
              <TabsContent value="database" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Connection Status */}
                  <Card className="border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        Connection Status
                      </CardTitle>
                      <CardDescription>
                        Database and service connectivity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Database</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Supabase Auth</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Storage</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Real-time</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Database Statistics */}
                  <Card className="border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle>Database Statistics</CardTitle>
                      <CardDescription>
                        Current database metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Total Users</span>
                        <span className="text-sm font-bold text-foreground">
                          {loading ? '...' : (dashboardStats?.users.total || users.length)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Active Campaigns</span>
                        <span className="text-sm font-bold text-foreground">
                          {loading ? '...' : (dashboardStats?.campaigns.active || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Total Messages</span>
                        <span className="text-sm font-bold text-foreground">
                          {loading ? '...' : (dashboardStats?.campaigns.total_messages || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-foreground">Active Invites</span>
                        <span className="text-sm font-bold text-foreground">
                          {loading ? '...' : (dashboardStats?.invites.active || invites.filter(i => !i.used).length)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Health Metrics */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      System Health Metrics
                    </CardTitle>
                    <CardDescription>
                      Performance and usage monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">99.9%</div>
                        <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">142ms</div>
                        <div className="text-sm text-muted-foreground mt-1">Avg Response</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">1,234</div>
                        <div className="text-sm text-muted-foreground mt-1">API Calls Today</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">0.2%</div>
                        <div className="text-sm text-muted-foreground mt-1">Error Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}