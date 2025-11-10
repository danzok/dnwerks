import { Suspense } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerList } from "@/components/customers/customer-list";
import { CustomerListSkeleton } from "@/components/customers/customer-list-skeleton";
import { Users, UserPlus, TrendingUp, Search, Filter, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Simple Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon">
                  <Link href="/contacts">
                    <ArrowLeft />
                  </Link>
                </Button>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                  <p className="text-gray-600 mt-2">Manage your customer relationships and support interactions</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">3,245</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Customers</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">2,890</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">127</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserPlus className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">4.8</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
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
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Add Customer</CardTitle>
                  <CardDescription>
                    Create a new customer account
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Search className="h-6 w-6 text-green-600" />
                    </div>
                    <Button size="sm" variant="outline">
                      Support
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Support Queue</CardTitle>
                  <CardDescription>
                    View customer support tickets
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <Button size="sm" variant="outline">
                      Reviews
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Customer Reviews</CardTitle>
                  <CardDescription>
                    Manage customer feedback
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Customer List Section */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Customer Directory
                </CardTitle>
                <CardDescription>
                  Manage and engage with your customer base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<CustomerListSkeleton />}>
                  <CustomerList />
                </Suspense>
              </CardContent>
            </Card>

            {/* Customer Support Overview */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Customer Support Overview</CardTitle>
                <CardDescription>
                  Recent customer support activity and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">24</div>
                    <div className="text-sm text-gray-600">Open Tickets</div>
                    <div className="text-xs text-orange-600 mt-1">5 requiring attention</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">2.3h</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                    <div className="text-xs text-green-600 mt-1">-15min from last week</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">94%</div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                    <div className="text-xs text-green-600 mt-1">+2% from last month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Management Tips */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Customer Management Tips</CardTitle>
                <CardDescription>
                  Best practices for maintaining excellent customer relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Proactive Communication</h4>
                    <p className="text-sm text-gray-600">Reach out to customers regularly to build relationships and anticipate needs.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Personalized Service</h4>
                    <p className="text-sm text-gray-600">Use customer data to provide personalized experiences and recommendations.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Feedback Collection</h4>
                    <p className="text-sm text-gray-600">Regularly collect and act on customer feedback to improve service.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Loyalty Programs</h4>
                    <p className="text-sm text-gray-600">Implement loyalty programs to reward and retain valuable customers.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Link */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Looking for the complete contact database?</p>
                  <Link href="/contacts">
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Go to Contact Database
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}