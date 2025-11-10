# Context7 Development Environment Configuration

## Overview
This document establishes Context7 as the reference standard for all development in the DNwerks SMS campaign management application.

## Context7 Integration Standards

### 1. React Component Standards (Context7 Reference)
- **Components defined at module level**: No components inside functions
- **Proper hook usage**: Follow Rules of Hooks strictly
- **JSX component usage**: Never call components directly, always use JSX
- **No conditional hooks**: Hooks must be called unconditionally at component top

### 2. Next.js App Router Standards (Context7 Reference)
- **Server Components**: Default for all components unless client interaction needed
- **Data Fetching**: Use `fetch()` with proper caching strategies
- **Layout Structure**: Separate layout.js files for nested layouts
- **Route Handlers**: Use Web Request/Response APIs

### 3. Supabase Integration Standards (Context7 Reference)
- **Row Level Security**: All database operations must respect RLS
- **Type Safety**: Comprehensive TypeScript interfaces for all database operations
- **Environment Variables**: Proper configuration for database connections
- **Error Handling**: Consistent error patterns for all database operations

### 4. shadcn/ui Component Standards (Context7 Reference)
- **Component Composition**: Proper use of sub-components
- **Theme Configuration**: Consistent design system implementation
- **Design System**: Follow established patterns for consistency
- **Component Registry**: Proper configuration in components.json

## Implementation Guidelines

### Component Development
```typescript
// ✅ Correct: Component defined at module level
export function MyComponent({ defaultValue }: Props) {
  const [state, setState] = useState(defaultValue)
  // Component logic
  return <div>{state}</div>
}

// ❌ Incorrect: Component defined inside function
function createComponent(defaultValue: any) {
  return function Component() {
    // Component logic
  }
}
```

### Hook Usage
```typescript
// ✅ Correct: Hooks called unconditionally at top
function MyComponent() {
  const [data, setData] = useState(null)
  const theme = useContext(ThemeContext)
  // Component logic
}

// ❌ Incorrect: Conditional hook usage
function MyComponent({ condition }) {
  if (condition) {
    const [data, setData] = useState(null) // Bad!
  }
}
```

### Data Fetching (Next.js App Router)
```typescript
// ✅ Correct: Server component with fetch
export default async function Page() {
  const data = await fetch('https://api.example.com', {
    cache: 'no-store' // or 'force-cache' with revalidate
  })
  const posts = await data.json()
  return <PostList posts={posts} />
}
```

### Supabase Integration
```typescript
// ✅ Correct: Type-safe database operations with RLS
async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
```

## Development Workflow

### 1. Code Review Checklist
- [ ] Components defined at module level
- [ ] Hooks follow Rules of Hooks
- [ ] Components used in JSX, not called directly
- [ ] Server Components used where possible
- [ ] Proper TypeScript typing
- [ ] RLS policies respected in database operations
- [ ] Consistent error handling

### 2. Context7 Documentation Reference
- **React**: /reactjs/react.dev
- **Next.js**: /vercel/next.js
- **Supabase**: /supabase/supabase
- **shadcn/ui**: /shadcn-ui/ui

### 3. Environment Configuration
```bash
# Context7 MCP Server Integration
export CONTEXT7_ENABLED=true
export CONTEXT7_REFERENCE_MODE=true

# Supabase Configuration (Context7 Standard)
export DATABASE_URL="your-supabase-connection-string"
export DIRECT_URL="your-direct-database-connection-string"
```

## Migration Priority

### High Priority
1. Fix React component definition violations
2. Implement proper hook usage patterns
3. Add Row Level Security to database operations
4. Update DOM manipulation to use React refs

### Medium Priority
1. Migrate to Server Components where appropriate
2. Implement proper data fetching patterns
3. Add comprehensive TypeScript typing
4. Configure proper error boundaries

### Low Priority
1. Optimize component architecture
2. Add comprehensive testing
3. Implement advanced caching strategies
4. Add performance monitoring

## Quality Assurance

### Automated Checks
- ESLint rules for React patterns
- TypeScript strict mode
- Prettier for code formatting
- Husky for pre-commit hooks

### Manual Review
- Component architecture review
- Hook usage validation
- Database operation security review
- Performance impact assessment

## Training and Documentation

### Team Guidelines
1. Always reference Context7 documentation before implementing features
2. Use Context7 MCP server for real-time guidance
3. Participate in code reviews focusing on Context7 compliance
4. Document any deviations from Context7 standards

### Resources
- Context7 MCP Server: Integrated in development environment
- Documentation: Available via MCP server integration
- Examples: Context7 provides extensive code examples
- Support: Context7 community and documentation

## Conclusion

This configuration establishes Context7 as the authoritative reference for all development activities, ensuring consistency, quality, and alignment with industry best practices.