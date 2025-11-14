# TypeScript Type Definitions

## Core Data Types

### Campaign Types
```typescript
// types/campaign.ts
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  messageContent: string;
  status: CampaignStatus;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  _count: {
    messages: number;
    messagesSent?: number;
    messagesDelivered?: number;
  };
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';

export interface CreateCampaignInput {
  name: string;
  description?: string;
  messageContent: string;
  scheduledAt?: string;
  sendImmediately?: boolean;
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  messageContent?: string;
  scheduledAt?: string;
  status?: CampaignStatus;
}

export interface CampaignMetrics {
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  cost: number;
}

export interface CampaignFilters {
  status?: CampaignStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  createdBy?: string[];
  search?: string;
}
```

### Customer Types
```typescript
// types/customer.ts
export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  timezone?: string;
  smsConsent: boolean;
  emailConsent: boolean;
  doNotContact: boolean;
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customerTags: CustomerTag[];
  _count?: {
    messages: number;
  };
}

export interface CustomerTag {
  id: string;
  customerId: string;
  tagId: string;
  tag: Tag;
  createdAt: string;
}

export interface CreateCustomerInput {
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  timezone?: string;
  smsConsent?: boolean;
  emailConsent?: boolean;
  source?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  smsConsent?: boolean;
  emailConsent?: boolean;
  doNotContact?: boolean;
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
  tags?: string[];
  smsConsent?: boolean;
  doNotContact?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  source?: string;
}

export interface CustomerImportResult {
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  errors: string[];
}
```

### Message Types
```typescript
// types/message.ts
export interface CampaignMessage {
  id: string;
  campaignId: string;
  customerId: string;
  phoneNumber: string;
  messageContent: string;
  status: MessageStatus;
  externalId?: string;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  customer?: Customer;
}

export type MessageStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'rejected';

export interface CreateMessageInput {
  campaignId: string;
  customerId: string;
  phoneNumber: string;
  messageContent: string;
  scheduledAt?: string;
}

export interface MessageFilters {
  campaignId?: string;
  customerId?: string;
  status?: MessageStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface MessageMetrics {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  rejected: number;
  deliveryRate: number;
  averageDeliveryTime: number;
}
```

### Tag Types
```typescript
// types/tag.ts
export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  _count?: {
    customerTags: number;
  };
}

export interface CreateTagInput {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  description?: string;
}

export interface TagUsageStats {
  tagId: string;
  tagName: string;
  customerCount: number;
  campaignCount: number;
  lastUsed?: string;
}
```

### User Types
```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'viewer';

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  password?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  preferences: UserPreferences;
}

export interface UserPreferences {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  browser: boolean;
  campaignSent: boolean;
  campaignFailed: boolean;
  customerAdded: boolean;
  systemUpdates: boolean;
}
```

## API Response Types

### Common Response Types
```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

### Campaign API Types
```typescript
// types/api/campaign.ts
import { Campaign, CampaignFilters, CreateCampaignInput, UpdateCampaignInput } from '../campaign';

export interface GetCampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateCampaignResponse {
  campaign: Campaign;
}

export interface UpdateCampaignResponse {
  campaign: Campaign;
}

export interface DeleteCampaignResponse {
  success: boolean;
}

export interface SendCampaignResponse {
  success: boolean;
  message: string;
  scheduledMessages?: number;
}

export interface GetCampaignAnalyticsResponse {
  metrics: CampaignMetrics;
  timeline: CampaignTimelineEntry[];
  breakdown: {
    byStatus: MessageStatusBreakdown[];
    byHour: HourlyBreakdown[];
    byDay: DailyBreakdown[];
  };
}

export interface CampaignTimelineEntry {
  timestamp: string;
  event: 'created' | 'scheduled' | 'sending' | 'sent' | 'paused';
  count: number;
  cumulative: number;
}

export interface MessageStatusBreakdown {
  status: MessageStatus;
  count: number;
  percentage: number;
}

export interface HourlyBreakdown {
  hour: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface DailyBreakdown {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
}
```

### Customer API Types
```typescript
// types/api/customer.ts
import { Customer, CustomerFilters, CreateCustomerInput, UpdateCustomerInput, CustomerImportResult } from '../customer';

export interface GetCustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateCustomerResponse {
  customer: Customer;
}

export interface UpdateCustomerResponse {
  customer: Customer;
}

export interface DeleteCustomerResponse {
  success: boolean;
}

export interface ImportCustomersResponse {
  result: CustomerImportResult;
}

export interface BulkUpdateCustomersResponse {
  updated: number;
  failed: number;
  errors: string[];
}

export interface GetCustomerAnalyticsResponse {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customersByTag: TagCustomerCount[];
  customerGrowth: CustomerGrowthEntry[];
}

export interface TagCustomerCount {
  tagId: string;
  tagName: string;
  customerCount: number;
}

export interface CustomerGrowthEntry {
  date: string;
  total: number;
  new: number;
}
```

## Utility Types

### Form Types
```typescript
// types/forms.ts
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local';
  value?: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  helperText?: string;
  error?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormActions<T = any> {
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  validate: () => boolean;
  reset: () => void;
  submit: () => Promise<void>;
}
```

### UI Component Types
```typescript
// types/ui.ts
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface SearchConfig {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export interface FilterConfig {
  filters: Record<string, FilterOption[]>;
  activeFilters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
  onClearFilters?: () => void;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
```

### Hook Types
```typescript
// types/hooks.ts
import { useState, useEffect, useCallback } from 'react';

export interface UseApiResult<T, P = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (params?: P) => Promise<T>;
  reset: () => void;
}

export interface UsePaginationResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refresh: () => Promise<void>;
}

export interface UseSearchResult<T> {
  results: T[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

export interface UseFormResult<T = any> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  validate: () => boolean;
  reset: () => void;
  submit: () => Promise<void>;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UseDebounceResult {
  debouncedValue: any;
  isDebouncing: boolean;
}
```

### Configuration Types
```typescript
// types/config.ts
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  auth: {
    sessionTimeout: number;
    refreshThreshold: number;
  };
  sms: {
    provider: 'twilio' | 'aws-sns' | 'custom';
    maxRetries: number;
    retryDelayMs: number;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    chunkSize: number;
  };
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  features: {
    analytics: boolean;
    bulkOperations: boolean;
    advancedFilters: boolean;
    export: boolean;
    import: boolean;
  };
}

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  DATABASE_URL: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  UPLOAD_DIR?: string;
  CORS_ORIGINS?: string[];
}
```

### Event Types
```typescript
// types/events.ts
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: string;
  userId?: string;
  data: any;
}

export interface CampaignEvent extends BaseEvent {
  type: 'campaign.created' | 'campaign.updated' | 'campaign.scheduled' | 'campaign.sent' | 'campaign.paused' | 'campaign.deleted';
  data: {
    campaignId: string;
    campaignName: string;
    changes?: Record<string, any>;
  };
}

export interface CustomerEvent extends BaseEvent {
  type: 'customer.created' | 'customer.updated' | 'customer.deleted' | 'customer.imported' | 'customer.tagged' | 'customer.untagged';
  data: {
    customerId: string;
    customerEmail?: string;
    customerPhone?: string;
    tagId?: string;
    tagName?: string;
    changes?: Record<string, any>;
  };
}

export interface MessageEvent extends BaseEvent {
  type: 'message.sent' | 'message.delivered' | 'message.failed' | 'message.bounced';
  data: {
    messageId: string;
    campaignId: string;
    customerId: string;
    phoneNumber: string;
    status: string;
    error?: string;
  };
}

export interface SystemEvent extends BaseEvent {
  type: 'user.login' | 'user.logout' | 'user.created' | 'user.updated' | 'system.backup' | 'system.maintenance' | 'system.error';
  data: {
    action: string;
    target?: string;
    details?: any;
  };
}

export type AppEvent = CampaignEvent | CustomerEvent | MessageEvent | SystemEvent;

export interface EventHandler<T = any> {
  (event: T): Promise<void> | void;
}

export interface EventBus {
  on<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): () => void;
  emit<T extends AppEvent>(event: T): Promise<void>;
  off<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): void;
}
```

## Prisma Type Extensions

```typescript
// types/prisma-extensions.ts
import { Prisma } from '@prisma/client';

// Extend Prisma types for better type safety
export type CampaignWithCounts = Prisma.CampaignGetPayload<{
  include: {
    _count: {
      select: {
        messages: true;
        messagesSent: true;
        messagesDelivered: true;
      };
    };
  };
}>;

export type CustomerWithTags = Prisma.CustomerGetPayload<{
  include: {
    customerTags: {
      include: {
        tag: true;
      };
    };
    _count: {
      select: {
        messages: true;
      };
    };
  };
}>;

export type MessageWithCustomer = Prisma.CampaignMessageGetPayload<{
  include: {
    customer: true;
    campaign: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export type TagWithCounts = Prisma.TagGetPayload<{
  include: {
    _count: {
      select: {
        customerTags: true;
      };
    };
  };
}>;

// Custom query result types
export interface CampaignAnalytics {
  campaignId: string;
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  pendingMessages: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  totalCost: number;
  messagesByHour: Array<{
    hour: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  messagesByDay: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  messagesByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customersWithConsent: number;
  customersWithoutConsent: number;
  customersByTag: Array<{
    tagId: string;
    tagName: string;
    customerCount: number;
  }>;
  customerGrowth: Array<{
    date: string;
    totalCustomers: number;
    newCustomers: number;
  }>;
  messageStats: {
    totalMessages: number;
    averageMessagesPerCustomer: number;
    mostActiveCustomers: Array<{
      customerId: string;
      customerName: string;
      messageCount: number;
    }>;
  };
}
```