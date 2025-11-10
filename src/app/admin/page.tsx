"use client"

import { useState } from "react";
import { Suspense } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Shield, Settings, Search, Filter, UserPlus, Mail, Key, Database, TrendingUp, BarChart3 } from "lucide-react";

// Mock data
const users = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active", role: "admin", joined: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", role: "user", joined: "2024-01-20" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "pending", role: "user", joined: "2024-02-01" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", status: "inactive", role: "user", joined: "2024-02-10" },
];

const invites = [
  { id: 1, email: "newuser@example.com", code: "INVITE123", used: false, created: "2024-03-01" },
  { id: 2, email: "another@example.com", code: "INVITE456", used: true, created: "2024-02-15" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Simple Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-2">Manage users, system settings, and platform administration</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{users.length}</p>
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
                      <p className="text-2xl font-bold text-foreground mt-1">{users.filter(u => u.status === 'active').length}</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{users.filter(u => u.status === 'pending').length}</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Invites</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{invites.filter(i => !i.used).length}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <Button size="sm">
                      Invite
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Invite User</CardTitle>
                  <CardDescription>
                    Send invitation to new team member
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">System Settings</CardTitle>
                  <CardDescription>
                    Configure platform settings
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Database className="h-6 w-6 text-purple-600" />
                    </div>
                    <Button size="sm" variant="outline">
                      Backup
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Data Backup</CardTitle>
                  <CardDescription>
                    Manage system backups
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* User Management Section */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border border-gray-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 h-11 border border-gray-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">All Status</SelectItem>
                        <SelectItem value="active" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Active</SelectItem>
                        <SelectItem value="pending" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Pending</SelectItem>
                        <SelectItem value="inactive" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter />
                    </Button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-medium text-gray-900">User</th>
                          <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Role</th>
                          <th className="text-left p-4 font-medium text-gray-900">Joined</th>
                          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-600">{user.joined}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="outline">Reset</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Overview */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  System Overview
                </CardTitle>
                <CardDescription>
                  Platform health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">System Health</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">API Status</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Database</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">SMS Gateway</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-900">New user registered: John Doe</div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-900">Campaign completed: Spring Sale</div>
                        <div className="text-xs text-gray-500">5 hours ago</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-900">System backup completed</div>
                        <div className="text-xs text-gray-500">1 day ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Admin Tips</CardTitle>
                <CardDescription>
                  Important reminders for system administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">User Management</h4>
                    <p className="text-sm text-gray-600">Regularly review user permissions and remove inactive accounts to maintain security.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">System Monitoring</h4>
                    <p className="text-sm text-gray-600">Monitor API usage and system performance to ensure optimal service delivery.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Data Backup</h4>
                    <p className="text-sm text-gray-600">Ensure regular backups are performed and test recovery procedures periodically.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Security Updates</h4>
                    <p className="text-sm text-gray-600">Keep all system components updated and review security logs regularly.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}