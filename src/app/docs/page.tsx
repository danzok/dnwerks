"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Code,
  Package,
  Zap,
  Activity,
  Target,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

// Vercel-style Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "#0070F3" 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color?: string;
}) => {
  const safeValue = typeof value === 'number' && isNaN(value) ? 0 : value;
  
  return (
    <Card className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#999999] dark:text-[#666666] uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold font-mono text-black dark:text-white">
              {typeof safeValue === 'number' ? `${safeValue}%` : safeValue}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+{trend}%</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#1A1A1A]">
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Vercel-style Progress Bar Component
const VercelProgressBar = ({ 
  value, 
  max = 100, 
  color = "#0070F3",
  showLabel = true 
}: {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}) => {
  const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), max);
  const percentage = (safeValue / max) * 100;
  
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#666666] dark:text-[#888888]">Progress</span>
          <span className="text-xs font-mono text-black dark:text-white">{safeValue}%</span>
        </div>
      )}
      <div className="w-full bg-[#EAEAEA] dark:bg-[#333333] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

// Status Badge Component with Vercel colors
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          className: "bg-[#E6F7FF] dark:bg-[#0A1A2A] text-[#0070F3] dark:text-[#50E3C2] border-[#BAE7FF] dark:border-[#1A3A4A]",
          icon: CheckCircle,
          label: "Completed"
        };
      case 'critical':
        return {
          className: "bg-[#FFEEEE] dark:bg-[#2A0A0A] text-[#EE0000] dark:text-[#FF6B6B] border-[#FFCCCC] dark:border-[#4A0A0A]",
          icon: AlertCircle,
          label: "Critical"
        };
      case 'in-progress':
        return {
          className: "bg-[#FFF7E6] dark:bg-[#2A1A0A] text-[#F5A623] dark:text-[#FFB84D] border-[#FFE7BA] dark:border-[#4A2A0A]",
          icon: AlertCircle,
          label: "In Progress"
        };
      default:
        return {
          className: "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#666666] dark:text-[#888888] border-[#EAEAEA] dark:border-[#333333]",
          icon: Activity,
          label: status
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Get changelog data with real dates
const getChangelogData = () => {
  return [
    {
      id: "phase-3-critical",
      title: "Critical Issues Discovered",
      date: new Date("2025-01-10"),
      status: "critical",
      description: "Critical issues found during review requiring immediate attention",
      changes: [
        "API Route Property Names: Critical runtime errors",
        "Database Import Fix: Broken import in campaign-queue.ts",
        "Missing API Route: Create campaigns CRUD endpoint",
        "Property Naming Strategy: Decision required"
      ],
      impact: {
        criticalIssues: 4,
        priority: "high"
      }
    },
    {
      id: "phase-2",
      title: "Complete Cal.com Removal & Simplification",
      date: new Date("2024-12-28"),
      status: "completed",
      description: "Removed all Cal.com references and simplified to clean, minimal design",
      changes: [
        "Cal.com References: 100% removed from source code",
        "Landing Pages: Completely removed",
        "Design Complexity: Significantly reduced",
        "User Experience: Streamlined to essential functionality"
      ],
      impact: {
        calcomRemoval: 100,
        designSimplification: 75
      }
    },
    {
      id: "phase-3",
      title: "Database Standardization",
      date: new Date("2024-12-13"),
      status: "completed",
      description: "Removed Drizzle ORM and standardized on Supabase only",
      changes: [
        "Dependencies Removed: 5 packages",
        "Files Removed: 4 major files",
        "Architecture: Single database pattern",
        "Bundle Size: Significantly reduced"
      ],
      impact: {
        dependenciesRemoved: 5,
        filesRemoved: 4,
        performanceImprovement: 25
      }
    },
    {
      id: "phase-1",
      title: "Duplicate Component Cleanup",
      date: new Date("2024-09-28"),
      status: "completed",
      description: "Removed duplicate components and consolidated functionality across codebase",
      changes: [
        "Files Removed: 15+ duplicate components",
        "Components Unified: 4 → 2",
        "Code Reduction: ~40%",
        "Maintained: Full backward compatibility"
      ],
      impact: {
        filesRemoved: 15,
        codeReduction: 40,
        componentsUnified: 2
      }
    }
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function DocsPage() {
  const changelogData = getChangelogData();
  
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black">
      {/* Minimalist Header */}
      <header className="bg-white dark:bg-[#111111] border-b border-[#EAEAEA] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                DNwerks - SMS Campaign Management
              </h1>
              <p className="text-sm text-[#666666] dark:text-[#888888]">
                Development Timeline Progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button variant="outline" asChild className="border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg">
                <Link href="/" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Back to App
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Implementation Coverage"
            value={81}
            icon={Target}
            trend={12}
            color="#0070F3"
          />
          <MetricCard
            title="Code Reduction"
            value={40}
            icon={Code}
            trend={8}
            color="#10B981"
          />
          <MetricCard
            title="Dependencies Removed"
            value={5}
            icon={Package}
            color="#F59E0B"
          />
          <MetricCard
            title="Performance Improvement"
            value={25}
            icon={Zap}
            trend={15}
            color="#EF4444"
          />
        </div>

        {/* Development Timeline Progress */}
        <Card className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#0070F3]" />
              <CardTitle className="text-lg font-semibold tracking-tight text-black dark:text-white">
                Development Timeline Progress
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-[#666666] dark:text-[#888888]">
              Current status based on PRD v3.0 - January 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phase 1: MVP Core Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-black dark:text-white">Phase 1: MVP Core Features</h4>
                    <p className="text-xs text-[#666666] dark:text-[#888888]">COMPLETED - October 2024</p>
                  </div>
                </div>
                <StatusBadge status="completed" />
              </div>
              <VercelProgressBar value={100} color="#10B981" showLabel={false} />
              <div className="ml-9 grid gap-1 text-xs text-[#666666] dark:text-[#888888]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>User authentication with private admin approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Customer contact management with US phone validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>SMS campaign creation interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Twilio integration for SMS sending</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Analytics dashboard with real-time metrics</span>
                </div>
              </div>
            </div>

            {/* Phase 2: Codebase Standardization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-black dark:text-white">Phase 2: Codebase Standardization</h4>
                    <p className="text-xs text-[#666666] dark:text-[#888888]">COMPLETED - December 2024</p>
                  </div>
                </div>
                <StatusBadge status="completed" />
              </div>
              <VercelProgressBar value={100} color="#10B981" showLabel={false} />
              <div className="ml-9 grid gap-1 text-xs text-[#666666] dark:text-[#888888]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Component consolidation with theme support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Supabase-only database architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>TypeScript type definitions for all entities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Property transformation utilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-[#10B981]" />
                  <span>Dependency optimization (5 packages removed)</span>
                </div>
              </div>
            </div>

            {/* Phase 3: Critical Issue Resolution */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center animate-pulse">
                    <AlertCircle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-black dark:text-white">Phase 3: Critical Issue Resolution</h4>
                    <p className="text-xs text-[#666666] dark:text-[#888888]">IN PROGRESS - January 2025</p>
                  </div>
                </div>
                <StatusBadge status="in-progress" />
              </div>
              <VercelProgressBar value={35} color="#F59E0B" showLabel={false} />
              <div className="ml-9 space-y-2 text-xs text-[#666666] dark:text-[#888888]">
                <div className="space-y-1">
                  <p className="font-medium text-black dark:text-white">API Consistency Fixes:</p>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Update all API routes to use property transformers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Standardize error handling patterns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Implement proper TypeScript types in API responses</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-black dark:text-white">Campaign Queue Integration:</p>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Connect campaign queue to actual database operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Implement job persistence and recovery</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-black dark:text-white">Missing API Endpoints:</p>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Complete campaign CRUD operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                      <span>Implement campaign message tracking APIs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 4: Production Readiness */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#666666] dark:bg-[#888888] flex items-center justify-center">
                    <Target className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-black dark:text-white">Phase 4: Production Readiness</h4>
                    <p className="text-xs text-[#666666] dark:text-[#888888]">PLANNED - February 2025</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-[#EAEAEA] dark:border-[#333333] text-[#666666] dark:text-[#888888]">
                  Planned
                </Badge>
              </div>
              <VercelProgressBar value={0} color="#666666" showLabel={false} />
              <div className="ml-9 grid gap-1 text-xs text-[#666666] dark:text-[#888888]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                  <span>Performance optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                  <span>Security hardening</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                  <span>Testing & quality assurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#666666] dark:bg-[#888888]" />
                  <span>Monitoring & observability</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changelog Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {changelogData.map((item) => (
            <Card
              key={item.id}
              className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors rounded-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base font-medium text-black dark:text-white">
                        {item.title}
                      </CardTitle>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#666666] dark:text-[#888888]">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.date)}
                    </div>
                    <CardDescription className="text-xs text-[#666666] dark:text-[#888888] leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-black dark:text-white uppercase tracking-wide">Key Changes</h4>
                  <ul className="space-y-1">
                    {item.changes.map((change, index) => (
                      <li key={index} className="text-xs text-[#666666] dark:text-[#888888] flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-[#10B981] mt-0.5 flex-shrink-0" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>

                {item.impact && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-black dark:text-white uppercase tracking-wide">Impact Metrics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(item.impact).map(([key, value]) => {
                        const safeValue = typeof value === 'number' && isNaN(value) ? 0 : value;
                        return (
                          <div key={key} className="text-center p-2 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg">
                            <div className="text-sm font-bold font-mono text-[#0070F3]">
                              {typeof safeValue === 'number' ? `${safeValue}%` : String(safeValue)}
                            </div>
                            <div className="text-xs text-[#666666] dark:text-[#888888] capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Minimalist Footer */}
        <div className="pt-6 border-t border-[#EAEAEA] dark:border-[#333333]">
          <div className="flex items-center justify-center">
            <p className="text-xs text-[#666666] dark:text-[#888888]">
              Last updated: {formatDate(new Date())}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}