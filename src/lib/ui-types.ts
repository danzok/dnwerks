/**
 * UI-friendly types with camelCase properties
 * These are transformed from the database snake_case types for use in React components
 */

import type {
  UserRole,
  UserStatus,
  CustomerStatus,
  CampaignStatus,
  MessageStatus,
  TemplateCategory
} from './types';

// User Profiles (camelCase version)
export interface UserProfileUI {
  id: string;
  userId: string;
  role: UserRole;
  status: UserStatus;
  invitedBy?: string | null;
  inviteCode?: string | null;
  invitedAt?: string | null;
  approvedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewUserProfileUI {
  userId: string;
  role?: UserRole;
  status?: UserStatus;
  invitedBy?: string;
  inviteCode?: string;
  invitedAt?: string;
  approvedAt?: string;
}

// Invite Codes (camelCase version)
export interface InviteCodeUI {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string | null;
  usedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  email?: string | null;
  notes?: string | null;
}

export interface NewInviteCodeUI {
  code: string;
  createdBy: string;
  expiresAt?: string;
  maxUses?: number;
  email?: string;
  notes?: string;
}

// Customers (camelCase version)
export interface CustomerUI {
  id: string;
  userId: string;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  state?: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewCustomerUI {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  state?: string;
  status?: CustomerStatus;
}

// Campaigns (camelCase version)
export interface CampaignUI {
  id: string;
  userId: string;
  name: string;
  messageBody: string;
  status: CampaignStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewCampaignUI {
  userId: string;
  name: string;
  messageBody: string;
  status?: CampaignStatus;
  scheduledAt?: string;
  totalRecipients?: number;
}

// Campaign Messages (camelCase version)
export interface CampaignMessageUI {
  id: string;
  campaignId: string;
  customerId: string;
  phoneNumber: string;
  messageBody: string;
  status: MessageStatus;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedReason?: string | null;
  twilioSid?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewCampaignMessageUI {
  campaignId: string;
  customerId: string;
  phoneNumber: string;
  messageBody: string;
  status?: MessageStatus;
  twilioSid?: string;
}

// Campaign Templates (camelCase version)
export interface CampaignTemplateUI {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  messageBody: string;
  category: TemplateCategory;
  isDefault: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewCampaignTemplateUI {
  userId: string;
  name: string;
  description?: string;
  messageBody: string;
  category: TemplateCategory;
  isDefault?: boolean;
  isPublic?: boolean;
}

// Re-export common types
export type {
  UserRole,
  UserStatus,
  CustomerStatus,
  CampaignStatus,
  MessageStatus,
  TemplateCategory
} from './types';