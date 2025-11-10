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
import { EngagementDataPoint } from "@/hooks/use-analytics";

interface CustomerEngagementChartProps {
  data: EngagementDataPoint[];
}

export function CustomerEngagementChart({ data }: CustomerEngagementChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              if (name === "responses") return [`${value} responses`, "Customer Responses"];
              if (name === "clicks") return [`${value} clicks`, "Link Clicks"];
              if (name === "unsubscribes") return [`${value} unsubscribes`, "Unsubscribes"];
              if (name === "engagementRate") return [`${value.toFixed(1)}%`, "Engagement Rate"];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="responses"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            name="responses"
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            name="clicks"
          />
          <Line
            type="monotone"
            dataKey="unsubscribes"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            name="unsubscribes"
          />
          <Line
            type="monotone"
            dataKey="engagementRate"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#f59e0b", r: 4 }}
            name="engagementRate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}