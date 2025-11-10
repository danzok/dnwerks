import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, MessageSquare, DollarSign, Activity } from "lucide-react";

interface MetricCardData {
  title: string;
  value: string | number;
  description: string;
  trend: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  status: {
    message: string;
    context: string;
  };
}

interface MetricCardsProps {
  metrics: MetricCardData[];
  className?: string;
}

export function MetricCards({ metrics, className = "" }: MetricCardsProps) {
  return (
    <div className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs *:data-[slot=card]:h-[200px] sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {metrics.map((metric, index) => (
        <Card key={index} className="@container/card flex flex-col" data-slot="card">
          <CardHeader className="flex-1">
            <CardDescription>{metric.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {metric.trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {metric.trend.isPositive ? '+' : ''}{metric.trend.value}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {metric.status.message}{" "}
              {metric.trend.isPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              {metric.status.context}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Example usage component
export function ExampleMetricCards() {
  const sampleMetrics: MetricCardData[] = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "Monthly revenue",
      trend: {
        value: 12.5,
        isPositive: true,
        label: "vs last month"
      },
      status: {
        message: "Strong performance",
        context: "Exceeding targets by 15%"
      }
    },
    {
      title: "Active Users",
      value: 2350,
      description: "Current active users",
      trend: {
        value: -5.2,
        isPositive: false,
        label: "vs last week"
      },
      status: {
        message: "Needs attention",
        context: "User retention declining"
      }
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      description: "Lead to customer",
      trend: {
        value: 8.1,
        isPositive: true,
        label: "improvement"
      },
      status: {
        message: "Excellent progress",
        context: "Above industry average"
      }
    },
    {
      title: "Customer Satisfaction",
      value: "4.8/5",
      description: "Average rating",
      trend: {
        value: 2.3,
        isPositive: true,
        label: "vs last quarter"
      },
      status: {
        message: "Outstanding feedback",
        context: "98% positive reviews"
      }
    }
  ];

  return <MetricCards metrics={sampleMetrics} />;
}