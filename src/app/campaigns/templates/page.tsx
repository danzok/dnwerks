"use client";

import { Suspense, useState } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TemplateManager } from "@/components/campaigns/template-manager";
import { ArrowLeft, Plus, FileText, Star, Users, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateCreateForm } from "@/components/campaigns/template-create-form";

export default function CampaignTemplatesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Simple Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Button asChild variant="ghost" size="icon">
                  <Link href="/campaigns">
                    <ArrowLeft />
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Templates</h1>
              <p className="text-muted-foreground mt-2">Create, manage, and use reusable templates to streamline your SMS campaign creation process</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">New Template</CardTitle>
                  <CardDescription>
                    Create a new reusable SMS template
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Button size="sm" variant="outline">
                      Browse
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Popular Templates</CardTitle>
                  <CardDescription>
                    View and use popular template designs
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Template Library</CardTitle>
                  <CardDescription>
                    Manage your existing templates
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Template Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                      <p className="text-2xl font-bold text-foreground mt-1">42</p>
                      <p className="text-xs text-muted-foreground mt-1">+6 this month</p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Popular Templates</p>
                      <p className="text-2xl font-bold text-foreground mt-1">8</p>
                      <p className="text-xs text-muted-foreground mt-1">Most used</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Templates Used</p>
                      <p className="text-2xl font-bold text-foreground mt-1">156</p>
                      <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                      <p className="text-2xl font-bold text-foreground mt-1">92%</p>
                      <p className="text-xs text-muted-foreground mt-1">Success rate</p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Manager Section */}
            <Card className="border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Template Library
                </CardTitle>
                <CardDescription>
                  Browse, create, and manage your SMS campaign templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={null}>
                  <TemplateManager onOpenCreateModal={() => setShowCreateModal(true)} />
                </Suspense>
              </CardContent>
            </Card>

            {/* Create Template Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader className="space-y-3 pb-6 border-b">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Plus className="h-6 w-6" />
                    Create New Template
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Create a reusable message template for your SMS campaigns
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <TemplateCreateForm
                    onSuccess={() => setShowCreateModal(false)}
                    onCancel={() => setShowCreateModal(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
