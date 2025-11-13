# Automated Changelog System

This document explains the automated changelog system implemented for the DNwerks project, which automatically tracks and documents all code changes.

## Overview

The automated changelog system provides:
- **Automatic Change Detection**: Detects any changes in the codebase
- **Smart Categorization**: Automatically categorizes changes (features, bugfixes, refactor, etc.)
- **Proper Formatting**: Follows Keep a Changelog standards
- **Git Integration**: Integrates seamlessly with Git workflow
- **Commit Tracking**: Tracks the last processed commit to avoid duplicates

## Quick Setup

### Install Git Hooks (Recommended)

**For Windows:**
```bash
npm run changelog:setup-windows
```

**For Unix/Linux/macOS:**
```bash
npm run changelog:setup
```

This will install git hooks that automatically update the changelog on every commit.

### Manual Usage

```bash
# Update changelog with new commits
npm run changelog:update

# Show daily summary
npm run changelog:daily

# Show weekly summary
npm run changelog:weekly

# Test daily summary with today's changes
npm run changelog:test-daily

# Test different date formats
npm run changelog:format-test

# Show help
npm run changelog:help

# Manual pre-commit workflow
npm run precommit
```

## Features

### 🔍 Smart Change Detection

The system automatically detects:
- **New Commits**: All commits since last changelog update
- **File Modifications**: Tracks which files were changed
- **Change Types**: Categorizes based on commit messages and file patterns
- **Date & Time**: Captures precise commit timestamps for each change

### 📊 Intelligent Categorization

Changes are automatically categorized into:

| Category | Triggers | Examples |
|----------|----------|----------|
| **Added** | `feat:`, `feature:` | New features, components, functionality |
| **Fixed** | `fix:`, `bugfix:` | Bug fixes, error corrections |
| **Changed** | General changes | Modifications to existing code |
| **Deprecated** | `deprecat:` | Features marked for removal |
| **Removed** | `remove:`, `delete:` | Code deletion, cleanup |
| **Security** | `security:`, `sec:` | Security patches, fixes |
| **Refactored** | `refactor:`, `refact:` | Code restructuring, optimization |
| **Performance** | `perf:`, `performance:` | Performance improvements |
| **Documentation** | `docs:`, `.md` files | Documentation updates |
| **Testing** | `test:`, test files | Test additions, modifications |
| **Dependencies** | `chore:`, `package.json` | Dependency updates |

### 📝 Smart Description Generation

The system generates clean, descriptive entries:
- Removes conventional commit prefixes
- Capitalizes first letter
- Groups files by type for context
- Handles generic messages intelligently

### 📅 Date & Time Integration

Each changelog entry includes precise timestamp information:

```markdown
### Added
- User authentication system [`a1b2c3d`] - 2025-11-13 14:30 (4 files)

### Fixed
- Login timeout issue [`e5f6g7h`] - 2025-11-13 15:45 (2 files)
```

**Features:**
- **Configurable Formats**: Multiple date/time formatting options
- **Chronological Sorting**: Entries sorted by commit date (newest first)
- **Timezone Support**: Local timezone handling
- **Alternative Formats**: ISO, US, EU, compact, and verbose options

### 🏗️ Keep a Changelog Format

Follows industry-standard format with date/time stamps:

```markdown
## [Unreleased]

### Added
- New feature description [`abc1234`] - 2025-11-13 14:30 (3 files)

### Fixed
- Bug fix description [`def5678`] - 2025-11-13 15:20 (1 files)
```

## Configuration

The system is configured via `scripts/changelog-config.json`:

```json
{
  "settings": {
    "autoUpdateOnCommit": true,
    "includeFileCounts": true,
    "categorizeByFileTypes": true,
    "smartDescriptionGeneration": true,
    "trackLastProcessedCommit": true,
    "followKeepAChangelog": true,
    "semanticVersioning": true,
    "includeDateTime": true,
    "sortByDate": true,
    "dateFormat": "yyyy-MM-dd HH:mm",
    "timezone": "local",
    "alternativeFormats": {
      "iso": "yyyy-MM-dd'T'HH:mm:ss",
      "us": "MM/dd/yyyy HH:mm",
      "eu": "dd/MM/yyyy HH:mm",
      "compact": "MM/dd HH:mm",
      "verbose": "EEEE, MMMM d, yyyy 'at' h:mm a"
    }
  },
  "categories": {
    "feat": "Added",
    "fix": "Fixed"
  },
  "fileTypeGroups": {
    "components": ["src/components"],
    "pages": ["src/app"]
  }
}
```

### Date & Time Configuration

**Key Settings:**
- `includeDateTime`: Enable/disable date/time stamps in entries
- `sortByDate`: Sort entries chronologically (newest first)
- `dateFormat`: Primary date format string
- `timezone`: Timezone handling setting
- `alternativeFormats`: Predefined alternative date formats

**Available Date Formats:**
- **Default**: `yyyy-MM-dd HH:mm` (e.g., `2025-11-13 14:30`)
- **ISO**: `yyyy-MM-dd'T'HH:mm:ss` (e.g., `2025-11-13T14:30:00`)
- **US**: `MM/dd/yyyy HH:mm` (e.g., `11/13/2025 14:30`)
- **EU**: `dd/MM/yyyy HH:mm` (e.g., `13/11/2025 14:30`)
- **Compact**: `MM/dd HH:mm` (e.g., `11/13 14:30`)
- **Verbose**: `EEEE, MMMM d, yyyy 'at' h:mm a` (e.g., `Thursday, November 13, 2025 at 2:30 PM`)

## Git Hooks

### Pre-commit Hook
- Automatically runs `npm run changelog:update`
- Stages changelog changes if any were made
- Provides feedback on what was updated

### Post-commit Hook
- Confirms changelog was updated
- Provides helpful information about additional commands

## Usage Examples

### Daily Development Workflow

1. Make your changes as usual
2. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add user authentication system"
   ```
3. The changelog is automatically updated:
   ```markdown
   ### Added
   - User authentication system [`a1b2c3d`] (4 files)
   ```

### Manual Changelog Updates

```bash
# Update changelog with recent changes
npm run changelog:update

# See what was changed today
npm run changelog:daily

# Get weekly summary
npm run changelog:weekly
```

### Conventional Commits (Recommended)

Use conventional commit prefixes for better categorization:

```bash
git commit -m "feat: add SMS campaign scheduling"
git commit -m "fix: resolve authentication timeout issue"
git commit -m "refactor: optimize database queries"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for user service"
```

## File Structure

```
scripts/
├── update-changelog.ts        # Main changelog generator script
├── changelog-config.json      # Configuration file
├── setup-git-hooks.sh         # Git hooks setup (Unix/Linux/macOS)
└── setup-git-hooks.bat        # Git hooks setup (Windows)
```

## Advanced Usage

### Custom Categories

Add custom categories in `changelog-config.json`:

```json
{
  "categories": {
    "hotfix": "Hotfix",
    "breaking": "Breaking Change"
  }
}
```

### Ignore Patterns

Configure files to ignore:

```json
{
  "ignoredPatterns": [
    "*.log",
    "*.tmp",
    "node_modules",
    ".git"
  ]
}
```

### Custom File Groups

Define custom file type groups:

```json
{
  "fileTypeGroups": {
    "api": ["src/app/api"],
    "ui": ["src/components/ui"],
    "styles": [".css", ".scss"]
  }
}
```

## Troubleshooting

### Common Issues

1. **Git hooks not working**
   - Ensure hooks are executable: `chmod +x .git/hooks/*`
   - Check if `.git/hooks` directory exists

2. **No changes detected**
   - Check if there are any unprocessed commits
   - Verify git repository status

3. **Duplicate entries**
   - System tracks last processed commit to prevent duplicates
   - If duplicates occur, check `Last processed commit` line in CHANGELOG.md

### Debug Mode

Run with verbose output:
```bash
tsx scripts/update-changelog.ts --help
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Update Changelog
  run: |
    npm run changelog:update
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git add CHANGELOG.md
    git commit -m "chore: update changelog" || true
    git push
```

### Pre-deployment Hook

```bash
#!/bin/bash
# Pre-deployment changelog update
npm run changelog:update
echo "Changelog updated for deployment"
```

## Best Practices

1. **Use Conventional Commits**: Prefix commits with proper categories
2. **Write Descriptive Messages**: Clear, concise commit messages
3. **Review Changelog**: Periodically review generated entries
4. **Maintain SemVer**: Update semantic version when releasing
5. **Backup Changelog**: Keep changelog in version control

## API Reference

### ChangelogGenerator Class

```typescript
const generator = new ChangelogGenerator();

// Main method - update changelog
await generator.run();

// Generate summaries
await generator.generateSummary('daily');
await generator.generateSummary('weekly');
```

### Change Types Enum

```typescript
enum ChangeType {
  ADDED = 'Added',
  CHANGED = 'Changed',
  DEPRECATED = 'Deprecated',
  REMOVED = 'Removed',
  FIXED = 'Fixed',
  SECURITY = 'Security',
  REFACTOR = 'Refactored',
  DOCUMENTATION = 'Documentation',
  PERFORMANCE = 'Performance',
  TESTING = 'Testing',
  DEPENDENCIES = 'Dependencies'
}
```

## Migration

### From Manual Changelog

1. Run `npm run changelog:update` to process existing commits
2. Review generated entries
3. Install git hooks for automatic updates
4. Update team workflow to use new system

### Integration with Existing Workflow

- No breaking changes to existing workflow
- Can be used alongside manual changelog maintenance
- Gradual adoption possible

---

**For questions or issues, please check the script help:**
```bash
npm run changelog:help
```