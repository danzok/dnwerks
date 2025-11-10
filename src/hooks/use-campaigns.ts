import { useState, useEffect } from "react";
import { CampaignUI } from "@/lib/ui-types";
import { transformApiRequest, transformDatabaseResponse } from "@/lib/property-transform";

interface UseCampaignsResult {
  campaigns: CampaignUI[];
  isLoading: boolean;
  createCampaign: (campaign: Partial<CampaignUI>) => Promise<void>;
  updateCampaign: (id: string, campaign: Partial<CampaignUI>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  sendTestMessage: (id: string, testPhoneNumber?: string) => Promise<any>;
  sendCampaign: (id: string, scheduledFor?: string) => Promise<any>;
}

export function useCampaigns(searchQuery: string = "", statusFilter: string = "all"): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<CampaignUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for development (using snake_case to simulate database response)
  const mockCampaigns = [
    {
      id: "1",
      user_id: "demo-user-id",
      name: "Welcome Series - New Customers",
      message_body: "Hi {{firstName}}! Welcome to DNwerks! We're excited to help you manage your SMS campaigns. Get started with our quick guide.",
      status: "draft",
      total_recipients: 0,
      sent_count: 0,
      delivered_count: 0,
      failed_count: 0,
      scheduled_at: null,
      created_at: new Date("2024-01-20").toISOString(),
      updated_at: new Date("2024-01-20").toISOString(),
    },
    {
      id: "2",
      user_id: "demo-user-id",
      name: "Monthly Special Offer",
      message_body: "🎉 Special Offer! Get 20% off your next campaign. Use code SAVE20. Valid until the end of the month. Don't miss out!",
      status: "sent",
      total_recipients: 150,
      sent_count: 150,
      delivered_count: 142,
      failed_count: 8,
      scheduled_at: null,
      created_at: new Date("2024-01-15").toISOString(),
      updated_at: new Date("2024-01-18").toISOString(),
    },
    {
      id: "3",
      user_id: "demo-user-id",
      name: "Holiday Greeting",
      message_body: "Happy Holidays {{firstName}}! 🎄 Thank you for being a valued customer. Wishing you and your loved ones a wonderful holiday season!",
      status: "scheduled",
      total_recipients: 500,
      sent_count: 0,
      delivered_count: 0,
      failed_count: 0,
      scheduled_at: new Date("2024-12-25T10:00:00Z").toISOString(),
      created_at: new Date("2024-01-10").toISOString(),
      updated_at: new Date("2024-01-10").toISOString(),
    },
    {
      id: "4",
      user_id: "demo-user-id",
      name: "Product Launch Announcement",
      message_body: "🚀 Big News! We're launching our new advanced analytics dashboard. Track your campaigns in real-time. Available next week!",
      status: "sending",
      total_recipients: 300,
      sent_count: 180,
      delivered_count: 165,
      failed_count: 15,
      scheduled_at: null,
      created_at: new Date("2024-01-22").toISOString(),
      updated_at: new Date("2024-01-22").toISOString(),
    },
    {
      id: "5",
      user_id: "demo-user-id",
      name: "Feedback Request",
      message_body: "Hi {{firstName}}, we'd love to hear your feedback! How are we doing? Reply to this message with your thoughts. Thank you!",
      status: "failed",
      total_recipients: 50,
      sent_count: 25,
      delivered_count: 15,
      failed_count: 35,
      scheduled_at: null,
      created_at: new Date("2024-01-18").toISOString(),
      updated_at: new Date("2024-01-18").toISOString(),
    },
  ];

  useEffect(() => {
    // Real API call
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        // Get the current user session
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("User not authenticated");
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        // Call the campaigns API
        const response = await fetch(`/api/campaigns?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch campaigns");
        }

        const result = await response.json();
        setCampaigns(result.data || []);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        // Fallback to mock data if API fails
        const transformedCampaigns = transformDatabaseResponse(mockCampaigns) as unknown as CampaignUI[];
        
        // Filter campaigns
        let filteredCampaigns = transformedCampaigns;

        if (statusFilter !== "all") {
          filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === statusFilter);
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredCampaigns = filteredCampaigns.filter(campaign =>
            campaign.name.toLowerCase().includes(query) ||
            campaign.messageBody.toLowerCase().includes(query)
          );
        }

        setCampaigns(filteredCampaigns);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [searchQuery, statusFilter]);

  const createCampaign = async (campaign: Partial<CampaignUI>) => {
    try {
      // Get the current user session
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Call the create campaign API
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...campaign,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      const result = await response.json();
      
      // Add the new campaign to the local state
      setCampaigns(prev => [result.data, ...prev]);
      
      return result.data;
    } catch (error) {
      console.error("Failed to create campaign:", error);
      
      // Fallback to mock behavior if API fails
      const newCampaign: CampaignUI = {
        id: Date.now().toString(),
        userId: campaign.userId || "demo-user-id",
        name: campaign.name || "",
        messageBody: campaign.messageBody || "",
        status: campaign.status || "draft",
        totalRecipients: campaign.totalRecipients || 0,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        scheduledAt: campaign.scheduledAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      throw error;
    }
  };

  const updateCampaign = async (id: string, campaign: Partial<CampaignUI>) => {
    try {
      // Get the current user session
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Call the update campaign API
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update campaign");
      }

      const result = await response.json();
      
      // Update the campaign in local state
      setCampaigns(prev =>
        prev.map(c =>
          c.id === id ? result.data : c
        )
      );
      
      return result.data;
    } catch (error) {
      console.error("Failed to update campaign:", error);
      
      // Fallback to mock behavior if API fails
      setCampaigns(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, ...campaign, updatedAt: new Date().toISOString() }
            : c
        )
      );
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      // Get the current user session
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Call the delete campaign API
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete campaign");
      }

      // Remove the campaign from local state
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      
      // Fallback to mock behavior if API fails
      setCampaigns(prev => prev.filter(c => c.id !== id));
      throw error;
    }
  };

  const sendCampaign = async (id: string, scheduledFor?: string) => {
    try {
      // Get the current user session
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Call the send campaign API
      const response = await fetch(`/api/campaigns/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledFor: scheduledFor || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send campaign");
      }

      const result = await response.json();
      console.log(`Campaign ${id} sent:`, result);

      // Update the campaign in local state
      setCampaigns(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                status: result.scheduledAt && new Date(result.scheduledAt) > new Date()
                  ? "scheduled"
                  : "sending",
                scheduledAt: result.scheduledAt ? new Date(result.scheduledAt).toISOString() : null,
                totalRecipients: result.totalRecipients,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      return result;
    } catch (error) {
      console.error("Failed to send campaign:", error);
      throw error;
    }
  };

  const sendTestMessage = async (id: string, testPhoneNumber?: string) => {
    try {
      // Get the current user session
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Call the test message API
      const response = await fetch(`/api/campaigns/${id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testPhoneNumber: testPhoneNumber || process.env.TEST_PHONE_NUMBER,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send test message");
      }

      const result = await response.json();
      console.log(`Test message sent for campaign ${id}:`, result);

      return result;
    } catch (error) {
      console.error("Failed to send test message:", error);
      throw error;
    }
  };

  return {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendTestMessage,
    sendCampaign,
  };
}