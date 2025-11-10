import { useState, useCallback } from "react";

interface AnalyticsMetrics {
  totalMessages: number;
  messageGrowth: number;
  deliveryRate: number;
  deliveredMessages: number;
  engagementRate: number;
  engagedCustomers: number;
  totalCost: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Mock data generator for demonstration
const generateMockMetrics = (): AnalyticsMetrics => ({
  totalMessages: Math.floor(Math.random() * 10000) + 1000,
  messageGrowth: Math.floor(Math.random() * 30) + 5,
  deliveryRate: Math.random() * 10 + 90,
  deliveredMessages: Math.floor(Math.random() * 9500) + 950,
  engagementRate: Math.random() * 20 + 10,
  engagedCustomers: Math.floor(Math.random() * 500) + 100,
  totalCost: Math.random() * 500 + 50,
});

const generateMockChartData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50,
      label: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    });
  }
  
  return data;
};

export function useAnalytics(days: number = 30) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(generateMockMetrics());
  const [campaignData, setCampaignData] = useState<ChartDataPoint[]>([]);
  const [deliveryData, setDeliveryData] = useState<ChartDataPoint[]>([]);
  const [engagementData, setEngagementData] = useState<ChartDataPoint[]>([]);
  const [costData, setCostData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data
      setMetrics(generateMockMetrics());
      setCampaignData(generateMockChartData(days));
      setDeliveryData(generateMockChartData(days));
      setEngagementData(generateMockChartData(days));
      setCostData(generateMockChartData(days));
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  return {
    metrics,
    campaignData,
    deliveryData,
    engagementData,
    costData,
    loading,
    error,
    refreshAnalytics,
  };
}