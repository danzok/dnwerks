# Context7 Development Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy your Supabase configuration to `.env.local`
   - Ensure all required environment variables are set

3. **Run Context7 validation**:
   ```bash
   npm run context7:validate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Before Making Changes
1. Run `npm run context7:validate` to ensure compliance
2. Check Context7 documentation via MCP server
3. Follow established patterns from existing code

### During Development
1. Use Context7 MCP server for real-time guidance
2. Reference Context7 library documentation:
   - React: /reactjs/react.dev
   - Next.js: /vercel/next.js
   - Supabase: /supabase/supabase
   - shadcn/ui: /shadcn-ui/ui

### Before Committing
1. Run `npm run context7:review`
2. Ensure all ESLint rules pass
3. Verify TypeScript compilation
4. Test functionality

## Context7 Standards

### React Components
- Define components at module level only
- Use hooks unconditionally at component top
- Never call components directly (use JSX)
- Follow Rules of Hooks strictly

### Next.js App Router
- Use Server Components by default
- Implement proper data fetching patterns
- Structure layouts correctly
- Use proper route handlers

### Supabase Integration
- Respect Row Level Security policies
- Use comprehensive TypeScript typing
- Handle errors consistently
- Configure environment properly

### shadcn/ui Components
- Follow component composition patterns
- Maintain design system consistency
- Use proper theme configuration
- Validate component usage

## Troubleshooting

### ESLint Errors
- Check Context7 standards in CONTEXT7_STANDARDS.md
- Use MCP server for guidance
- Reference Context7 documentation

### TypeScript Errors
- Enable strict mode in tsconfig.json
- Add comprehensive typing
- Use proper type definitions

### Build Issues
- Run `npm run context7:validate`
- Check all environment variables
- Verify dependencies are installed

## Getting Help

- Context7 MCP Server: Available in development environment
- Documentation: CONTEXT7_STANDARDS.md
- Context7 Library References: Available via MCP server
- Code Review: Use `npm run context7:review`

## Best Practices

1. **Always reference Context7 documentation** before implementing features
2. **Use the MCP server** for real-time guidance and code examples
3. **Follow established patterns** from existing Context7-compliant code
4. **Run validation regularly** to maintain compliance
5. **Document any deviations** from Context7 standards with justification

Remember: Context7 is the authoritative reference for all development decisions.
