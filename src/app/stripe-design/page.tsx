"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight,
  CreditCard,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Globe,
  BarChart3,
  MessageSquare,
  Settings
} from "lucide-react";

export default function StripeDesignPage() {
  return (
    <div className="min-h-screen page-background">
      {/* Hero Section */}
      <section className="stripe-section">
        <div className="stripe-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="stripe-heading-1 text-foreground mb-6">
              SMS Campaign Management
            </h1>
            <p className="stripe-body-large max-w-2xl mx-auto mb-8 stripe-text-balance">
              Send targeted SMS campaigns, track performance, and engage customers 
              with our enterprise-grade messaging platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="stripe-button stripe-button-primary h-12 px-8 text-base font-medium">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="stripe-button stripe-button-secondary h-12 px-8 text-base font-medium">
                View documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-16">
        <div className="stripe-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stripe-card p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="stripe-heading-3 text-foreground mb-2">2.4M+</div>
              <div className="stripe-body-small">Messages sent</div>
            </div>
            
            <div className="stripe-card p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="stripe-heading-3 text-foreground mb-2">50K+</div>
              <div className="stripe-body-small">Active customers</div>
            </div>
            
            <div className="stripe-card p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="stripe-heading-3 text-foreground mb-2">98.5%</div>
              <div className="stripe-body-small">Delivery rate</div>
            </div>
            
            <div className="stripe-card p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div className="stripe-heading-3 text-foreground mb-2">180+</div>
              <div className="stripe-body-small">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-16">
        <div className="stripe-container">
          <div className="text-center mb-12">
            <h2 className="stripe-heading-2 text-foreground mb-4">
              Built for modern businesses
            </h2>
            <p className="stripe-body-large max-w-2xl mx-auto">
              Get real-time insights into your SMS campaigns with our comprehensive dashboard.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Dashboard */}
            <div className="lg:col-span-2">
              <div className="stripe-card p-0 overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="stripe-heading-3 text-foreground mb-2">Campaign Overview</h3>
                  <p className="stripe-body-small">Monitor your SMS campaign performance in real-time</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="stripe-body-small">Delivered</span>
                      </div>
                      <div className="stripe-heading-3 text-foreground">1,847</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                        <span className="stripe-body-small">Pending</span>
                      </div>
                      <div className="stripe-heading-3 text-foreground">23</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="stripe-body-small">Welcome Series</span>
                        <span className="stripe-body-small">847 sent</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="stripe-body-small">Product Launch</span>
                        <span className="stripe-body-small">1,000 sent</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="stripe-card p-6">
                <h4 className="stripe-heading-3 text-foreground mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="stripe-body text-foreground">Campaign completed</p>
                      <p className="stripe-body-small">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="stripe-body text-foreground">Campaign scheduled</p>
                      <p className="stripe-body-small">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stripe-card p-6">
                <h4 className="stripe-heading-3 text-foreground mb-4">Account Usage</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="stripe-body-small">Messages this month</span>
                      <span className="stripe-body-small">8,429 / 10,000</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      Upgrade for unlimited messages
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-16">
        <div className="stripe-container">
          <div className="text-center mb-12">
            <h2 className="stripe-heading-2 text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="stripe-body-large max-w-2xl mx-auto">
              Powerful tools and insights to help you create, send, and optimize your SMS campaigns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="stripe-heading-3 text-foreground mb-4">Lightning Fast</h3>
              <p className="stripe-body-small">Send thousands of messages per second with our global infrastructure.</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="stripe-heading-3 text-foreground mb-4">Secure & Compliant</h3>
              <p className="stripe-body-small">Enterprise-grade security with GDPR and CCPA compliance built-in.</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="stripe-heading-3 text-foreground mb-4">Advanced Analytics</h3>
              <p className="stripe-body-small">Deep insights into delivery rates, engagement, and ROI tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="stripe-section bg-secondary/30">
        <div className="stripe-container">
          <div className="text-center">
            <h2 className="stripe-heading-2 text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="stripe-body-large max-w-xl mx-auto mb-8">
              Join thousands of businesses using our platform to connect with their customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="stripe-button stripe-button-primary h-12 px-8 text-base font-medium">
                Start your free trial
              </Button>
              <Button variant="outline" className="stripe-button stripe-button-secondary h-12 px-8 text-base font-medium">
                Talk to sales
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}