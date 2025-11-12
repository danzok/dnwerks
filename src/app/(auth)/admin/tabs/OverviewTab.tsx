"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus, 
  Shield, 
  Activity,
  TrendingUp,
  Settings,
  Mail,
  Phone,
  BarChart3
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

interface OverviewTabProps {
  users: UserProfile[];
  settings: SystemSettings | null;
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ users, settings, onTabChange }: OverviewTabProps) {
  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = totalUsers - adminUsers;
  const activeUsers = users.filter(u => u.last_login_at).length;
  const recentUsers = users.filter(u => {
    const createdAt = new Date(u.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome to your admin dashboard. Here's what's happening in your system.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onTabChange('users')}
              className="gap-2 h-9 px-3 text-sm"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
            <Button
              variant="outline"
              onClick={() => onTabChange('settings')}
              className="gap-2 h-9 px-3 text-sm"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <Card className="hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]">
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

          <Card className="hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold font-mono text-foreground">
                    {activeUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Users logged in recently
                  </p>
                </div>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    New Users
                  </p>
                  <p className="text-3xl font-bold font-mono text-foreground">
                    {recentUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined this week
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & System Status */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
                onClick={() => onTabChange('users')}
              >
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Create New User
                <Badge variant="secondary" className="ml-auto text-xs">Quick</Badge>
              </Button>
             
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
                onClick={() => onTabChange('users')}
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                Manage Users
                <Badge variant="outline" className="ml-auto text-xs">{totalUsers}</Badge>
              </Button>
             
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
                onClick={() => onTabChange('settings')}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                System Settings
                <Badge variant="secondary" className="ml-auto text-xs">Config</Badge>
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                System Status
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Current system configuration and health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Email Notifications</span>
                </div>
                <Badge variant={settings?.email_notifications ? "success" : "error"}>
                  {settings?.email_notifications ? "Enabled" : "Disabled"}
                </Badge>
              </div>
             
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">SMS Notifications</span>
                </div>
                <Badge variant={settings?.sms_notifications ? "success" : "error"}>
                  {settings?.sms_notifications ? "Enabled" : "Disabled"}
                </Badge>
              </div>
             
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">User Registration</span>
                </div>
                <Badge variant={settings?.allow_user_registration ? "success" : "error"}>
                  {settings?.allow_user_registration ? "Open" : "Closed"}
                </Badge>
              </div>
             
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Maintenance Mode</span>
                </div>
                <Badge variant={settings?.maintenance_mode ? "warning" : "success"}>
                  {settings?.maintenance_mode ? "Active" : "Normal"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              User Distribution
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Overview of user roles and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold font-mono text-foreground mb-1">{totalUsers}</div>
                <div className="text-sm font-medium text-foreground">Total Users</div>
                <div className="text-xs text-muted-foreground">All registered accounts</div>
              </div>
             
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mb-1">{adminUsers}</div>
                <div className="text-sm font-medium text-foreground">Admin Users</div>
                <div className="text-xs text-muted-foreground">{totalUsers > 0 ? `${Math.round((adminUsers / totalUsers) * 100)}% of total` : '0% of total'}</div>
              </div>
             
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold font-mono text-green-400 mb-1">{regularUsers}</div>
                <div className="text-sm font-medium text-foreground">Regular Users</div>
                <div className="text-xs text-muted-foreground">{totalUsers > 0 ? `${Math.round((regularUsers / totalUsers) * 100)}% of total` : '0% of total'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}