"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Send, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useCampaigns } from "@/hooks/use-campaigns"
import { CampaignUI } from "@/lib/ui-types"

const statusConfig = {
  draft: {
    label: "Draft",
    icon: Edit,
    color: "bg-gray-100 text-gray-800"
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    color: "bg-blue-100 text-blue-800"
  },
  sending: {
    label: "Sending",
    icon: Send,
    color: "bg-yellow-100 text-yellow-800"
  },
  sent: {
    label: "Sent",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800"
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "bg-red-100 text-red-800"
  }
}

export function CampaignList() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const { campaigns, isLoading, deleteCampaign } = useCampaigns(searchTerm, statusFilter)

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id)
    } catch (error) {
      console.error("Failed to delete campaign:", error)
    }
  }

  return (
    <div className="space-y-6">

      {/* Search and Filter */}
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
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">All Status</SelectItem>
              <SelectItem value="draft" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Draft</SelectItem>
              <SelectItem value="scheduled" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Scheduled</SelectItem>
              <SelectItem value="sending" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Sending</SelectItem>
              <SelectItem value="sent" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Sent</SelectItem>
              <SelectItem value="failed" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Failed</SelectItem>
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

      {/* Campaign Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Send className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
                <p className="text-gray-600 mt-1">Get started by creating your first campaign</p>
              </div>
              <Link href="/campaigns/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>
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
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Campaign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Message Preview */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {campaign.messageBody}
                    </p>
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Recipients</p>
                      <p className="font-semibold text-gray-900">{campaign.totalRecipients.toLocaleString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sent</p>
                      <p className="font-semibold text-gray-900">{campaign.sentCount.toLocaleString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delivered</p>
                      <p className="font-semibold text-gray-900">{campaign.deliveredCount.toLocaleString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Success Rate</p>
                      <p className="font-semibold text-gray-900">
                        {campaign.sentCount > 0 ? getSuccessRate(campaign.deliveredCount, campaign.sentCount) : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <div>
                      {campaign.sentAt ? (
                        <span>Sent: {formatDate(campaign.sentAt)}</span>
                      ) : campaign.scheduledAt ? (
                        <span>Scheduled: {formatDate(campaign.scheduledAt)}</span>
                      ) : (
                        <span>Created: {formatDate(campaign.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}