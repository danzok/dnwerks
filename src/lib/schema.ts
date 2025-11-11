/**
 * Re-export database types for consistency
 * Simplified schema for direct admin-controlled authentication
 */

export * from './types';
export * from './ui-types';

// For backward compatibility, export commonly used types
export type {
  Campaign,
  Customer,
  CampaignTemplate,
  UserProfile,
  CampaignMessage,
  NewCampaign,
  NewCustomer,
  NewCampaignTemplate,
  NewUserProfile,
  NewCampaignMessage,
  CreateUserRequest,
  UserRole,
  CustomerStatus,
  CampaignStatus,
  MessageStatus,
  TemplateCategory,
  DatabaseResponse,
  DatabaseListResponse,
  QueryOptions,
  FilterOptions
} from './types';

// Export UI types for convenience
export type {
  CampaignUI,
  CustomerUI,
  CampaignTemplateUI,
  UserProfileUI,
  CampaignMessageUI,
  NewCampaignUI,
  NewCustomerUI,
  NewCampaignTemplateUI,
  NewUserProfileUI,
  NewCampaignMessageUI
} from './ui-types';