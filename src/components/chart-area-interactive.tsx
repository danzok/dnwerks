"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// SMS Campaign Data
const chartData = [
  { date: "2024-01-01", sent: 2450, delivered: 2401, failed: 49 },
  { date: "2024-01-02", sent: 1820, delivered: 1785, failed: 35 },
  { date: "2024-01-03", sent: 3200, delivered: 3125, failed: 75 },
  { date: "2024-01-04", sent: 2100, delivered: 2065, failed: 35 },
  { date: "2024-01-05", sent: 1890, delivered: 1850, failed: 40 },
  { date: "2024-01-06", sent: 2650, delivered: 2595, failed: 55 },
  { date: "2024-01-07", sent: 3100, delivered: 3045, failed: 55 },
  { date: "2024-01-08", sent: 2250, delivered: 2205, failed: 45 },
  { date: "2024-01-09", sent: 1680, delivered: 1650, failed: 30 },
  { date: "2024-01-10", sent: 2750, delivered: 2700, failed: 50 },
  { date: "2024-01-11", sent: 3420, delivered: 3350, failed: 70 },
  { date: "2024-01-12", sent: 1980, delivered: 1940, failed: 40 },
  { date: "2024-01-13", sent: 4100, delivered: 4020, failed: 80 },
  { date: "2024-01-14", sent: 2240, delivered: 2200, failed: 40 },
  { date: "2024-01-15", sent: 1560, delivered: 1535, failed: 25 },
  { date: "2024-01-16", sent: 1890, delivered: 1855, failed: 35 },
  { date: "2024-01-17", sent: 3650, delivered: 3580, failed: 70 },
  { date: "2024-01-18", sent: 2980, delivered: 2920, failed: 60 },
  { date: "2024-01-19", sent: 2470, delivered: 2420, failed: 50 },
  { date: "2024-01-20", sent: 1320, delivered: 1300, failed: 20 },
  { date: "2024-01-21", sent: 1650, delivered: 1620, failed: 30 },
  { date: "2024-01-22", sent: 2380, delivered: 2330, failed: 50 },
  { date: "2024-01-23", sent: 2450, delivered: 2401, failed: 49 },
  { date: "2024-01-24", sent: 1820, delivered: 1785, failed: 35 },
  { date: "2024-01-25", sent: 3200, delivered: 3125, failed: 75 },
  { date: "2024-01-26", sent: 2100, delivered: 2065, failed: 35 },
  { date: "2024-01-27", sent: 1890, delivered: 1850, failed: 40 },
  { date: "2024-01-28", sent: 2650, delivered: 2595, failed: 55 },
  { date: "2024-01-29", sent: 3100, delivered: 3045, failed: 55 },
  { date: "2024-01-30", sent: 2250, delivered: 2205, failed: 45 },
  { date: "2024-02-01", sent: 1890, delivered: 1850, failed: 40 },
  { date: "2024-02-02", sent: 2850, delivered: 2800, failed: 50 },
  { date: "2024-02-03", sent: 2470, delivered: 2420, failed: 50 },
  { date: "2024-02-04", sent: 3850, delivered: 3780, failed: 70 },
  { date: "2024-02-05", sent: 4800, delivered: 4720, failed: 80 },
  { date: "2024-02-06", sent: 4950, delivered: 4850, failed: 100 },
  { date: "2024-02-07", sent: 3850, delivered: 3780, failed: 70 },
  { date: "2024-02-08", sent: 1580, delivered: 1550, failed: 30 },
  { date: "2024-02-09", sent: 2250, delivered: 2200, failed: 50 },
  { date: "2024-02-10", sent: 2920, delivered: 2860, failed: 60 },
  { date: "2024-02-11", sent: 3340, delivered: 3270, failed: 70 },
  { date: "2024-02-12", sent: 1980, delivered: 1940, failed: 40 },
  { date: "2024-02-13", sent: 1980, delivered: 1950, failed: 30 },
  { date: "2024-02-14", sent: 4450, delivered: 4360, failed: 90 },
  { date: "2024-02-15", sent: 4720, delivered: 4630, failed: 90 },
  { date: "2024-02-16", sent: 3350, delivered: 3290, failed: 60 },
  { date: "2024-02-17", sent: 4950, delivered: 4850, failed: 100 },
  { date: "2024-02-18", sent: 3150, delivered: 3090, failed: 60 },
  { date: "2024-02-19", sent: 2350, delivered: 2310, failed: 40 },
  { date: "2024-02-20", sent: 1750, delivered: 1720, failed: 30 },
  { date: "2024-02-21", sent: 820, delivered: 800, failed: 20 },
  { date: "2024-02-22", sent: 810, delivered: 795, failed: 15 },
  { date: "2024-02-23", sent: 2480, delivered: 2430, failed: 45 },
  { date: "2024-02-24", sent: 2900, delivered: 2840, failed: 60 },
  { date: "2024-02-25", sent: 2000, delivered: 1960, failed: 40 },
  { date: "2024-02-26", sent: 2100, delivered: 2060, failed: 40 },
  { date: "2024-02-27", sent: 4200, delivered: 4120, failed: 80 },
  { date: "2024-02-28", sent: 2300, delivered: 2260, failed: 40 },
  { date: "2024-02-29", sent: 780, delivered: 765, failed: 15 },
  { date: "2024-03-01", sent: 3350, delivered: 3280, failed: 70 },
  { date: "2024-03-02", sent: 1780, delivered: 1750, failed: 30 },
  { date: "2024-03-03", sent: 4250, delivered: 4170, failed: 80 },
  { date: "2024-03-04", sent: 870, delivered: 850, failed: 20 },
  { date: "2024-03-05", sent: 2900, delivered: 2840, failed: 60 },
  { date: "2024-03-06", sent: 3200, delivered: 3140, failed: 60 },
  { date: "2024-03-07", sent: 3850, delivered: 3780, failed: 70 },
  { date: "2024-03-08", sent: 4350, delivered: 4270, failed: 80 },
  { date: "2024-03-09", sent: 4350, delivered: 4270, failed: 80 },
  { date: "2024-03-10", sent: 1550, delivered: 1520, failed: 30 },
  { date: "2024-03-11", sent: 920, delivered: 900, failed: 20 },
  { date: "2024-03-12", sent: 4900, delivered: 4800, failed: 100 },
  { date: "2024-03-13", sent: 2450, delivered: 2401, failed: 49 },
  { date: "2024-03-14", sent: 1820, delivered: 1785, failed: 35 },
  { date: "2024-03-15", sent: 3200, delivered: 3125, failed: 75 },
  { date: "2024-03-16", sent: 2100, delivered: 2065, failed: 35 },
  { date: "2024-03-17", sent: 1890, delivered: 1850, failed: 40 },
  { date: "2024-03-18", sent: 2650, delivered: 2595, failed: 55 },
  { date: "2024-03-19", sent: 3100, delivered: 3045, failed: 55 },
  { date: "2024-03-20", sent: 2250, delivered: 2205, failed: 45 },
  { date: "2024-03-21", sent: 1680, delivered: 1650, failed: 30 },
  { date: "2024-03-22", sent: 2750, delivered: 2700, failed: 50 },
  { date: "2024-03-23", sent: 3420, delivered: 3350, failed: 70 },
  { date: "2024-03-24", sent: 1980, delivered: 1940, failed: 40 },
  { date: "2024-03-25", sent: 4100, delivered: 4020, failed: 80 },
  { date: "2024-03-26", sent: 2240, delivered: 2200, failed: 40 },
  { date: "2024-03-27", sent: 1560, delivered: 1535, failed: 25 },
  { date: "2024-03-28", sent: 1890, delivered: 1855, failed: 35 },
  { date: "2024-03-29", sent: 3650, delivered: 3580, failed: 70 },
  { date: "2024-03-30", sent: 2980, delivered: 2920, failed: 60 },
]

const chartConfig = {
  sent: {
    label: "Sent",
    color: "hsl(var(--chart-2))",
  },
  delivered: {
    label: "Delivered",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("sent")

  const total = React.useMemo(
    () => ({
      sent: chartData.reduce((acc, curr) => acc + (curr.sent || 0), 0),
      delivered: chartData.reduce((acc, curr) => acc + (curr.delivered || 0), 0),
      failed: chartData.reduce((acc, curr) => acc + (curr.failed || 0), 0),
    }),
    []
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>SMS Campaign Performance</CardTitle>
          <CardDescription>
            Showing total messages for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["sent", "delivered", "failed"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString('en-US')}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="messages"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
