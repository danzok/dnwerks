"use client"

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Key,
  Phone,
  Mail,
  Globe,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Settings,
  Sliders,
  Zap
, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@dnwerks.com",
    phone: "+1 (555) 123-4567",
    company: "DNwerks",
    timezone: "America/New_York"
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    campaignUpdates: true,
    weeklyReports: true,
    securityAlerts: true
  });

  const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

  const settingsCategories = [
    {
      id: "general",
      name: "General",
      icon: Settings,
      description: "Basic account settings"
    },
    {
      id: "profile",
      name: "Profile",
      icon: User,
      description: "Personal information"
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
      description: "Alert preferences"
    },
    {
      id: "security",
      name: "Security",
      icon: Shield,
      description: "API keys and passwords"
    },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>Configure your organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={profileData.company}
              onChange={(e) => setProfileData({...profileData, company: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="America/New_York" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Pacific Time (PT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium text-foreground">
                  {key === 'emailAlerts' && 'Email Alerts'}
                  {key === 'smsAlerts' && 'SMS Alerts'}
                  {key === 'campaignUpdates' && 'Campaign Updates'}
                  {key === 'weeklyReports' && 'Weekly Reports'}
                  {key === 'securityAlerts' && 'Security Alerts'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {key === 'emailAlerts' && 'Receive email notifications for important updates'}
                  {key === 'smsAlerts' && 'Get SMS notifications for critical alerts'}
                  {key === 'campaignUpdates' && 'Updates on campaign status and performance'}
                  {key === 'weeklyReports' && 'Weekly summary of your SMS activity'}
                  {key === 'securityAlerts' && 'Security-related notifications'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() => setNotifications({...notifications, [key]: !value})}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Manage your API credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">API Key</h4>
                <p className="text-sm text-muted-foreground">Use this key to integrate with our SMS API</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 font-mono text-sm bg-muted p-2 rounded border">
                {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(apiKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Phone Numbers</CardTitle>
          <CardDescription>Manage your SMS sending numbers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">+1 (555) 123-4567</h4>
                <p className="text-sm text-muted-foreground">Primary number • Verified</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Phone Number
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and configuration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-3">
            <Card className="border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Choose a settings category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {settingsCategories.map((category) => {
                    const Icon = category.icon;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left ${
                          activeCategory === category.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        <div>
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-gray-500">
                            {category.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-9">
            {activeCategory === "general" && renderGeneralSettings()}
            {activeCategory === "profile" && renderProfileSettings()}
            {activeCategory === "notifications" && renderNotificationSettings()}
            {activeCategory === "security" && renderSecuritySettings()}
          </div>
        </div>
      </div>
    </div>
  );
}