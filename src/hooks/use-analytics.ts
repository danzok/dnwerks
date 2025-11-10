import { useState, useEffect, useCallback } from 'react';

export interface AnalyticsMetrics {
  totalMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  deliveryRate: number;
  engagementRate: number;
  engagedCustomers: number;
  totalCost: number;
  messageGrowth: number;
}

export interface CampaignDataPoint {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  engagement: number;
  cost: number;
}

export interface DeliveryDataPoint {
  date: string;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
}

export interface EngagementDataPoint {
  date: string;
  responses: number;
  clicks: number;
  unsubscribes: number;
  engagementRate: number;
}

export interface CostDataPoint {
  date: string;
  messages: number;
  cost: number;
  costPerMessage: number;
  campaignCount: number;
}

interface UseAnalyticsResult {
  metrics: AnalyticsMetrics;
  campaignData: CampaignDataPoint[];
  deliveryData: DeliveryDataPoint[];
  engagementData: EngagementDataPoint[];
  costData: CostDataPoint[];
  refreshAnalytics: () => Promise<void>;
  isLoading: boolean;
}

export function useAnalytics(days: number = 30): UseAnalyticsResult {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalMessages: 0,
    deliveredMessages: 0,
    failedMessages: 0,
    deliveryRate: 0,
    engagementRate: 0,
    engagedCustomers: 0,
    totalCost: 0,
    messageGrowth: 0,
  });

  const [campaignData, setCampaignData] = useState<CampaignDataPoint[]>([]);
  const [deliveryData, setDeliveryData] = useState<DeliveryDataPoint[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementDataPoint[]>([]);
  const [costData, setCostData] = useState<CostDataPoint[]>([]);

  const generateMockData = useCallback(() => {
    // Generate time series data
    const now = new Date();
    const timeSeriesData: CampaignDataPoint[] = [];
    const deliverySeriesData: DeliveryDataPoint[] = [];
    const engagementSeriesData: EngagementDataPoint[] = [];
    const costSeriesData: CostDataPoint[] = [];

    let totalMessages = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalEngaged = 0;
    let totalCost = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      // Mock campaign data with realistic variations
      const baseMessages = Math.floor(Math.random() * 500) + 100;
      const messages = baseMessages + Math.floor(Math.random() * 200);
      const delivered = Math.floor(messages * (0.85 + Math.random() * 0.1));
      const failed = messages - delivered;
      const engagement = Math.floor(delivered * (0.1 + Math.random() * 0.2));
      const cost = messages * 0.0079;

      totalMessages += messages;
      totalDelivered += delivered;
      totalFailed += failed;
      totalEngaged += engagement;
      totalCost += cost;

      timeSeriesData.push({
        date: dateStr,
        sent: messages,
        delivered,
        failed,
        engagement,
        cost,
      });

      deliverySeriesData.push({
        date: dateStr,
        delivered,
        failed,
        pending: Math.floor(Math.random() * 50),
        deliveryRate: (delivered / messages) * 100,
      });

      engagementSeriesData.push({
        date: dateStr,
        responses: engagement,
        clicks: Math.floor(engagement * (0.3 + Math.random() * 0.4)),
        unsubscribes: Math.floor(Math.random() * 5),
        engagementRate: (engagement / delivered) * 100,
      });

      costSeriesData.push({
        date: dateStr,
        messages,
        cost,
        costPerMessage: cost / messages,
        campaignCount: Math.floor(Math.random() * 3) + 1,
      });
    }

    const previousPeriodGrowth = 15 + Math.random() * 20; // 15-35% growth

    setCampaignData(timeSeriesData);
    setDeliveryData(deliverySeriesData);
    setEngagementData(engagementSeriesData);
    setCostData(costSeriesData);

    setMetrics({
      totalMessages,
      deliveredMessages: totalDelivered,
      failedMessages: totalFailed,
      deliveryRate: totalMessages > 0 ? (totalDelivered / totalMessages) * 100 : 0,
      engagementRate: totalDelivered > 0 ? (totalEngaged / totalDelivered) * 100 : 0,
      engagedCustomers: totalEngaged,
      totalCost,
      messageGrowth: previousPeriodGrowth,
    });
  }, [days]);

  const refreshAnalytics = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    generateMockData();
  }, [generateMockData]);

  useEffect(() => {
    generateMockData();
  }, [generateMockData]);

  return {
    metrics,
    campaignData,
    deliveryData,
    engagementData,
    costData,
    refreshAnalytics,
    isLoading: false,
  };
}