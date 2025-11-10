"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Send, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock campaign data
const mockCampaigns = [
  {
    id: "1",
    name: "Spring Sale 2025",
    status: "completed" as const,
    recipients: 1234,
    sentCount: 1234,
    deliveredCount: 1228,
    failedCount: 6,
    scheduledAt: null,
    sentAt: "2024-03-15T10:30:00Z",
    createdAt: "2024-03-15T10:00:00Z",
    messageBody: "Hi {firstName}, get 25% off this weekend! Shop now: https://bit.ly/spring25 Reply STOP to opt out."
  },
  {
    id: "2",
    name: "Weekly Newsletter",
    status: "scheduled" as const,
    recipients: 856,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    scheduledAt: "2024-03-20T09:00:00Z",
    sentAt: null,
    createdAt: "2024-03-18T14:30:00Z",
    messageBody: "Hi {firstName}, check out this week's updates and special offers!"
  },
  {
    id: "3",
    name: "Flash Sale Alert",
    status: "sending" as const,
    recipients: 500,
    sentCount: 234,
    deliveredCount: 228,
    failedCount: 6,
    scheduledAt: null,
    sentAt: "2024-03-19T15:45:00Z",
    createdAt: "2024-03-19T15:30:00Z",
    messageBody: "⚡ FLASH SALE! 50% off everything for the next 24 hours only! Shop now: https://bit.ly/flash"
  },
  {
    id: "4",
    name: "New Product Launch",
    status: "draft" as const,
    recipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    scheduledAt: null,
    sentAt: null,
    createdAt: "2024-03-19T11:20:00Z",
    messageBody: "Hi {firstName}, we're excited to announce our new product line! Be the first to explore..."
  },
  {
    id: "5",
    name: "Customer Feedback Request",
    status: "failed" as const,
    recipients: 200,
    sentCount: 200,
    deliveredCount: 145,
    failedCount: 55,
    scheduledAt: null,
    sentAt: "2024-03-10T14:00:00Z",
    createdAt: "2024-03-10T13:45:00Z",
    messageBody: "Hi {firstName}, we'd love to hear your feedback! Take our quick survey: https://bit.ly/feedback"
  }
]

const statusConfig = {
  draft: {
    label: "Draft",
    icon: Edit,
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200"
  },
  sending: {
    label: "Sending",
    icon: Send,
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 hover:bg-green-200"
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "bg-red-100 text-red-800 hover:bg-red-200"
  }
}

export function CampaignsContent() {
  const [campaigns, setCampaigns] = React.useState(mockCampaigns)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filteredCampaigns = React.useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.messageBody.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, searchTerm, statusFilter])

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getSuccessRate = (delivered: number, sent: number) => {
    if (sent === 0) return "0%"
    return `${((delivered / sent) * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/campaigns/create">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Campaign Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((acc, c) => acc + c.sentCount, 0).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((acc, c) => acc + c.deliveredCount, 0).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((acc, c) => acc + c.failedCount, 0).toLocaleString('en-US')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>
            A list of your SMS campaigns and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-gray-500">No campaigns found</p>
                        <Link href="/campaigns/create">
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create your first campaign
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.messageBody}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.recipients.toLocaleString('en-US')}</div>
                          {campaign.sentCount > 0 && (
                            <div className="text-sm text-gray-500">
                              {campaign.sentCount} sent
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.sentCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: getSuccessRate(campaign.deliveredCount, campaign.sentCount) }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {getSuccessRate(campaign.deliveredCount, campaign.sentCount)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {campaign.sentAt ? (
                          new Date(campaign.sentAt).toLocaleDateString('en-US')
                        ) : campaign.scheduledAt ? (
                          <div className="text-sm">
                            <div>Scheduled</div>
                            <div className="text-gray-500">
                              {new Date(campaign.scheduledAt).toLocaleDateString('en-US')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not sent</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}