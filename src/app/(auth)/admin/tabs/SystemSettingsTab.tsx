"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  Settings,
  Database,
  Mail,
  Shield,
  Bell,
  Globe,
  Smartphone,
  Palette,
  Save,
  RefreshCw
} from "lucide-react"

interface SystemSettingsTabProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function SystemSettingsTab({ 
  onShowSuccess, 
  onShowError 
}: SystemSettingsTabProps) {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'DNwerks Admin',
    siteDescription: 'Admin Dashboard',
    defaultLanguage: 'en',
    timezone: 'UTC',
    
    // Email Settings
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'noreply@example.com',
    smtpPassword: '',
    emailFromName: 'DNwerks',
    
    // Security Settings
    sessionTimeout: '24',
    passwordMinLength: '8',
    requireTwoFactor: false,
    allowUserRegistration: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    
    // Appearance Settings
    primaryColor: '#3b82f6',
    darkMode: false,
    compactMode: false,
    
    // API Settings
    apiRateLimit: '100',
    apiTimeout: '30',
    enableApiDocs: true,
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      onShowSuccess('Settings saved successfully!');
    } catch (error: any) {
      onShowError(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        siteName: 'DNwerks Admin',
        siteDescription: 'Admin Dashboard',
        defaultLanguage: 'en',
        timezone: 'UTC',
        smtpHost: 'smtp.example.com',
        smtpPort: '587',
        smtpUser: 'noreply@example.com',
        smtpPassword: '',
        emailFromName: 'DNwerks',
        sessionTimeout: '24',
        passwordMinLength: '8',
        requireTwoFactor: false,
        allowUserRegistration: true,
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        primaryColor: '#3b82f6',
        darkMode: false,
        compactMode: false,
        apiRateLimit: '100',
        apiTimeout: '30',
        enableApiDocs: true,
      });
      onShowSuccess('Settings reset to default values!');
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API', icon: Database },
  ];

  const renderGeneralSettings = () => (
    <FieldSet>
      <FieldLegend>General Settings</FieldLegend>
      <FieldDescription>Configure basic site information and regional preferences.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="siteName">Site Name</FieldLabel>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>The name of your site displayed in the header and title.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="siteDescription">Site Description</FieldLabel>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Brief description of your site for SEO and meta tags.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="defaultLanguage">Default Language</FieldLabel>
            <select
              id="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
              className="w-full p-2 border-input rounded-md bg-background text-foreground h-9 text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
            <FieldDescription>Default language for new users and system messages.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full p-2 border-input rounded-md bg-background text-foreground h-9 text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
            <FieldDescription>Default timezone for scheduling and timestamps.</FieldDescription>
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );

  const renderEmailSettings = () => (
    <FieldSet>
      <FieldLegend>Email Configuration</FieldLegend>
      <FieldDescription>Configure SMTP settings for sending emails from the system.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="smtpHost">SMTP Host</FieldLabel>
            <Input
              id="smtpHost"
              value={settings.smtpHost}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>The SMTP server hostname (e.g., smtp.gmail.com).</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="smtpPort">SMTP Port</FieldLabel>
            <Input
              id="smtpPort"
              value={settings.smtpPort}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Port number for SMTP connection (usually 587 for TLS).</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="smtpUser">SMTP Username</FieldLabel>
            <Input
              id="smtpUser"
              value={settings.smtpUser}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Username for SMTP authentication.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="smtpPassword">SMTP Password</FieldLabel>
            <Input
              id="smtpPassword"
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Password for SMTP authentication.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="emailFromName">From Name</FieldLabel>
            <Input
              id="emailFromName"
              value={settings.emailFromName}
              onChange={(e) => setSettings(prev => ({ ...prev, emailFromName: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Name displayed as sender in outgoing emails.</FieldDescription>
          </Field>
        </div>
        <FieldSeparator />
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-9 px-3 text-sm">
            <Mail className="h-3.5 w-3.5 mr-1" />
            Test Email
          </Button>
        </div>
      </FieldGroup>
    </FieldSet>
  );

  const renderSecuritySettings = () => (
    <FieldSet>
      <FieldLegend>Security Settings</FieldLegend>
      <FieldDescription>Configure authentication and security policies for the system.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="sessionTimeout">Session Timeout (hours)</FieldLabel>
            <Input
              id="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>How long users remain logged in before requiring re-authentication.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="passwordMinLength">Minimum Password Length</FieldLabel>
            <Input
              id="passwordMinLength"
              value={settings.passwordMinLength}
              onChange={(e) => setSettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Minimum number of characters required for user passwords.</FieldDescription>
          </Field>
        </div>
        <FieldSeparator />
        <FieldGroup>
          <Field orientation="horizontal">
            <Switch
              id="requireTwoFactor"
              checked={settings.requireTwoFactor}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireTwoFactor: checked }))}
            />
            <FieldContent>
              <FieldLabel htmlFor="requireTwoFactor">Require Two-Factor Authentication</FieldLabel>
              <FieldDescription>Force all users to enable 2FA for enhanced security.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="allowUserRegistration"
              checked={settings.allowUserRegistration}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowUserRegistration: checked }))}
            />
            <FieldContent>
              <FieldLabel htmlFor="allowUserRegistration">Allow User Registration</FieldLabel>
              <FieldDescription>Enable public user registration from the login page.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </FieldSet>
  );

  const renderNotificationSettings = () => (
    <FieldSet>
      <FieldLegend>Notification Preferences</FieldLegend>
      <FieldDescription>Configure how and when system notifications are sent to users.</FieldDescription>
      <FieldGroup>
        <Field orientation="horizontal">
          <Switch
            id="emailNotifications"
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
          />
          <FieldContent>
            <FieldLabel htmlFor="emailNotifications">Email Notifications</FieldLabel>
            <FieldDescription>Send notifications via email to users.</FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <Switch
            id="pushNotifications"
            checked={settings.pushNotifications}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
          />
          <FieldContent>
            <FieldLabel htmlFor="pushNotifications">Push Notifications</FieldLabel>
            <FieldDescription>Send browser push notifications for real-time updates.</FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <Switch
            id="smsNotifications"
            checked={settings.smsNotifications}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
          />
          <FieldContent>
            <FieldLabel htmlFor="smsNotifications">SMS Notifications</FieldLabel>
            <FieldDescription>Send notifications via SMS for critical alerts.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  );

  const renderAppearanceSettings = () => (
    <FieldSet>
      <FieldLegend>Appearance Settings</FieldLegend>
      <FieldDescription>Customize the visual appearance and layout of the interface.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="primaryColor">Primary Color</FieldLabel>
            <div className="flex items-center space-x-2">
              <Input
                id="primaryColor"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-16 h-9"
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 h-9 text-sm"
              />
            </div>
            <FieldDescription>Primary theme color used throughout the interface.</FieldDescription>
          </Field>
        </div>
        <FieldSeparator />
        <FieldGroup>
          <Field orientation="horizontal">
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
            />
            <FieldContent>
              <FieldLabel htmlFor="darkMode">Dark Mode</FieldLabel>
              <FieldDescription>Enable dark theme by default for all users.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, compactMode: checked }))}
            />
            <FieldContent>
              <FieldLabel htmlFor="compactMode">Compact Mode</FieldLabel>
              <FieldDescription>Use compact layout with reduced spacing.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </FieldSet>
  );

  const renderApiSettings = () => (
    <FieldSet>
      <FieldLegend>API Configuration</FieldLegend>
      <FieldDescription>Configure API settings, rate limits, and documentation access.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="apiRateLimit">API Rate Limit (requests/minute)</FieldLabel>
            <Input
              id="apiRateLimit"
              value={settings.apiRateLimit}
              onChange={(e) => setSettings(prev => ({ ...prev, apiRateLimit: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Maximum number of API requests allowed per minute per user.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="apiTimeout">API Timeout (seconds)</FieldLabel>
            <Input
              id="apiTimeout"
              value={settings.apiTimeout}
              onChange={(e) => setSettings(prev => ({ ...prev, apiTimeout: e.target.value }))}
              className="h-9 text-sm"
            />
            <FieldDescription>Maximum time to wait for API responses before timing out.</FieldDescription>
          </Field>
        </div>
        <FieldSeparator />
        <FieldGroup>
          <Field orientation="horizontal">
            <Switch
              id="enableApiDocs"
              checked={settings.enableApiDocs}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableApiDocs: checked }))}
            />
            <FieldContent>
              <FieldLabel htmlFor="enableApiDocs">Enable API Documentation</FieldLabel>
              <FieldDescription>Make API documentation publicly accessible.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </FieldSet>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'api':
        return renderApiSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              System Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure system-wide settings and preferences.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="flex items-center gap-2 h-9 px-3 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="flex items-center gap-2 h-9 px-3 text-sm"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2 h-9 px-3 text-sm"
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* Settings Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {sections.find(s => s.id === activeSection)?.label} Settings
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Configure {sections.find(s => s.id === activeSection)?.label.toLowerCase()} preferences and options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderSectionContent()}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              System Information
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Current system status and information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Version</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
                  <Badge variant="success" className="text-xs">Stable</Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Environment</div>
                <Badge variant="outline" className="text-xs">Development</Badge>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Database</div>
                <Badge variant="success" className="text-xs">Connected</Badge>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Last Backup</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Storage Used</div>
                <div className="text-xs text-muted-foreground">2.4 GB / 10 GB</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Uptime</div>
                <div className="text-xs text-muted-foreground">99.9%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}