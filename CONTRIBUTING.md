# Contributing to DNwerks

Thank you for your interest in contributing to DNwerks! This guide will help you get started with contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account
- Code editor (we recommend VS Code)

### Setup Steps

1. **Fork the repository**
   - Click the "Fork" button on the GitHub page
   - Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dnwerks.git
   cd dnwerks
   ```

2. **Set up the upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/dnwerks.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required environment variables (see README.md for details).

5. **Set up the database**
   ```bash
   npm run db:setup
   ```

6. **Start development**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Branch

Before making any changes, create a new branch:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

**Branch naming conventions:**
- `feature/feature-name` for new features
- `fix/fix-name` for bug fixes
- `docs/update-name` for documentation changes
- `refactor/component-name` for refactoring

### 2. Make Your Changes

Follow our coding standards:

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Functional components with hooks
- **Styling**: Use Tailwind CSS classes
- **File naming**: kebab-case for files, PascalCase for components
- **Imports**: Use absolute imports with `@/` prefix

### 3. Run Quality Checks

Before committing, run:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Context7 validation
npm run context7:validate
```

### 4. Commit Your Changes

Use conventional commit messages:

```
type(scope): description

feat(campaigns): add scheduling feature
fix(auth): resolve login validation issue
docs(readme): update installation instructions
refactor(components): optimize template rendering
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no code changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference any related issues
- Include screenshots if applicable
- Describe testing performed

## 🎯 Development Guidelines

### Code Style

#### TypeScript
```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
};

// ❌ Bad - Using 'any'
const user: any = {
  id: '123',
  name: 'John Doe'
};
```

#### React Components
```typescript
// ✅ Good - Functional component with proper typing
interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ children, variant, onClick }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        variant === 'primary' && "bg-blue-500 text-white",
        variant === 'secondary' && "bg-gray-200 text-gray-800"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ Bad - No typing, default exports
export default function Button(props) {
  return <button {...props} />;
}
```

#### File Organization
```
src/
├── components/
│   ├── ui/              # Base UI components
│   ├── features/        # Feature-specific components
│   │   ├── campaigns/
│   │   └── customers/
│   └── layout/          # Layout components
├── hooks/               # Custom hooks
├── lib/                 # Utilities and types
├── app/                 # Next.js App Router
└── styles/              # Global styles
```

### Testing

We use Jest and React Testing Library for testing:

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>);

    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use code splitting for large components
- Implement proper caching strategies

## 🐛 Bug Reports

When filing bug reports, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected vs actual behavior**
4. **Environment details** (OS, browser, Node version)
5. **Screenshots** if applicable
6. **Error messages** from browser console

**Bug Report Template:**

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node Version: [e.g. 18.0.0]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Provide clear description** of the feature
3. **Explain the use case** and why it's valuable
4. **Consider implementation complexity**
5. **Offer to contribute** if possible

**Feature Request Template:**

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How do you envision this working?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information
```

## 📝 Documentation

Help us improve documentation:

- **README.md**: General project information
- **API docs**: For new endpoints or changes
- **Component docs**: For complex components
- **Setup guides**: For new integrations

## 🤝 Code Review Process

### Reviewing Pull Requests

When reviewing PRs:

1. **Check functionality**: Does it work as expected?
2. **Review code quality**: Follows our standards?
3. **Test coverage**: Are tests included?
4. **Documentation**: Is documentation updated?
5. **Performance**: Any performance implications?

### Getting Your PR Reviewed

1. **Self-review** your changes first
2. **Ensure all tests pass**
3. **Update documentation** if needed
4. **Respond to feedback** promptly
5. **Make requested changes** in a timely manner

## 🏷️ Labels and Milestones

We use GitHub labels to organize issues:

- `bug`: Bug reports
- `enhancement`: Feature requests
- `good first issue`: Good for newcomers
- `help wanted`: Needs contributor help
- `documentation`: Documentation issues
- `priority: high`, `priority: medium`, `priority: low`: Issue priority

## 🎉 Recognition

Contributors are recognized in:

- **README.md**: Major contributors list
- **Release notes**: For significant contributions
- **Community highlights**: In our communications

## 📞 Getting Help

If you need help:

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For general questions and ideas
- **Discord**: For real-time chat (coming soon)
- **Email**: support@dnwerks.com

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- **Be respectful** and professional
- **Welcome newcomers** and help them learn
- **Focus on constructive** feedback
- **Avoid harassment** or discriminatory behavior
- **Report issues** to maintainers

Thank you for contributing to DNwerks! 🚀