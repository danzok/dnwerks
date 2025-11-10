"use client"

import { TrendingUp, Users } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  status: "active" | "inactive";
  createdAt: Date;
}

interface ContactsByStateChartProps {
  contacts: Contact[];
  loading?: boolean;
}

// US State names mapping
const stateNames: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

const chartConfig = {
  contacts: {
    label: "Contacts",
  },
  state1: {
    label: "State 1",
    color: "hsl(var(--chart-1))",
  },
  state2: {
    label: "State 2", 
    color: "hsl(var(--chart-2))",
  },
  state3: {
    label: "State 3",
    color: "hsl(var(--chart-3))",
  },
  state4: {
    label: "State 4",
    color: "hsl(var(--chart-4))",
  },
  state5: {
    label: "State 5",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ContactsByStateChart({ contacts, loading = false }: ContactsByStateChartProps) {
  const { chartData, topStates, totalContacts, growthPercentage } = useMemo(() => {
    if (!contacts || contacts.length === 0) {
      return {
        chartData: [],
        topStates: [],
        totalContacts: 0,
        growthPercentage: 0
      };
    }

    // Count contacts by state
    const stateCount = contacts.reduce((acc, contact) => {
      const state = contact.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort states by contact count and get top 10
    const sortedStates = Object.entries(stateCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Create chart data with colors
    const chartData = sortedStates.map(([state, count], index) => ({
      state: state,
      stateName: stateNames[state] || state,
      contacts: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

    // Calculate growth percentage based on recent contacts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentContacts = contacts.filter(contact => 
      contact.createdAt > thirtyDaysAgo
    ).length;
    
    const growthPercentage = contacts.length > 0 
      ? Math.round((recentContacts / contacts.length) * 100)
      : 0;

    return {
      chartData,
      topStates: sortedStates.map(([state]) => state),
      totalContacts: contacts.length,
      growthPercentage
    };
  }, [contacts]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts by State</CardTitle>
          <CardDescription>Distribution of contacts across states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[160px]">
            <div className="text-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
              <p className="text-xs text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts by State</CardTitle>
          <CardDescription>Distribution of contacts across states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[160px]">
            <div className="text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">No contacts available</p>
              <p className="text-xs text-muted-foreground opacity-75">Add contacts to see distribution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Contacts by State</CardTitle>
        <CardDescription className="text-xs">Top {Math.min(chartData.length, 6)} states</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ChartContainer config={chartConfig} className="h-[180px]">
          <BarChart
            accessibilityLayer
            data={chartData.slice(0, 6)}
            layout="vertical"
            margin={{
              left: 60,
              right: 15,
              top: 10,
              bottom: 10,
            }}
          >
            <YAxis
              dataKey="stateName"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={55}
              fontSize={11}
              tickFormatter={(value) => {
                // Truncate long state names
                return value.length > 8 ? value.substring(0, 8) + '...' : value;
              }}
            />
            <XAxis 
              dataKey="contacts" 
              type="number" 
              hide 
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded-md shadow-lg">
                      <p className="font-medium text-sm">{data.stateName} ({data.state})</p>
                      <p className="text-xs text-muted-foreground">
                        {data.contacts} contact{data.contacts !== 1 ? 's' : ''}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="contacts" 
              layout="vertical" 
              radius={[0, 3, 3, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-0.5 pt-1 text-xs">
        <div className="flex gap-1 leading-none font-medium items-center">
          {growthPercentage > 0 ? (
            <>
              <span>{growthPercentage}% added (30d)</span>
              <TrendingUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <span>{totalContacts} total</span>
              <Users className="h-3 w-3" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none text-xs opacity-75">
          Top {Math.min(chartData.length, 6)} states
        </div>
      </CardFooter>
    </Card>
  )
}