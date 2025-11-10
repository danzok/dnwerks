# Property Naming Convention Guide

This document explains the property naming conventions used in the DNwerks application and how to properly handle the transformation between database and UI layers.

## Overview

The application uses two different property naming conventions:

1. **Database Layer (Supabase/PostgreSQL)**: `snake_case`
2. **UI Layer (React/TypeScript)**: `camelCase`

## Why This Approach?

- **Database**: PostgreSQL best practice recommends `snake_case` for column names
- **JavaScript/TypeScript**: Best practice recommends `camelCase` for object properties
- **Separation of Concerns**: Clear distinction between data storage and presentation layers

## Type Systems

### Database Types (`src/lib/types.ts`)
- Use `snake_case` property names
- Match the exact database schema
- Used for API requests and database operations

Example:
```typescript
interface Campaign {
  id: string;
  user_id: string;        // snake_case
  message_body: string;   // snake_case
  created_at: string;      // snake_case
  updated_at: string;      // snake_case
}
```

### UI Types (`src/lib/ui-types.ts`)
- Use `camelCase` property names
- Used in React components and hooks
- More natural for JavaScript development

Example:
```typescript
interface CampaignUI {
  id: string;
  userId: string;         // camelCase
  messageBody: string;    // camelCase
  createdAt: string;       // camelCase
  updatedAt: string;       // camelCase
}
```

## Transformation Utilities (`src/lib/property-transform.ts`)

### Key Functions:

#### `transformDatabaseResponse<T>(data)`
Converts database responses (snake_case) to UI format (camelCase)
```typescript
// Database returns: { user_id: "123", message_body: "Hello" }
const uiData = transformDatabaseResponse(dbData);
// Result: { userId: "123", messageBody: "Hello" }
```

#### `transformApiRequest<T>(data)`
Converts UI data (camelCase) to database format (snake_case)
```typescript
// UI sends: { userId: "123", messageBody: "Hello" }
const dbData = transformApiRequest(uiData);
// Result: { user_id: "123", message_body: "Hello" }
```

## Usage Patterns

### 1. Database Layer (`src/lib/db.ts`)
```typescript
// Always transform responses before returning
const { data } = await supabase.from('campaigns').select('*');
return transformDatabaseResponse(data);
```

### 2. Hooks (`src/hooks/use-*.ts`)
```typescript
// Use UI types for hook interfaces
interface UseCampaignsResult {
  campaigns: CampaignUI[];  // Use UI types
}

// Transform mock data to simulate database response
const transformedData = transformDatabaseResponse(mockData) as CampaignUI[];
```

### 3. Components
```typescript
// Always use UI types in components
import { CampaignUI } from '@/lib/ui-types';

interface CampaignCardProps {
  campaign: CampaignUI;  // camelCase properties
}

// Access properties with camelCase
const { userId, messageBody, createdAt } = campaign;
```

### 4. API Endpoints
```typescript
// Transform request body before sending to database
const campaignData = transformApiRequest(req.body);
await supabase.from('campaigns').insert(campaignData);
```

## Migration Guide

### Converting Existing Code

1. **Identify the layer**:
   - Database operations → Use `snake_case`
   - UI components → Use `camelCase`

2. **Add transformation**:
   ```typescript
   // Before
   const campaign = await getCampaign(id);
   setCampaign(campaign);
   
   // After
   const campaign = await getCampaign(id);
   const campaignUI = transformDatabaseResponse(campaign);
   setCampaign(campaignUI);
   ```

3. **Update type imports**:
   ```typescript
   // Before
   import { Campaign } from '@/lib/types';
   
   // After
   import { CampaignUI } from '@/lib/ui-types';
   ```

## Common Pitfalls

1. **Mixing conventions**: Don't use `snake_case` in UI components
2. **Missing transformation**: Always transform data between layers
3. **Type mismatches**: Use appropriate types for each layer
4. **Direct database access**: Avoid using database types in UI

## Best Practices

1. **Consistent transformation**: Always use the utility functions
2. **Clear separation**: Database layer uses snake_case, UI layer uses camelCase
3. **Type safety**: Use the appropriate TypeScript types for each layer
4. **Documentation**: Document any custom transformations

## Example Flow

```
Database (snake_case) 
    ↓ transformDatabaseResponse()
UI Layer (camelCase)
    ↓ transformApiRequest()
Database (snake_case)
```

This ensures consistent property naming throughout the application while maintaining best practices for both database and JavaScript conventions.