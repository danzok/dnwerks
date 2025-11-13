#!/bin/bash

# Git Hooks Setup for Automatic Changelog Updates
# This script sets up git hooks to automatically update the changelog

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "🔧 Setting up git hooks for automatic changelog updates..."

# Ensure git hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Git hooks directory not found. Please run this from a git repository."
    exit 1
fi

# Create pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Pre-commit hook for automatic changelog update
echo "📝 Updating changelog before commit..."

# Run changelog update and stage it
npm run changelog:update

# Stage the changelog changes if any were made
if git diff --quiet CHANGELOG.md; then
    echo "✅ No changelog changes to stage"
else
    echo "📋 Staging changelog updates..."
    git add CHANGELOG.md
fi

echo "✅ Pre-commit hook completed"
EOF

# Create post-commit hook
cat > "$HOOKS_DIR/post-commit" << 'EOF'
#!/bin/bash

# Post-commit hook for additional changelog processing
echo "📊 Commit completed. Changelog has been updated."
echo "💡 Run 'npm run changelog:daily' or 'npm run changelog:weekly' for summaries"
EOF

# Make hooks executable
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/post-commit"

echo "✅ Git hooks installed successfully:"
echo "   📝 Pre-commit: Automatically updates changelog before each commit"
echo "   📊 Post-commit: Provides summary information after commit"
echo ""
echo "🔧 You can now use these commands:"
echo "   npm run changelog:update  - Update changelog manually"
echo "   npm run changelog:daily   - Show daily summary"
echo "   npm run changelog:weekly  - Show weekly summary"
echo "   npm run precommit        - Run changelog update and stage changes"
echo ""
echo "⚡ The changelog will be automatically updated on each commit!"