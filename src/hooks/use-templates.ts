import { useState, useEffect } from "react";
import { CampaignTemplateUI, TemplateCategory } from "@/lib/ui-types";
import { transformApiRequest, transformDatabaseResponse } from "@/lib/property-transform";

interface UseTemplatesResult {
  templates: CampaignTemplateUI[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: TemplateCategory | null;
  setCategoryFilter: (category: TemplateCategory | null) => void;
  filteredTemplates: CampaignTemplateUI[];
  createTemplate: (template: Partial<CampaignTemplateUI>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<CampaignTemplateUI>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<void>;
}

// Mock templates data (using snake_case to simulate database response)
const mockTemplates = [
  {
    id: "tpl-1",
    user_id: "demo-user-id",
    name: "Welcome Message",
    description: "A warm welcome message for new customers or subscribers",
    message_body: "Hi {firstName}! Welcome to [Your Business]. We're excited to have you! Reply STOP to opt out.",
    category: "general",
    is_default: true,
    is_public: true,
    created_at: new Date("2024-01-01").toISOString(),
    updated_at: new Date("2024-01-01").toISOString(),
  },
  {
    id: "tpl-2",
    user_id: "demo-user-id",
    name: "Flash Sale",
    description: "Urgent promotional message for flash sales and limited-time offers",
    message_body: "🔥 FLASH SALE! {firstName}, get 30% off everything for the next 24 hours only! Use code: FLASH30. Shop now: [link]",
    category: "marketing",
    is_default: true,
    is_public: true,
    created_at: new Date("2024-01-05").toISOString(),
    updated_at: new Date("2024-01-05").toISOString(),
  },
  {
    id: "tpl-3",
    user_id: "demo-user-id",
    name: "Appointment Reminder",
    description: "Automated reminder for upcoming appointments and meetings",
    message_body: "Hi {firstName}, this is a reminder of your appointment tomorrow at [time]. Reply Y to confirm or call us at [phone].",
    category: "reminders",
    is_default: true,
    is_public: true,
    created_at: new Date("2024-01-10").toISOString(),
    updated_at: new Date("2024-01-10").toISOString(),
  },
  {
    id: "tpl-4",
    user_id: "demo-user-id",
    name: "Order Shipped",
    description: "Notification to customers when their orders have been shipped",
    message_body: "Great news {firstName}! Your order #[orderNumber] has shipped. Track it here: [trackingLink]. Questions? Reply to this message.",
    category: "alerts",
    is_default: true,
    is_public: true,
    created_at: new Date("2024-01-12").toISOString(),
    updated_at: new Date("2024-01-12").toISOString(),
  },
  {
    id: "tpl-5",
    user_id: "demo-user-id",
    name: "Event Announcement",
    description: "Invite customers to upcoming events and special occasions",
    message_body: "🎉 {firstName}, you're invited! Join us for [Event Name] on [Date] at [Time]. Register now: [link]. Limited spots available!",
    category: "announcements",
    is_default: true,
    is_public: true,
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-01-15").toISOString(),
  },
  {
    id: "tpl-6",
    user_id: "demo-user-id",
    name: "Customer Feedback",
    description: "Request feedback and reviews from customers after service",
    message_body: "Hi {firstName}, how was your recent experience with us? Share your thoughts: [surveyLink]. Your feedback helps us improve!",
    category: "general",
    is_default: false,
    is_public: false,
    created_at: new Date("2024-01-18").toISOString(),
    updated_at: new Date("2024-01-18").toISOString(),
  },
  {
    id: "tpl-7",
    user_id: "demo-user-id",
    name: "Payment Reminder",
    description: "Gentle reminder for customers about upcoming or overdue payments",
    message_body: "Hi {firstName}, this is a friendly reminder that payment for invoice #[invoiceNumber] is now due. Pay securely: [paymentLink]",
    category: "reminders",
    is_default: false,
    is_public: false,
    created_at: new Date("2024-01-20").toISOString(),
    updated_at: new Date("2024-01-20").toISOString(),
  },
  {
    id: "tpl-8",
    user_id: "demo-user-id",
    name: "Loyalty Program",
    description: "Inform customers about loyalty rewards and special member benefits",
    message_body: "🎁 {firstName}, you've earned [points] loyalty points! Redeem them for exclusive rewards: [rewardsLink]. Thanks for being loyal!",
    category: "marketing",
    is_default: true,
    is_public: true,
    created_at: new Date("2024-01-22").toISOString(),
    updated_at: new Date("2024-01-22").toISOString(),
  },
];

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<CampaignTemplateUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | null>(null);

  useEffect(() => {
    // Simulate API call
    const loadTemplates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Transform mock data from snake_case to camelCase for UI
        const transformedTemplates = transformDatabaseResponse(mockTemplates) as unknown as CampaignTemplateUI[];
        setTemplates(transformedTemplates);
      } catch (err) {
        setError("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates based on search query and category filter
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.messageBody.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const createTemplate = async (template: Partial<CampaignTemplateUI>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Transform to snake_case for database
    const templateData = transformApiRequest(template);
    
    const newTemplate: CampaignTemplateUI = {
      id: `tpl-${Date.now()}`,
      userId: "demo-user-id",
      name: template.name || "",
      description: template.description || null,
      messageBody: template.messageBody || "",
      category: template.category || "general",
      isDefault: template.isDefault || false,
      isPublic: template.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
  };

  const updateTemplate = async (id: string, updates: Partial<CampaignTemplateUI>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTemplates(prev =>
      prev.map(template =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    );
  };

  const deleteTemplate = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const duplicateTemplate = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const originalTemplate = templates.find(t => t.id === id);
    if (originalTemplate) {
      const duplicatedTemplate: CampaignTemplateUI = {
        ...originalTemplate,
        id: `tpl-${Date.now()}`,
        name: `${originalTemplate.name} (Copy)`,
        description: originalTemplate.description,
        isDefault: false,
        isPublic: false, // Copies are private by default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTemplates(prev => [duplicatedTemplate, ...prev]);
    }
  };

  return {
    templates,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filteredTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
}