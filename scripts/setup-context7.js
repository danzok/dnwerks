#!/usr/bin/env node

/**
 * Context7 Development Environment Setup Script
 *
 * This script configures the development environment to use Context7
 * as the reference standard for all development activities.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Context7 Development Environment...\n');

// Check if required files exist
const requiredFiles = [
  'CONTEXT7_STANDARDS.md',
  '.context7rc.json',
  'eslint.config.mjs',
  'components.json'
];

console.log('📋 Verifying Context7 configuration files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    process.exit(1);
  }
});

// Create .env.local if it doesn't exist
const envFile = '.env.local';
if (!fs.existsSync(envFile)) {
  console.log('\n📝 Creating .env.local file...');
  const envContent = `# Context7 Development Environment Configuration
CONTEXT7_ENABLED=true
CONTEXT7_REFERENCE_MODE=true
CONTEXT7_MCP_INTEGRATION=true

# Supabase Configuration (Context7 Standard)
# Copy from your Supabase project settings
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database Configuration (Context7 Standard)
# DATABASE_URL=your-database-connection-string
# DIRECT_URL=your-direct-database-connection-string
`;

  fs.writeFileSync(envFile, envContent);
  console.log('✅ .env.local created');
} else {
  console.log('✅ .env.local already exists');
}

// Update package.json scripts if needed
console.log('\n📦 Verifying package.json scripts...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const context7Scripts = [
  'context7:validate',
  'context7:review',
  'context7:migrate',
  'context7:docs',
  'type-check',
  'prepare'
];

let missingScripts = [];
context7Scripts.forEach(script => {
  if (!packageJson.scripts[script]) {
    missingScripts.push(script);
  }
});

if (missingScripts.length > 0) {
  console.log(`❌ Missing scripts: ${missingScripts.join(', ')}`);
  console.log('Please run npm install to update package.json scripts');
} else {
  console.log('✅ All Context7 scripts are present');
}

// Check TypeScript configuration
console.log('\n🔍 Checking TypeScript configuration...');
const tsConfigPath = 'tsconfig.json';
if (fs.existsSync(tsConfigPath)) {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

  if (tsConfig.compilerOptions?.strict === true) {
    console.log('✅ TypeScript strict mode enabled');
  } else {
    console.log('⚠️  TypeScript strict mode not enabled - Consider enabling for Context7 compliance');
  }

  if (tsConfig.compilerOptions?.noImplicitAny === true) {
    console.log('✅ TypeScript noImplicitAny enabled');
  } else {
    console.log('⚠️  TypeScript noImplicitAny not enabled - Consider enabling for Context7 compliance');
  }
} else {
  console.log('❌ tsconfig.json not found');
}

// Create development guide
console.log('\n📚 Creating development guide...');
const devGuideContent = `# Context7 Development Guide

## Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   - Copy your Supabase configuration to \`.env.local\`
   - Ensure all required environment variables are set

3. **Run Context7 validation**:
   \`\`\`bash
   npm run context7:validate
   \`\`\`

4. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## Development Workflow

### Before Making Changes
1. Run \`npm run context7:validate\` to ensure compliance
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
1. Run \`npm run context7:review\`
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
- Run \`npm run context7:validate\`
- Check all environment variables
- Verify dependencies are installed

## Getting Help

- Context7 MCP Server: Available in development environment
- Documentation: CONTEXT7_STANDARDS.md
- Context7 Library References: Available via MCP server
- Code Review: Use \`npm run context7:review\`

## Best Practices

1. **Always reference Context7 documentation** before implementing features
2. **Use the MCP server** for real-time guidance and code examples
3. **Follow established patterns** from existing Context7-compliant code
4. **Run validation regularly** to maintain compliance
5. **Document any deviations** from Context7 standards with justification

Remember: Context7 is the authoritative reference for all development decisions.
`;

fs.writeFileSync('CONTEXT7_DEVELOPMENT_GUIDE.md', devGuideContent);
console.log('✅ Development guide created');

console.log('\n🎉 Context7 Development Environment Setup Complete!');
console.log('\n📖 Next steps:');
console.log('1. Review CONTEXT7_STANDARDS.md');
console.log('2. Read CONTEXT7_DEVELOPMENT_GUIDE.md');
console.log('3. Configure your environment variables in .env.local');
console.log('4. Run npm run context7:validate');
console.log('5. Start development with npm run dev');
console.log('\n🔗 Context7 MCP server is available for real-time guidance!');