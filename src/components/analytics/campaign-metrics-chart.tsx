"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { CampaignDataPoint } from "@/hooks/use-analytics";

interface CampaignMetricsChartProps {
  data: CampaignDataPoint[];
}

export function CampaignMetricsChart({ data }: CampaignMetricsChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
            formatter={(value: number, name: string) => {
              if (name === "sent") return [`${value} messages`, "Messages Sent"];
              if (name === "delivered") return [`${value} messages`, "Messages Delivered"];
              if (name === "failed") return [`${value} messages`, "Messages Failed"];
              if (name === "engagement") return [`${value} responses`, "Customer Responses"];
              return [value, name];
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="sent"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            name="sent"
          />
          <Area
            type="monotone"
            dataKey="delivered"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
            name="delivered"
          />
          <Area
            type="monotone"
            dataKey="failed"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
            name="failed"
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 4 }}
            name="engagement"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}