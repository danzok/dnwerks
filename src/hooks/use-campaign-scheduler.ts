import { useState, useEffect } from 'react';
import { Campaign, Customer } from '@/lib/types';
import { scheduleCampaign, rescheduleCampaign, cancelScheduledCampaign } from '@/lib/scheduler';

interface CampaignSchedulerResult {
  isScheduling: boolean;
  scheduleCampaign: (campaign: Campaign, customers: Customer[]) => Promise<void>;
  rescheduleCampaign: (campaign: Campaign, customers: Customer[], newDate: Date) => Promise<void>;
  cancelCampaign: (campaignId: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useCampaignScheduler(userId: string): CampaignSchedulerResult {
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScheduleCampaign = async (campaign: Campaign, customers: Customer[]) => {
    setIsScheduling(true);
    setError(null);

    try {
      // Add userId to campaign if not present
      const campaignWithUser = { ...campaign, userId };

      await scheduleCampaign(campaignWithUser, customers);

      // Show success notification
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Campaign scheduled successfully!</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to schedule campaign');
      throw error;
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRescheduleCampaign = async (
    campaign: Campaign,
    customers: Customer[],
    newDate: Date
  ) => {
    setIsScheduling(true);
    setError(null);

    try {
      // Add userId to campaign if not present
      const campaignWithUser = { ...campaign, userId };

      await rescheduleCampaign(campaignWithUser, customers, newDate);

      // Show success notification
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <span>Campaign rescheduled successfully!</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to reschedule campaign');
      throw error;
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    setIsScheduling(true);
    setError(null);

    try {
      await cancelScheduledCampaign(campaignId, userId);

      // Show success notification
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>Campaign cancelled successfully!</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      }

    } catch (error: any) {
      setError(error.message || 'Failed to cancel campaign');
      throw error;
    } finally {
      setIsScheduling(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isScheduling,
    scheduleCampaign: handleScheduleCampaign,
    rescheduleCampaign: handleRescheduleCampaign,
    cancelCampaign: handleCancelCampaign,
    error,
    clearError,
  };
}

// Hook for getting campaign scheduling status
export function useCampaignStatus(campaignId: string) {
  const [status, setStatus] = useState<{
    isScheduled: boolean;
    canReschedule: boolean;
    canCancel: boolean;
    scheduledAt?: Date;
    nextRunAt?: Date;
  }>({
    isScheduled: false,
    canReschedule: false,
    canCancel: false,
  });

  useEffect(() => {
    // In a real implementation, this would check the actual scheduling status
    // For now, we'll use mock data based on campaign status
    const checkStatus = async () => {
      try {
        // Mock status check - in real implementation, this would query the scheduler
        setStatus({
          isScheduled: true,
          canReschedule: true,
          canCancel: true,
          scheduledAt: new Date(Date.now() + 60000), // 1 minute from now
          nextRunAt: new Date(Date.now() + 60000),
        });
      } catch (error) {
        console.error('Failed to check campaign status:', error);
      }
    };

    checkStatus();

    // Set up periodic status updates
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [campaignId]);

  return status;
}

// Hook for getting user's scheduled campaigns
export function useScheduledCampaigns(userId: string) {
  const [scheduledCampaigns, setScheduledCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScheduledCampaigns = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real implementation, this would fetch from the scheduler
        const mockScheduled: Campaign[] = [
          {
            id: '3',
            name: 'Holiday Greeting',
            message_body: 'Happy Holidays {{firstName}}! 🎄 Thank you for being a valued customer.',
            status: 'scheduled',
            total_recipients: 500,
            sent_count: 0,
            delivered_count: 0,
            failed_count: 0,
            scheduled_at: '2024-12-25T10:00:00Z',
            created_at: '2024-01-10T00:00:00Z',
            updated_at: '2024-01-10T00:00:00Z',
            user_id: userId,
          },
          {
            id: '6',
            name: 'New Year Promotion',
            message_body: '🎊 New Year Special! Get 25% off your next campaign. Use code NY2025',
            status: 'scheduled',
            total_recipients: 200,
            sent_count: 0,
            delivered_count: 0,
            failed_count: 0,
            scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId,
          },
        ];

        setScheduledCampaigns(mockScheduled);
      } catch (error) {
        console.error('Failed to fetch scheduled campaigns:', error);
        setScheduledCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduledCampaigns();
  }, [userId]);

  return {
    scheduledCampaigns,
    isLoading,
    refetch: () => {
      setIsLoading(true);
      // Refetch logic would go here
    },
  };
}