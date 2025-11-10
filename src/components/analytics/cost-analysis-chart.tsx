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
  ComposedChart,
  Bar,
  Area,
} from "recharts";
import { CostDataPoint } from "@/hooks/use-analytics";

interface CostAnalysisChartProps {
  data: CostDataPoint[];
}

export function CostAnalysisChart({ data }: CostAnalysisChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
            formatter={(value: number, name: string) => {
              if (name === "messages") return [`${value}`, "Messages Sent"];
              if (name === "cost") return [`$${value.toFixed(2)}`, "Total Cost"];
              if (name === "costPerMessage") return [`$${value.toFixed(4)}`, "Cost per Message"];
              if (name === "campaignCount") return [`${value}`, "Campaigns"];
              return [value, name];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="messages" fill="#3b82f6" opacity={0.7} name="messages" />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cost"
            fill="#10b981"
            stroke="#10b981"
            fillOpacity={0.3}
            name="cost"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="costPerMessage"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 4 }}
            name="costPerMessage"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}