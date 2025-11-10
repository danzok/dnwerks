/**
 * TypeScript types for database entities
 * These match the Supabase database schema
 */

// Base types
export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type CustomerStatus = 'active' | 'inactive';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type TemplateCategory = 'general' | 'marketing' | 'reminders' | 'alerts' | 'announcements';

// User Profiles
export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  status: UserStatus;
  invited_by?: string | null;
  invite_code?: string | null;
  invited_at?: string | null;
  approved_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewUserProfile {
  user_id: string;
  role?: UserRole;
  status?: UserStatus;
  invited_by?: string;
  invite_code?: string;
  invited_at?: string;
  approved_at?: string;
}

// Invite Codes
export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by?: string | null;
  used_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  email?: string | null;
  notes?: string | null;
}

export interface NewInviteCode {
  code: string;
  created_by: string;
  expires_at?: string;
  max_uses?: number;
  email?: string;
  notes?: string;
}

// Customers
export interface Customer {
  id: string;
  user_id: string;
  phone: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  state?: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface NewCustomer {
  user_id: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  state?: string;
  status?: CustomerStatus;
}

// Campaigns
export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  message_body: string;
  status: CampaignStatus;
  scheduled_at?: string | null;
  sent_at?: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewCampaign {
  user_id: string;
  name: string;
  message_body: string;
  status?: CampaignStatus;
  scheduled_at?: string;
  total_recipients?: number;
}

// Campaign Messages
export interface CampaignMessage {
  id: string;
  campaign_id: string;
  customer_id: string;
  phone_number: string;
  message_body: string;
  status: MessageStatus;
  sent_at?: string | null;
  delivered_at?: string | null;
  failed_reason?: string | null;
  twilio_sid?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewCampaignMessage {
  campaign_id: string;
  customer_id: string;
  phone_number: string;
  message_body: string;
  status?: MessageStatus;
  twilio_sid?: string;
}

// Campaign Templates
export interface CampaignTemplate {
  id: string;
  user_id: string;
  name: string;
  message_body: string;
  category: TemplateCategory;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewCampaignTemplate {
  user_id: string;
  name: string;
  message_body: string;
  category: TemplateCategory;
  is_default?: boolean;
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResponse<T> {
  data: T[] | null;
  error: Error | null;
}

// Common query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface FilterOptions {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}