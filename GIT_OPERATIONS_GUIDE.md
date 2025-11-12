# Git Operations Guide for DNwerks Deployment

## 🎯 Current Status
Based on PROJECT_VALIDATION_REPORT.md:
- **Current Branch**: `clean-slate`
- **Remote**: `https://github.com/danzok/dnwerks.git`
- **Status**: Multiple changes not staged for commit

## 📋 Step-by-Step Git Operations

### Step 1: Check Current Git Status
```bash
git status
```
This will show you all the modified, untracked, and staged files.

### Step 2: Add All Changes to Staging
```bash
git add .
```
This will stage all changes for commit, including:
- New files (like DEPLOYMENT_VERIFICATION_PLAN.md)
- Modified files
- Any other changes

### Step 3: Review Staged Changes
```bash
git status
```
Verify that all intended changes are staged (should show green text).

### Step 4: Create Commit
```bash
git commit -m "feat: add deployment verification plan and prepare for production deployment

- Add comprehensive deployment verification plan with testing scripts
- Include database connection tests and API health checks
- Add environment variables validation procedures
- Prepare for Vercel deployment verification"
```

### Step 5: Push to Remote Repository
```bash
git push origin clean-slate
```
This will push your changes to the `clean-slate` branch on GitHub.

### Step 6: Verify Push Success
```bash
git status
```
Should show "Your branch is up to date" message.

## 🔍 Alternative: Push to Main Branch

If you want to deploy from the main branch instead:

### Option A: Merge to Main
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge clean-slate into main
git merge clean-slate

# Push to main
git push origin main
```

### Option B: Push Clean-Slate and Create PR
```bash
# Push clean-slate branch
git push origin clean-slate

# Then create a Pull Request on GitHub:
# https://github.com/danzok/dnwerks/compare/main...clean-slate
```

## 🚨 Common Git Issues & Solutions

### Issue: "Changes not staged for commit"
**Solution**: Use `git add .` to stage all changes

### Issue: "Push rejected" due to remote changes
**Solution**: 
```bash
git pull origin clean-slate
git push origin clean-slate
```

### Issue: "Authentication failed"
**Solution**: Check GitHub credentials or use SSH key

### Issue: "Large file size" error
**Solution**: Check .gitignore to ensure large files aren't committed

## 📊 Pre-Push Checklist

### Files to Verify
- [ ] `.env.local` is NOT committed (should be in .gitignore)
- [ ] `node_modules/` is NOT committed
- [ ] `.next/` build folder is NOT committed
- [ ] All new documentation files are included
- [ ] All code changes are staged

### Commit Message Best Practices
- Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
- Include clear description of changes
- Reference any related issues if applicable

## 🔄 Post-Push Verification

### Check GitHub Repository
1. Visit: https://github.com/danzok/dnwerks
2. Verify your commit appears in the timeline
3. Check that all files are properly uploaded
4. Review the commit diff if needed

### Trigger Vercel Deployment
- If connected to Vercel, deployment should start automatically
- Monitor Vercel dashboard for build progress
- Check build logs if any errors occur

## 📝 Git Commands Reference

### Essential Commands
```bash
# Status and logging
git status                    # Show working tree status
git log --oneline             # Show commit history
git diff                       # Show unstaged changes
git diff --staged              # Show staged changes

# Staging operations
git add .                     # Stage all changes
git add <filename>            # Stage specific file
git reset <filename>           # Unstage file

# Commit operations
git commit -m "message"       # Create commit
git commit --amend            # Modify last commit

# Branch operations
git branch                     # Show current branch
git checkout <branch>          # Switch branch
git checkout -b <new>         # Create new branch

# Remote operations
git push origin <branch>       # Push to remote
git pull origin <branch>       # Pull from remote
git remote -v                  # Show remote URLs
```

### Advanced Commands
```bash
# Clean up
git clean -fd                 # Remove untracked files
git reset --hard HEAD~1       # Reset to previous commit

# Stashing
git stash                      # Stash changes
git stash pop                  # Apply stashed changes

# Tagging
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin --tags
```

## 🔐 Security Considerations

### Never Commit
- API keys and secrets
- Environment variables files
- Database credentials
- Personal information

### Always Verify
- No sensitive data in commit messages
- .gitignore is properly configured
- Repository is set to private if needed

## 📞 Troubleshooting

### If Git Commands Fail
1. Check Git installation: `git --version`
2. Verify repository: `git remote -v`
3. Check permissions: `ls -la .git`
4. Reset if needed: `git reset --hard HEAD`

### If Push Fails
1. Check internet connection
2. Verify GitHub credentials
3. Check repository permissions
4. Try SSH instead of HTTPS

---

**Next Steps**: After completing Git operations, proceed with Vercel deployment verification using the DEPLOYMENT_VERIFICATION_PLAN.md