"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  MessageSquare,
  Sparkles,
  Code,
  Eye,
  CheckCircle,
  ArrowRight,
  Palette,
  Zap,
  Shield
} from "lucide-react";
import { CampaignTemplateUI } from "@/lib/ui-types";
import { ReusableTemplateModal } from "@/components/campaigns/reusable-template-modal";
import { ImprovedTemplateManager } from "@/components/campaigns/improved-template-manager";

export default function TemplateShowcasePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lastCreatedTemplate, setLastCreatedTemplate] = useState<string>("");
  
  // Sample template for editing demo
  const sampleTemplate: CampaignTemplateUI = {
    id: "sample-1",
    userId: "demo-user",
    name: "Welcome Message",
    description: "A warm welcome message for new customers",
    messageBody: "Hi {{firstName}}! 👋 Welcome to {{company}}! We're excited to have you aboard. Reply STOP to opt out.",
    category: "general",
    isDefault: false,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleCreateTemplate = async (template: Partial<CampaignTemplateUI>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Created template:", template);
    setLastCreatedTemplate(template.name || "Untitled Template");
    setShowCreateModal(false);
  };

  const handleUpdateTemplate = async (template: Partial<CampaignTemplateUI>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Updated template:", template);
    setShowEditModal(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Reusable Message Templates</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create beautiful, reusable SMS message templates with our improved modal design and enhanced user experience.
        </p>
        
        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Badge variant="secondary" className="gap-1">
            <Palette className="w-3 h-3" />
            Improved Styling
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Eye className="w-3 h-3" />
            Live Preview
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            Better UX
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Shield className="w-3 h-3" />
            Validation
          </Badge>
        </div>
      </div>

      {/* Success Alert */}
      {lastCreatedTemplate && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-400">
            Successfully created template: <strong>{lastCreatedTemplate}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Showcase Tabs */}
      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        {/* Interactive Demo */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Try the New Template Modal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Experience the improved modal design with better styling, real-time preview, and enhanced usability.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold">Create New Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Start from scratch with our improved creation modal featuring live preview and better validation.
                  </p>
                  <Button onClick={() => setShowCreateModal(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </Card>

                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold">Edit Sample Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Edit a pre-filled template to see how the modal handles existing data and updates.
                  </p>
                  <Button onClick={() => setShowEditModal(true)} variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Edit Sample
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Template Manager Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Full Template Management Experience</CardTitle>
              <p className="text-muted-foreground">
                See how the improved template manager integrates with the new modal design.
              </p>
            </CardHeader>
            <CardContent>
              <ImprovedTemplateManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Live Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Real-time preview with phone mockup showing exactly how messages will appear to recipients.
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Phone-style message bubbles</li>
                  <li>• Placeholder replacement preview</li>
                  <li>• Character count and SMS part estimation</li>
                  <li>• Real-time updates as you type</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  Improved Modal Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Clean, modern interface with better spacing, typography, and visual hierarchy.
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Larger, more readable modal size</li>
                  <li>• Better organized form sections</li>
                  <li>• Consistent spacing and typography</li>
                  <li>• Improved color coding for categories</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Enhanced User Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Streamlined workflow with helpful features and intelligent assistance.
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• One-click placeholder insertion</li>
                  <li>• Smart form validation with helpful errors</li>
                  <li>• Category selection with descriptions</li>
                  <li>• Tooltip guidance throughout</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Smart Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Comprehensive validation to ensure high-quality templates and prevent errors.
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Real-time character limit warnings</li>
                  <li>• Required field validation</li>
                  <li>• Minimum message length enforcement</li>
                  <li>• SMS part calculation and warnings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Guide */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                How to Use the Reusable Template Modal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Usage */}
              <div>
                <h3 className="font-semibold mb-3">1. Basic Usage</h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <pre>{`import { ReusableTemplateModal } from "@/components/campaigns/reusable-template-modal";

function YourComponent() {
  const [showModal, setShowModal] = useState(false);
  
  const handleSave = async (template) => {
    await createTemplate(template);
    setShowModal(false);
  };

  return (
    <ReusableTemplateModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSave={handleSave}
      title="Create Template"
      description="Create a new message template"
    />
  );
}`}</pre>
                </div>
              </div>

              {/* Editing Templates */}
              <div>
                <h3 className="font-semibold mb-3">2. Editing Existing Templates</h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <pre>{`// Pass existing template for editing
<ReusableTemplateModal
  isOpen={editMode}
  onClose={() => setEditMode(false)}
  onSave={handleUpdate}
  template={existingTemplate}  // Pre-fills the form
  title="Edit Template"
  description="Update your template"
/>`}</pre>
                </div>
              </div>

              {/* Integration with Template Manager */}
              <div>
                <h3 className="font-semibold mb-3">3. Template Manager Integration</h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <pre>{`import { ImprovedTemplateManager } from "@/components/campaigns/improved-template-manager";

// Standalone usage
<ImprovedTemplateManager />

// With template selection callback
<ImprovedTemplateManager 
  onTemplateSelect={(template) => {
    console.log("Selected:", template);
  }}
/>`}</pre>
                </div>
              </div>

              {/* Key Props */}
              <div>
                <h3 className="font-semibold mb-3">4. Available Props</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">ReusableTemplateModal</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li><code>isOpen</code> - Boolean to control visibility</li>
                      <li><code>onClose</code> - Callback when modal closes</li>
                      <li><code>onSave</code> - Callback when saving template</li>
                      <li><code>template</code> - Existing template for editing</li>
                      <li><code>title</code> - Modal title (optional)</li>
                      <li><code>description</code> - Modal description (optional)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">ImprovedTemplateManager</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li><code>onTemplateSelect</code> - Template selection callback</li>
                      <li><code>showCreateModal</code> - External modal control</li>
                      <li><code>onOpenCreateModal</code> - Create button callback</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>What's Improved?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700 dark:text-green-400">✓ Before vs After</h4>
                  <ul className="text-sm space-y-1">
                    <li>❌ Small, cramped modal → ✅ Spacious, well-organized layout</li>
                    <li>❌ No live preview → ✅ Real-time message preview with phone mockup</li>
                    <li>❌ Basic validation → ✅ Comprehensive smart validation</li>
                    <li>❌ Poor visual hierarchy → ✅ Clear sections and consistent styling</li>
                    <li>❌ Limited accessibility → ✅ Full keyboard navigation and screen reader support</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400">🚀 New Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Live character count with SMS part estimation</li>
                    <li>• One-click placeholder insertion with tooltips</li>
                    <li>• Category selection with visual icons and descriptions</li>
                    <li>• Phone-style message preview</li>
                    <li>• Improved error handling and user feedback</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ReusableTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTemplate}
        title="Create New Message Template"
        description="Create a reusable template for your SMS campaigns with live preview"
      />

      <ReusableTemplateModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateTemplate}
        template={sampleTemplate}
        title="Edit Message Template"
        description="Update your existing template with improved editing experience"
      />
    </div>
  );
}