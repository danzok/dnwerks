"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, Users, Calendar, TrendingUp, Plus, Archive, Settings } from "lucide-react";

type IconName = 'MessageSquare' | 'Send' | 'Users' | 'Calendar' | 'TrendingUp' | 'Plus' | 'Archive' | 'Settings';

interface StatItem {
  title: string;
  value: string | number;
  icon: IconName;
  color: string;
  bgColor: string;
}

interface CompactStatsProps {
  stats: StatItem[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

const iconMap = {
  MessageSquare,
  Send, 
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Archive,
  Settings
};

export function CompactStats({ stats, loading = false, columns = 4 }: CompactStatsProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {[...Array(stats.length)].map((_, i) => (
          <Card key={i} className="w-full sm:max-w-xs">
            <CardContent className="p-3 sm:p-4">
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

  return (
    <div className={`grid ${gridCols[columns]} gap-3`}>
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon];
        return (
          <Card key={stat.title + index} className="hover:shadow-md transition-shadow w-full sm:max-w-xs">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`p-1 sm:p-1.5 rounded-full ${stat.bgColor} ml-2 flex-shrink-0`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}