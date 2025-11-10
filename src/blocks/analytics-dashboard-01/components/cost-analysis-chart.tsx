"use client";

import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface CostAnalysisChartProps {
  data: ChartDataPoint[];
}

export function CostAnalysisChart({ data }: CostAnalysisChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No cost data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="label" 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(value) => [`$${value}`, "Daily Cost"]}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            fill="hsl(var(--chart-4))"
            fillOpacity={0.3}
            stroke="hsl(var(--chart-4))"
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(var(--chart-4))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-4))", r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}