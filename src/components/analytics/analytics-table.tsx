"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface AnalyticsTableProps {
  data: any[];
  type: "campaigns" | "delivery" | "engagement" | "costs";
  timeRange: string;
}

export function AnalyticsTable({ data, type, timeRange }: AnalyticsTableProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getDateValue = (dateStr: string) => {
    return new Date(dateStr).getTime();
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = getDateValue(a.date);
    const bValue = getDateValue(b.date);
    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getChangeClass = (current: number, previous: number) => {
    if (current > previous) return "text-green-600";
    if (current < previous) return "text-red-600";
    return "text-gray-600";
  };

  if (type === "campaigns") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Campaign Performance</h3>
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            Sort by Date {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 10).map((row, index) => (
              <TableRow key={row.date}>
                <TableCell className="font-medium">
                  {format(new Date(row.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{row.sent.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600">
                    {row.delivered.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-red-600">
                    {row.failed.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-blue-600">
                    {row.engagement.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell>${row.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (type === "delivery") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Delivery Statistics</h3>
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            Sort by Date {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Delivery Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 10).map((row, index) => {
              const prevRow = sortedData[index + 1];
              return (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">
                    {format(new Date(row.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {row.delivered.toLocaleString()}
                      {prevRow && getTrendIcon(row.delivered, prevRow.delivered)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {row.failed.toLocaleString()}
                      {prevRow && getTrendIcon(row.failed, prevRow.failed)}
                    </div>
                  </TableCell>
                  <TableCell>{row.pending.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {row.deliveryRate.toFixed(1)}%
                      {prevRow && (
                        <span className={getChangeClass(row.deliveryRate, prevRow.deliveryRate)}>
                          {row.deliveryRate > prevRow.deliveryRate ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (type === "engagement") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Customer Engagement</h3>
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            Sort by Date {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Unsubscribes</TableHead>
              <TableHead>Engagement Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 10).map((row, index) => (
              <TableRow key={row.date}>
                <TableCell className="font-medium">
                  {format(new Date(row.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-blue-600">
                    {row.responses.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell>{row.clicks.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-red-600">
                    {row.unsubscribes}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.engagementRate.toFixed(1)}%
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(row.engagementRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (type === "costs") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Cost Breakdown</h3>
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            Sort by Date {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Cost/Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 10).map((row, index) => (
              <TableRow key={row.date}>
                <TableCell className="font-medium">
                  {format(new Date(row.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{row.messages.toLocaleString()}</TableCell>
                <TableCell>{row.campaignCount}</TableCell>
                <TableCell>${row.cost.toFixed(2)}</TableCell>
                <TableCell>${row.costPerMessage.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return null;
}