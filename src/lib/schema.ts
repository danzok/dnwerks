/**
 * Re-export database types for consistency
 * This file acts as a schema entry point for the application
 */

export * from './types';
export * from './ui-types';

// For backward compatibility, export commonly used types
export type {
  Campaign,
  Customer,
  CampaignTemplate,
  UserProfile,
  InviteCode,
  CampaignMessage,
  NewCampaign,
  NewCustomer,
  NewCampaignTemplate,
  NewUserProfile,
  NewInviteCode,
  NewCampaignMessage,
  UserRole,
  UserStatus,
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
  InviteCodeUI,
  CampaignMessageUI,
  NewCampaignUI,
  NewCustomerUI,
  NewCampaignTemplateUI,
  NewUserProfileUI,
  NewInviteCodeUI,
  NewCampaignMessageUI
} from './ui-types';