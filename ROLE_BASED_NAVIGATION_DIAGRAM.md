# Role-Based Navigation Implementation Flow

## System Architecture Diagram

```mermaid
graph TD
    A[User Login] --> B{Check User Role}
    B -->|Admin| C[Load Full Navigation]
    B -->|User| D[Load Filtered Navigation]
    
    C --> E[AppSidebar with Admin Items]
    C --> F[DashboardLayout with Admin Nav]
    
    D --> G[AppSidebar without Admin Items]
    D --> H[DashboardLayout without Admin Nav]
    
    E --> I[User Can Access Admin Pages]
    F --> I
    G --> J[User Redirected from Admin Pages]
    H --> J
    
    I --> K[Admin Dashboard]
    I --> L[User Management]
    I --> M[System Settings]
    
    J --> N[Regular Dashboard]
    J --> O[Campaigns]
    J --> P[Contacts]
```

## Navigation Filtering Logic

```mermaid
graph LR
    A[Navigation Items] --> B[Role Filter]
    B --> C{User Role = Admin?}
    C -->|Yes| D[Show All Items]
    C -->|No| E[Filter Out Admin Items]
    
    D --> F[Complete Navigation]
    E --> G[User-Only Navigation]
    
    F --> H[Admin Section Visible]
    G --> I[Admin Section Hidden]
```

## Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login
    participant A as Auth
    participant P as Profile
    participant S as Sidebar
    participant DL as DashboardLayout
    
    U->>L: Login Request
    L->>A: Authenticate User
    A->>P: Fetch User Profile
    P->>S: Pass Role to Sidebar
    P->>DL: Pass Role to DashboardLayout
    
    S->>S: Filter Navigation Items
    DL->>DL: Show/Hide Admin Navigation
    
    S->>U: Render Filtered Sidebar
    DL->>U: Render Layout with/without Admin Nav
```

## Admin Route Protection Flow

```mermaid
graph TD
    A[User Requests Admin Page] --> B{Middleware Check}
    B -->|Not Authenticated| C[Redirect to Login]
    B -->|Authenticated| D{Check User Role}
    
    D -->|Not Admin| E[Redirect to Dashboard]
    D -->|Admin| F[Load Admin Page]
    
    F --> G{Server-side Role Check}
    G -->|Valid| H[Render Admin Page]
    G -->|Invalid| I[Redirect to Dashboard]
    
    C --> J[Login Page]
    E --> K[User Dashboard]
    H --> L[Admin Content]
    I --> K
```

## Implementation Components

### 1. Navigation Data Structure
```typescript
interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavItem[]
  requiresRole?: UserRole  // New property for role-based access
}
```

### 2. Role Filtering Function
```typescript
function filterNavItemsByRole(items: NavItem[], userRole: UserRole): NavItem[]
```

### 3. Component Updates
- **AppSidebar**: Add role-based filtering
- **DashboardLayout**: Already has role checks (verified)
- **Admin Pages**: Add server-side protection
- **Middleware**: Add route protection

## Security Layers

1. **Client-Side Navigation Hiding** - UI/UX improvement
2. **Server-Side Page Protection** - Security enforcement
3. **Middleware Route Protection** - Additional security layer
4. **API Endpoint Protection** - Backend security

## Testing Scenarios

### Admin User Flow
1. Login as Admin → See all navigation items
2. Access /admin → Page loads successfully
3. Access /admin/users → Page loads successfully
4. Access /admin/settings → Page loads successfully

### Regular User Flow
1. Login as User → See filtered navigation (no admin section)
2. Access /admin → Redirected to /dashboard
3. Access /admin/users → Redirected to /dashboard
4. Access /admin/settings → Redirected to /dashboard

### Direct URL Access
1. Non-admin tries direct admin URL → Redirected
2. Non-authenticated user tries admin URL → Redirected to login