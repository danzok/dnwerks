# Architecture Diagram for Tag Filtering and Pagination

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (React)"
        A[Contacts Page] --> B[useContactsRealtime Hook]
        A --> C[Tag Filter Component]
        A --> D[Pagination Component]
        A --> E[Contact Form]
        B --> F[API Service Layer]
        C --> F
        D --> B
        E --> G[Tag Input Component]
    end
    
    subgraph "Backend (Next.js API)"
        F --> H[GET /api/customers]
        F --> I[POST /api/customers]
        F --> J[PUT /api/customers/[id]]
        H --> K[Tag Filtering Logic]
        H --> L[Pagination Logic]
        I --> M[Tag Validation]
    end
    
    subgraph "Database (Supabase/PostgreSQL)"
        K --> N[customers Table]
        L --> N
        M --> N
        N --> O[tags: TEXT[] Field]
        N --> P[GIN Index on tags]
    end
    
    subgraph "Data Flow"
        Q[User selects tags] --> R[Filter request sent]
        R --> S[Server-side filtering]
        S --> T[Paginated response]
        T --> U[UI updates]
    end
```

## Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CP as Contacts Page
    participant TF as Tag Filter
    participant H as useContactsRealtime
    participant API as API Service
    participant DB as Database
    
    U->>TF: Select tags to filter
    TF->>CP: Trigger filter change
    CP->>H: Update filter parameters
    H->>API: GET /api/customers?tags=...
    API->>DB: Query with tag filter
    DB->>API: Return filtered contacts
    API->>H: Paginated response
    H->>CP: Update contacts list
    CP->>U: Display filtered results
    
    U->>CP: Change page
    CP->>H: setPage(newPage)
    H->>API: GET /api/customers?page=2
    API->>DB: Query with pagination
    DB->>API: Return page 2 results
    API->>H: Paginated response
    H->>CP: Update contacts list
    CP->>U: Display page 2 results
```

## Database Schema Changes

```mermaid
erDiagram
    customers {
        uuid id PK
        uuid user_id FK
        text phone
        text first_name
        text last_name
        text email
        text state
        text status
        text[] tags
        timestamp created_at
        timestamp updated_at
    }
    
    customers ||--o{ user_profiles : "belongs to"
    
    note over customers: Added tags field as TEXT[] array
    note over customers: Added GIN index on tags for performance
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Success: Data fetched
    Loading --> Error: API error
    Success --> Loading: Refresh/Filter
    Error --> Loading: Retry
    
    state Success {
        [*] --> DisplayContacts
        DisplayContacts --> FilterApplied: User filters
        FilterApplied --> DisplayContacts: Results updated
        DisplayContacts --> PageChanged: User changes page
        PageChanged --> DisplayContacts: New page loaded
    }
```

## Component Hierarchy

```mermaid
graph TD
    A[Contacts Page] --> B[Site Header]
    A --> C[Realtime Bar]
    A --> D[Contact Stats]
    A --> E[Contacts By State Chart]
    A --> F[Filter Section]
    A --> G[Contact Table]
    A --> H[Pagination]
    A --> I[Contact Form Dialog]
    
    F --> J[Search Input]
    F --> K[State Filter]
    F --> L[Tag Filter]
    F --> M[Action Buttons]
    
    G --> N[Vercel Data Table]
    N --> O[Table Columns]
    O --> P[Tags Column]
    
    I --> Q[Form Fields]
    Q --> R[Tag Input]
    
    L --> S[Multi Select Component]
    H --> T[Pagination Component]
```

## API Request/Response Flow

```mermaid
graph LR
    subgraph "Request"
        A[Query Parameters] --> B[Search Query]
        A --> C[State Filter]
        A --> D[Tag Filter]
        A --> E[Page Number]
        A --> F[Limit]
    end
    
    subgraph "Processing"
        G[Build Supabase Query] --> H[Apply Filters]
        H --> I[Apply Pagination]
        I --> J[Execute Query]
        J --> K[Extract Unique Tags]
    end
    
    subgraph "Response"
        L[Contact Data] --> M[Pagination Metadata]
        M --> N[Available Tags]
        N --> O[Response Object]
    end
    
    A --> G
    K --> L
```

## Performance Optimization Strategy

```mermaid
graph TB
    subgraph "Database Level"
        A[GIN Index on tags] --> B[Fast array queries]
        C[Partial indexes] --> D[Optimized common queries]
    end
    
    subgraph "API Level"
        E[Server-side filtering] --> F[Reduced data transfer]
        G[Pagination] --> H[Smaller response size]
        I[Tag caching] --> J[Faster tag list retrieval]
    end
    
    subgraph "Frontend Level"
        K[Debounced search] --> L[Fewer API calls]
        M[React.memo] --> N[Reduced re-renders]
        O[Virtual scrolling] --> P[Better performance with large lists]
    end
```

## Security Considerations

```mermaid
graph TD
    A[Input Validation] --> B[Tag sanitization]
    B --> C[XSS prevention]
    C --> D[SQL injection prevention]
    
    E[Row Level Security] --> F[User isolation]
    F --> G[Data access control]
    
    H[Rate Limiting] --> I[API protection]
    I --> J[DoS prevention]
```

## Deployment Strategy

```mermaid
graph LR
    subgraph "Phase 1: Database"
        A[Run migration] --> B[Verify schema]
        B --> C[Test queries]
    end
    
    subgraph "Phase 2: Backend"
        D[Deploy API changes] --> E[Test endpoints]
        E --> F[Verify responses]
    end
    
    subgraph "Phase 3: Frontend"
        G[Deploy components] --> H[Test UI]
        H --> I[Integration testing]
    end
    
    A --> D
    D --> G