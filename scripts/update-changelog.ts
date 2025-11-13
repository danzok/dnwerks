#!/usr/bin/env tsx

/**
 * Automated Changelog Generator
 *
 * This script detects changes in the codebase and automatically updates
 * the CHANGELOG.md file with properly formatted entries following
 * the Keep a Changelog standard.
 *
 * Features:
 * - Git change detection and commit analysis
 * - Automatic change categorization (feature, bugfix, refactor, etc.)
 * - File modification tracking
 * - Smart change description generation
 * - Proper changelog formatting
 *
 * Usage:
 * npm run changelog:update
 * npm run changelog:daily    # Daily updates only
 * npm run changelog:weekly    # Weekly summary only
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
  type: ChangeType;
  description: string;
}

interface ChangeEntry {
  type: ChangeType;
  description: string;
  hash: string;
  files: string[];
  date: Date;
}

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

interface ChangelogConfig {
  version: string;
  project: string;
  description: string;
  settings: {
    autoUpdateOnCommit: boolean;
    includeFileCounts: boolean;
    categorizeByFileTypes: boolean;
    smartDescriptionGeneration: boolean;
    trackLastProcessedCommit: boolean;
    followKeepAChangelog: boolean;
    semanticVersioning: boolean;
    includeDateTime: boolean;
    sortByDate: boolean;
    dateFormat: string;
    timezone: string;
  };
  categories: { [key: string]: string };
  fileTypeGroups: { [key: string]: string[] };
  ignoredPatterns: string[];
  customDescriptions: { [key: string]: string };
}

class ChangelogGenerator {
  private projectRoot: string;
  private changelogPath: string;
  private configPath: string;
  private lastChangelogHash: string | null = null;
  private config: ChangelogConfig;

  constructor() {
    this.projectRoot = process.cwd();
    this.changelogPath = join(this.projectRoot, 'CHANGELOG.md');
    this.configPath = join(this.projectRoot, 'scripts', 'changelog-config.json');
    this.config = this.loadConfig();
    this.loadLastChangelogHash();
  }

  /**
   * Load configuration from JSON file
   */
  private loadConfig(): ChangelogConfig {
    try {
      if (existsSync(this.configPath)) {
        const configContent = readFileSync(this.configPath, 'utf8');
        return JSON.parse(configContent);
      }
    } catch (error) {
      console.warn('Could not load changelog config, using defaults:', error);
    }

    // Default configuration
    return {
      version: "1.0.0",
      project: "DNwerks SMS Campaign Management Platform",
      description: "Automated changelog configuration",
      settings: {
        autoUpdateOnCommit: true,
        includeFileCounts: true,
        categorizeByFileTypes: true,
        smartDescriptionGeneration: true,
        trackLastProcessedCommit: true,
        followKeepAChangelog: true,
        semanticVersioning: true,
        includeDateTime: true,
        sortByDate: true,
        dateFormat: "yyyy-MM-dd HH:mm",
        timezone: "local"
      },
      categories: {
        feat: "Added",
        feature: "Added",
        fix: "Fixed",
        bugfix: "Fixed",
        refactor: "Refactored",
        refact: "Refactored",
        docs: "Documentation",
        documentation: "Documentation",
        test: "Testing",
        testing: "Testing",
        perf: "Performance",
        performance: "Performance",
        security: "Security",
        sec: "Security",
        deprecat: "Deprecated",
        remove: "Removed",
        delete: "Removed",
        chore: "Changed",
        style: "Changed",
        build: "Dependencies",
        ci: "Dependencies"
      },
      fileTypeGroups: {
        components: ["src/components"],
        pages: ["src/app"],
        hooks: ["src/hooks"],
        utilities: ["src/lib"],
        tests: ["test", "spec", "__tests__"],
        docs: [".md", "docs/"],
        dependencies: ["package.json", "package-lock.json", "yarn.lock"]
      },
      ignoredPatterns: [
        "*.log",
        "*.tmp",
        "node_modules",
        ".git",
        "dist",
        "build",
        ".next"
      ],
      customDescriptions: {
        "package.json": "Update project dependencies",
        "README.md": "Update project documentation",
        "CHANGELOG.md": "Update changelog documentation"
      }
    };
  }

  /**
   * Load the hash of the last commit that was added to the changelog
   */
  private loadLastChangelogHash(): void {
    try {
      if (existsSync(this.changelogPath)) {
        const content = readFileSync(this.changelogPath, 'utf8');
        const hashMatch = content.match(/Last processed commit: `([a-f0-9]+)`/);
        if (hashMatch) {
          this.lastChangelogHash = hashMatch[1];
        }
      }
    } catch (error) {
      console.warn('Could not load last changelog hash:', error);
    }
  }

  /**
   * Get all commits since the last changelog update
   */
  private getNewCommits(): GitCommit[] {
    try {
      const range = this.lastChangelogHash
        ? `${this.lastChangelogHash}..HEAD`
        : 'HEAD';

      const gitLog = execSync(
        `git log ${range} --pretty=format:"%H|%s|%an|%ad" --date=iso --name-only`,
        { encoding: 'utf8', cwd: this.projectRoot }
      ).trim();

      if (!gitLog) return [];

      const commits: GitCommit[] = [];
      const lines = gitLog.split('\n');
      let currentCommit: Partial<GitCommit> = {};

      for (const line of lines) {
        if (line.includes('|')) {
          // Commit header line
          if (currentCommit.hash) {
            commits.push(this.processCommit(currentCommit as GitCommit));
          }

          const [hash, message, author, date] = line.split('|');
          currentCommit = {
            hash,
            message,
            author,
            date: new Date(date),
            files: []
          };
        } else if (line.trim()) {
          // File line
          currentCommit.files!.push(line.trim());
        }
      }

      // Add the last commit
      if (currentCommit.hash) {
        commits.push(this.processCommit(currentCommit as GitCommit));
      }

      return commits;
    } catch (error) {
      console.error('Error getting git commits:', error);
      return [];
    }
  }

  /**
   * Process a commit and categorize the change type
   */
  private processCommit(commit: GitCommit): GitCommit {
    const { message, files } = commit;

    // Determine change type based on commit message and files
    commit.type = this.categorizeChange(message, files);
    commit.description = this.generateDescription(message, files);

    return commit;
  }

  /**
   * Categorize the type of change based on message and files
   */
  private categorizeChange(message: string, files: string[]): ChangeType {
    const msg = message.toLowerCase();
    const fileTypes = new Set(files.map(f => this.getFileType(f)));

    // Check message prefixes using config categories
    for (const [prefix, category] of Object.entries(this.config.categories)) {
      if (msg.startsWith(prefix)) {
        return this.mapConfigCategoryToChangeType(category);
      }
    }

    // Check for dependency updates
    if (msg.includes('depend') || msg.includes('package') || fileTypes.has('package.json')) {
      return ChangeType.DEPENDENCIES;
    }

    // Check file patterns
    if (files.some(f => f.includes('README') || f.includes('CHANGELOG') || f.includes('docs'))) {
      return ChangeType.DOCUMENTATION;
    }

    if (files.some(f => f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__'))) {
      return ChangeType.TESTING;
    }

    // Default to changed for general modifications
    return ChangeType.CHANGED;
  }

  /**
   * Map config category string to ChangeType enum
   */
  private mapConfigCategoryToChangeType(category: string): ChangeType {
    const categoryMap: { [key: string]: ChangeType } = {
      'Added': ChangeType.ADDED,
      'Changed': ChangeType.CHANGED,
      'Deprecated': ChangeType.DEPRECATED,
      'Removed': ChangeType.REMOVED,
      'Fixed': ChangeType.FIXED,
      'Security': ChangeType.SECURITY,
      'Refactored': ChangeType.REFACTOR,
      'Performance': ChangeType.PERFORMANCE,
      'Documentation': ChangeType.DOCUMENTATION,
      'Testing': ChangeType.TESTING,
      'Dependencies': ChangeType.DEPENDENCIES
    };

    return categoryMap[category] || ChangeType.CHANGED;
  }

  /**
   * Get the type of file for categorization
   */
  private getFileType(filePath: string): string {
    if (filePath.includes('src/')) return 'source';
    if (filePath.includes('test')) return 'test';
    if (filePath.includes('docs')) return 'docs';
    if (filePath === 'package.json') return 'package.json';
    if (filePath.endsWith('.md')) return 'markdown';
    return 'other';
  }

  /**
   * Generate a clean description from the commit message
   */
  private generateDescription(message: string, files: string[]): string {
    // Remove conventional commit prefixes
    let description = message
      .replace(/^(feat|fix|refactor|docs|test|perf|security|chore|style|build|ci|revert)(\(.+\))?\s*:\s*/i, '')
      .replace(/^\[.+\]\s*/, '') // Remove bracketed tags
      .replace(/^([A-Z]+)\s*-\s*/, '') // Remove tool prefixes
      .trim();

    // Capitalize first letter
    if (description.length > 0) {
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }

    // If description is empty or too generic, generate one from files
    if (!description || description.length < 5) {
      if (files.length === 1) {
        description = `Update ${files[0]}`;
      } else {
        const fileGroups = this.groupFilesByType(files);
        description = `Update ${fileGroups.join(', ')}`;
      }
    }

    return description;
  }

  /**
   * Group files by type for better descriptions
   */
  private groupFilesByType(files: string[]): string[] {
    const groups: { [key: string]: string[] } = {};

    for (const file of files) {
      let group = 'files';

      if (file.includes('src/components')) group = 'components';
      else if (file.includes('src/app')) group = 'pages';
      else if (file.includes('src/hooks')) group = 'hooks';
      else if (file.includes('src/lib')) group = 'utilities';
      else if (file.includes('src/')) group = 'source files';
      else if (file.endsWith('.md')) group = 'documentation';
      else if (file === 'package.json') group = 'dependencies';
      else if (file.includes('test')) group = 'test files';

      if (!groups[group]) groups[group] = [];
      groups[group].push(file);
    }

    return Object.keys(groups);
  }

  /**
   * Generate changelog entries from commits
   */
  private generateChangelogEntries(commits: GitCommit[]): ChangeEntry[] {
    return commits.map(commit => ({
      type: commit.type,
      description: commit.description,
      hash: commit.hash.substring(0, 7), // Short hash
      files: commit.files,
      date: commit.date
    }));
  }

  /**
   * Format changelog entries in Keep a Changelog format
   */
  private formatChangelogEntries(entries: ChangeEntry[]): string {
    // Group by change type
    const groupedEntries: { [key in ChangeType]?: ChangeEntry[] } = {};

    for (const entry of entries) {
      if (!groupedEntries[entry.type]) {
        groupedEntries[entry.type] = [];
      }
      groupedEntries[entry.type]!.push(entry);
    }

    let output = '';

    // Order sections according to Keep a Changelog
    const typeOrder: ChangeType[] = [
      ChangeType.ADDED,
      ChangeType.CHANGED,
      ChangeType.DEPRECATED,
      ChangeType.REMOVED,
      ChangeType.FIXED,
      ChangeType.SECURITY,
      ChangeType.REFACTOR,
      ChangeType.PERFORMANCE,
      ChangeType.DOCUMENTATION,
      ChangeType.TESTING,
      ChangeType.DEPENDENCIES
    ];

    for (const type of typeOrder) {
      const typeEntries = groupedEntries[type];
      if (!typeEntries || typeEntries.length === 0) continue;

      output += `\n### ${type}\n\n`;

      // Sort entries if enabled in config
      const sortedEntries = this.config.settings.sortByDate
        ? typeEntries.sort((a, b) => b.date.getTime() - a.date.getTime())
        : typeEntries;

      for (const entry of sortedEntries) {
        const filesRef = this.config.settings.includeFileCounts && entry.files.length > 0
          ? ` (${entry.files.length} files)`
          : '';

        let line = `- ${entry.description} [\`${entry.hash}\`]`;

        // Add date/time if enabled
        if (this.config.settings.includeDateTime) {
          const formattedDate = format(entry.date, this.config.settings.dateFormat);
          line += ` - ${formattedDate}`;
        }

        line += `${filesRef}\n`;
        output += line;
      }
    }

    return output;
  }

  /**
   * Update the CHANGELOG.md file with new entries
   */
  private updateChangelogFile(entries: ChangeEntry[]): void {
    if (entries.length === 0) {
      console.log('No new changes to add to changelog.');
      return;
    }

    const now = new Date();
    const versionDate = format(now, 'yyyy-MM-dd');
    const formattedEntries = this.formatChangelogEntries(entries);

    let changelogContent = '';
    let latestCommit = entries[entries.length - 1].hash;

    try {
      if (existsSync(this.changelogPath)) {
        changelogContent = readFileSync(this.changelogPath, 'utf8');
      }
    } catch (error) {
      console.warn('Could not read existing changelog:', error);
    }

    // Find where to insert new entries (after Unreleased section or at the beginning)
    const unreleasedSection = changelogContent.match(/## \[Unreleased\]/);
    const nextVersionSection = changelogContent.match(/## \[\d+\.\d+\.\d+\]/);

    let insertPosition = 0;
    if (unreleasedSection) {
      // Insert after Unreleased section header
      insertPosition = changelogContent.indexOf(unreleasedSection[0]) + unreleasedSection[0].length;
    } else if (nextVersionSection) {
      // Insert before next version section
      insertPosition = changelogContent.indexOf(nextVersionSection[0]);
    } else {
      // No changelog exists, create new one
      changelogContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
    }

    // Create the new entry
    const newEntry = `\n## [Unreleased]\n\n*Last processed commit: \`${latestCommit}\`*${formattedEntries}\n`;

    // Insert the new entry
    const before = changelogContent.substring(0, insertPosition);
    const after = changelogContent.substring(insertPosition);

    const updatedContent = before + newEntry + after;

    // Write the updated changelog
    writeFileSync(this.changelogPath, updatedContent, 'utf8');

    console.log(`✅ Updated CHANGELOG.md with ${entries.length} new entries`);
    console.log(`📝 Last processed commit: ${latestCommit}`);
    console.log(`📅 Entries from: ${format(entries[0].date, 'yyyy-MM-dd HH:mm')} to ${format(now, 'yyyy-MM-dd HH:mm')}`);
    console.log(`⏰ Each entry now includes precise date and time information`);
  }

  /**
   * Main execution method
   */
  public async run(): Promise<void> {
    console.log('🔍 Detecting changes since last changelog update...');

    const commits = this.getNewCommits();

    if (commits.length === 0) {
      console.log('✅ No new changes detected.');
      return;
    }

    console.log(`📋 Found ${commits.length} new commits`);

    const entries = this.generateChangelogEntries(commits);

    // Group commits by type for summary
    const typeCount: { [key in ChangeType]?: number } = {};
    for (const entry of entries) {
      typeCount[entry.type] = (typeCount[entry.type] || 0) + 1;
    }

    console.log('📊 Changes by type:');
    for (const [type, count] of Object.entries(typeCount)) {
      console.log(`   ${type}: ${count}`);
    }

    this.updateChangelogFile(entries);
  }

  /**
   * Generate summary for a specific period (daily/weekly)
   */
  public async generateSummary(period: 'daily' | 'weekly'): Promise<void> {
    const now = new Date();
    let fromDate: Date;

    if (period === 'daily') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      // Weekly - start of the week (Monday)
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - now.getDay() + 1);
      fromDate.setHours(0, 0, 0, 0);
    }

    const commits = this.getCommitsSince(fromDate);

    if (commits.length === 0) {
      console.log(`✅ No changes found for ${period} summary.`);
      return;
    }

    console.log(`📊 Generating ${period} summary...`);

    const entries = this.generateChangelogEntries(commits);
    const summaryDate = format(now, 'yyyy-MM-dd');
    const summaryTitle = period === 'daily' ? `Daily Summary` : `Weekly Summary`;

    let summary = `\n### ${summaryTitle} - ${summaryDate}\n\n`;
    summary += `${commits.length} commits processed:\n\n`;

    // Group by type
    const grouped = entries.reduce((acc, entry) => {
      if (!acc[entry.type]) acc[entry.type] = [];
      acc[entry.type].push(entry);
      return acc;
    }, {} as { [key: string]: ChangeEntry[] });

    for (const [type, typeEntries] of Object.entries(grouped)) {
      summary += `**${type}** (${typeEntries.length}):\n`;
      // Sort entries by date (newest first)
      const sortedEntries = typeEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
      for (const entry of sortedEntries) {
        const formattedDate = format(entry.date, 'yyyy-MM-dd HH:mm');
        summary += `- ${entry.description} [\`${entry.hash}\`] - ${formattedDate}\n`;
      }
      summary += '\n';
    }

    console.log(summary);
  }

  private getCommitsSince(date: Date): GitCommit[] {
    try {
      const since = format(date, 'yyyy-MM-dd HH:mm:ss');
      const gitLog = execSync(
        `git log --since="${since}" --pretty=format:"%H|%s|%an|%ad" --date=iso --name-only`,
        { encoding: 'utf8', cwd: this.projectRoot }
      ).trim();

      if (!gitLog) return [];

      return this.parseGitLog(gitLog);
    } catch (error) {
      console.error('Error getting commits since date:', error);
      return [];
    }
  }

  private parseGitLog(gitLog: string): GitCommit[] {
    const commits: GitCommit[] = [];
    const lines = gitLog.split('\n');
    let currentCommit: Partial<GitCommit> = {};

    for (const line of lines) {
      if (line.includes('|')) {
        if (currentCommit.hash) {
          commits.push(this.processCommit(currentCommit as GitCommit));
        }

        const [hash, message, author, date] = line.split('|');
        currentCommit = {
          hash,
          message,
          author,
          date: new Date(date),
          files: []
        };
      } else if (line.trim()) {
        currentCommit.files!.push(line.trim());
      }
    }

    if (currentCommit.hash) {
      commits.push(this.processCommit(currentCommit as GitCommit));
    }

    return commits;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new ChangelogGenerator();

  if (args.includes('--daily')) {
    await generator.generateSummary('daily');
  } else if (args.includes('--weekly')) {
    await generator.generateSummary('weekly');
  } else if (args.includes('--test-daily')) {
    // Test daily summary with today's changes
    await generator.generateSummary('daily');
  } else if (args.includes('--format-test')) {
    // Test different date formats
    console.log('📅 Testing different date formats:');
    const now = new Date();
    const config = generator['config'];

    console.log(`Default (${config.settings.dateFormat}): ${format(now, config.settings.dateFormat)}`);

    for (const [name, dateFormat] of Object.entries(config.settings.alternativeFormats)) {
      console.log(`${name}: ${format(now, dateFormat)}`);
    }
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Automated Changelog Generator

Usage:
  tsx update-changelog.ts          # Update changelog with new commits
  tsx update-changelog.ts --daily   # Show daily summary
  tsx update-changelog.ts --weekly  # Show weekly summary
  tsx update-changelog.ts --test-daily # Test daily summary with today's changes
  tsx update-changelog.ts --format-test # Test different date formats
  tsx update-changelog.ts --help    # Show this help

Examples:
  npm run changelog:update
  npm run changelog:daily
  npm run changelog:weekly
  tsx scripts/update-changelog.ts --format-test
`);
  } else {
    await generator.run();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ChangelogGenerator, ChangeType };