"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  recentlyAdded: number;
}

interface ContactsStatsProps {
  stats: ContactStats;
  loading?: boolean;
}

export function ContactsStats({ stats, loading = false }: ContactsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="max-w-xs">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Contacts",
      value: stats.active,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Inactive Contacts",
      value: stats.inactive,
      icon: UserX,
      color: "text-gray-600",
      bgColor: "bg-gray-100"
    },
    {
      title: "Added Today",
      value: stats.recentlyAdded,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow max-w-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-1.5 rounded-full ${stat.bgColor} ml-2 flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}