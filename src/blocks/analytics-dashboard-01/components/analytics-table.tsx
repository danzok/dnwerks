import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface AnalyticsTableProps {
  data: ChartDataPoint[];
  type: "campaigns" | "delivery" | "engagement" | "costs";
  timeRange: string;
}

export function AnalyticsTable({ data, type, timeRange }: AnalyticsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No {type} data available for {timeRange.toLowerCase()}
      </div>
    );
  }

  const getValueDisplay = (value: number, type: string) => {
    switch (type) {
      case "delivery":
      case "engagement":
        return `${value.toFixed(1)}%`;
      case "costs":
        return `$${value.toFixed(2)}`;
      default:
        return value.toString();
    }
  };

  const getStatusBadge = (value: number, type: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    if (type === "delivery") {
      variant = value >= 95 ? "default" : value >= 85 ? "secondary" : "destructive";
    } else if (type === "engagement") {
      variant = value >= 15 ? "default" : value >= 10 ? "secondary" : "destructive";
    }
    
    return variant;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(-10).map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {item.label}
              </TableCell>
              <TableCell>
                {getValueDisplay(item.value, type)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadge(item.value, type)}>
                  {item.value >= 90 ? "Excellent" : 
                   item.value >= 75 ? "Good" : 
                   item.value >= 50 ? "Fair" : "Poor"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}