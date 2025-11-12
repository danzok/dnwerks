#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Changelog entry template
const createChangelogEntry = (title, description, status = 'completed', changes = [], impact = {}) => {
  const now = new Date();
  const id = `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title,
    date: now,
    status,
    description,
    changes,
    impact
  };
};

// Main changelog data structure
const changelogFile = path.join(__dirname, '../src/app/docs/page.tsx');

// Read current changelog data
const readCurrentChangelog = () => {
  try {
    const content = fs.readFileSync(changelogFile, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading changelog file:', error.message);
    process.exit(1);
  }
};

// Parse current changelog entries
const parseCurrentEntries = () => {
  const content = readCurrentChangelog();
  
  // Find the changelog data array
  const arrayMatch = content.match(/const changelogData = \[([\s\S]*?)\];/s);
  if (!arrayMatch) {
    console.error('Could not find changelog data array in file');
    process.exit(1);
  }
  
  // Extract the array content
  const arrayContent = arrayMatch[1];
  
  // Parse individual entries
  const entryMatches = arrayContent.match(/\{[\s\S]*?\}/g);
  if (!entryMatches) {
    console.error('Could not find changelog entries in file');
    process.exit(1);
  }
  
  const entries = [];
  for (const match of entryMatches) {
    try {
      // Extract the entry object
      const entryMatch = match.match(/\{[\s\S]*?\}/s);
      if (!entryMatch) {
        continue;
      }
      
      // Parse the entry content
      const entryContent = entryMatch[0];
      const parsedEntry = eval(`(${entryContent})`);
      
      if (parsedEntry && typeof parsedEntry === 'object') {
        entries.push(parsedEntry);
      }
    } catch (error) {
      console.error('Error parsing entry:', error.message);
    }
  }
  
  return entries;
};

// Add new changelog entry
const addChangelogEntry = (title, description, status, changes, impact) => {
  const content = readCurrentChangelog();
  const entries = parseCurrentEntries();
  
  const newEntry = createChangelogEntry(title, description, status, changes, impact);
  
  // Convert entry to string format
  const entryString = `    {
      id: "${newEntry.id}",
      title: "${newEntry.title}",
      date: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
      status: "${newEntry.status}",
      description: "${newEntry.description}",
      changes: [
${newEntry.changes.map(change => `        "${change}"`).join(',\n')}
      ],
      impact: {
${Object.entries(newEntry.impact).map(([key, value]) => `        ${key}: ${value}`).join(',\n')}
      }
    }`;
  
  // Insert new entry at the beginning (after first entry)
  const updatedContent = content.replace(
    /return \[([\s\S]*?)\];/,
    `return [\n${entryString},\n$1];`
  );
  
  // Write back to file
  fs.writeFileSync(changelogFile, updatedContent, 'utf8');
  
  console.log(`✅ Added new changelog entry: "${title}"`);
  console.log(`📅 Entry ID: ${newEntry.id}`);
  console.log(`🕒 Date: ${newEntry.date.toISOString()}`);
};

// Update existing entry
const updateChangelogEntry = (id, updates) => {
  const content = readCurrentChangelog();
  const entries = parseCurrentEntries();
  
  // Find the entry to update
  const entryIndex = entries.findIndex(entry => entry.id === id);
  if (entryIndex === -1) {
    console.error(`Could not find changelog entry with id: ${id}`);
    process.exit(1);
  }
  
  // Update the entry
  let updatedContent = content;
  
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`(id: "${id}")[\\s\\S]*${key}:\\s*["\`']?([^"\`']+)["\`']?`, 'g');
    updatedContent = updatedContent.replace(regex, `$1: ${typeof value === 'string' ? `"${value}"` : value}`);
  });
  
  fs.writeFileSync(changelogFile, updatedContent, 'utf8');
  console.log(`✅ Updated changelog entry ${id} with:`, updates);
};

// Command line interface
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args.length < 3) {
        console.log('Usage: node update-changelog.js add <title> <description> [status] [changes...] [impact...]');
        console.log('Example: node update-changelog.js add "New Feature" "Implemented user authentication" completed "Added login page" "Enhanced security"');
        process.exit(1);
      }
      
      const title = args[1];
      const description = args[2];
      const status = args[3] || 'completed';
      const changes = args.slice(4, -1).filter(arg => !arg.startsWith('--impact='));
      const impactArgs = args.filter(arg => arg.startsWith('--impact='));
      
      const impact = {};
      impactArgs.forEach(arg => {
        const [key, value] = arg.replace('--impact=', '').split('=');
        impact[key] = value;
      });
      
      addChangelogEntry(title, description, status, changes, impact);
      break;
      
    case 'update':
      if (args.length < 3) {
        console.log('Usage: node update-changelog.js update <id> <key=value> [key=value...]');
        console.log('Example: node update-changelog.js update phase-1 status=completed impact.codeReduction=50');
        process.exit(1);
      }
      
      const id = args[1];
      const updates = {};
      
      args.slice(2).forEach(arg => {
        if (arg.includes('=')) {
          const [key, value] = arg.split('=');
          updates[key] = value;
        }
      });
      
      updateChangelogEntry(id, updates);
      break;
      
    case 'list':
      const content = readCurrentChangelog();
      const entries = parseCurrentEntries();
      
      console.log('📋 Current Changelog Entries:');
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.title} (${entry.id})`);
        console.log(`   Date: ${entry.date.toLocaleDateString()}`);
        console.log(`   Status: ${entry.status}`);
        if (entry.changes.length > 0) {
          console.log(`   Changes: ${entry.changes.length} items`);
        }
        if (Object.keys(entry.impact).length > 0) {
          console.log(`   Impact: ${Object.keys(entry.impact).length} metrics`);
        }
      });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  add <title> <description> [status] [changes...] [--impact=key=value...]');
      console.log('  update <id> <key=value> [key=value...]');
      console.log('  list');
      console.log('');
      console.log('Examples:');
      console.log('  node update-changelog.js add "Bug Fix" "Fixed critical memory leak" completed "Updated dependencies"');
      console.log('  node update-changelog.js add "New Feature" "Added dark mode support" completed "Enhanced UI" --impact.userSatisfaction=95 --impact.performance=30');
      console.log('  node update-changelog.js update phase-1 status=completed impact.codeReduction=50');
      process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  addChangelogEntry,
  updateChangelogEntry,
  readCurrentChangelog,
  parseCurrentEntries
};