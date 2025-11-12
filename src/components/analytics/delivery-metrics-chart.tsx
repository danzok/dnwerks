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
  BarChart,
  Bar,
} from "recharts";
import { DeliveryDataPoint } from "@/hooks/use-analytics";

interface DeliveryMetricsChartProps {
  data: DeliveryDataPoint[];
}

export function DeliveryMetricsChart({ data }: DeliveryMetricsChartProps) {
  // DEBUG: Log data being passed to chart
  console.log('[DeliveryMetricsChart] Received data:', data);
  console.log('[DeliveryMetricsChart] Data length:', data?.length);
  
  // DEBUG: Check for NaN values in data
  if (data) {
    data.forEach((point, index) => {
      Object.entries(point).forEach(([key, value]) => {
        if (typeof value === 'number' && isNaN(value)) {
          console.error(`[DeliveryMetricsChart] NaN value found at index ${index}, key ${key}:`, value);
        }
      });
    });
  }
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              if (name === "delivered") return [`${value} messages`, "Delivered"];
              if (name === "failed") return [`${value} messages`, "Failed"];
              if (name === "pending") return [`${value} messages`, "Pending"];
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="delivered" fill="#10b981" name="delivered" />
          <Bar dataKey="failed" fill="#ef4444" name="failed" />
          <Bar dataKey="pending" fill="#f59e0b" name="pending" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}