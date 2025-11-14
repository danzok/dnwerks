#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createInterface } = require('readline');
const chalk = require('chalk');

class PromptCLI {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config.json');
    this.config = this.loadConfig();
    this.promptsDir = path.join(__dirname, '..');
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error(chalk.red('Error loading configuration:'), error.message);
      process.exit(1);
    }
  }

  async showMenu() {
    console.log(chalk.blue.bold('\n🎯 DNwerks Prompt System'));
    console.log(chalk.gray('─'.repeat(40)));

    const categories = Object.keys(this.config.categories);

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categoryInfo = this.config.categories[category];
      console.log(chalk.cyan(`${i + 1}. ${categoryInfo.name}`));
      console.log(chalk.gray(`   ${categoryInfo.description}`));
      console.log(chalk.gray(`   Files: ${categoryInfo.prompts.join(', ')}`));
      console.log();
    }

    console.log(chalk.cyan(`${categories.length + 1}. Search prompts`));
    console.log(chalk.cyan(`${categories.length + 2}. List all prompts`));
    console.log(chalk.cyan(`${categories.length + 3}. Help`));
    console.log(chalk.cyan('0. Exit'));
    console.log();

    const answer = await this.question(chalk.yellow('Select an option: '));
    return answer.trim();
  }

  async showCategoryMenu(categoryKey) {
    const category = this.config.categories[categoryKey];
    console.log(chalk.blue.bold(`\n📁 ${category.name}`));
    console.log(chalk.gray('─'.repeat(40)));

    for (let i = 0; i < category.prompts.length; i++) {
      const promptFile = category.prompts[i];
      console.log(chalk.cyan(`${i + 1}. ${promptFile}`));
    }

    console.log(chalk.cyan('0. Back to main menu'));
    console.log();

    const answer = await this.question(chalk.yellow('Select a prompt file: '));
    return answer.trim();
  }

  async showPromptContent(categoryKey, promptIndex) {
    const category = this.config.categories[categoryKey];
    const promptFile = category.prompts[promptIndex];
    const filePath = path.join(this.promptsDir, categoryKey, promptFile);

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      console.log(chalk.blue.bold(`\n📄 ${promptFile}`));
      console.log(chalk.gray('─'.repeat(40)));

      const lines = content.split('\n');
      let lineNumber = 1;

      for (const line of lines) {
        const paddedNumber = lineNumber.toString().padStart(3, ' ');

        if (line.startsWith('```')) {
          console.log(chalk.green(`${paddedNumber}. ${line}`));
        } else if (line.startsWith('--')) {
          console.log(chalk.cyan(`${paddedNumber}. ${line}`));
        } else if (line.startsWith('#')) {
          console.log(chalk.magenta.bold(`${paddedNumber}. ${line}`));
        } else if (line.trim() === '') {
          console.log(chalk.gray(`${paddedNumber}.`));
        } else {
          console.log(`${paddedNumber}. ${line}`);
        }

        lineNumber++;
      }

      console.log(chalk.gray('\n' + '─'.repeat(40)));

      await this.question(chalk.yellow('\nPress Enter to continue...'));
    } catch (error) {
      console.error(chalk.red(`Error reading ${promptFile}:`), error.message);
      await this.question(chalk.yellow('\nPress Enter to continue...'));
    }
  }

  async searchPrompts() {
    const searchTerm = await this.question(chalk.yellow('Enter search term: '));
    console.log();

    const results = [];

    for (const [categoryKey, category] of Object.entries(this.config.categories)) {
      for (const promptFile of category.prompts) {
        const filePath = path.join(this.promptsDir, categoryKey, promptFile);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push({
                category: category.name,
                file: promptFile,
                line: i + 1,
                content: lines[i].trim()
              });
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    if (results.length === 0) {
      console.log(chalk.yellow(`No results found for "${searchTerm}"`));
    } else {
      console.log(chalk.blue.bold(`🔍 Search Results for "${searchTerm}"`));
      console.log(chalk.gray('─'.repeat(50)));

      results.forEach((result, index) => {
        console.log(chalk.cyan(`${index + 1}. ${chalk.bold(result.category)} / ${result.file}`));
        console.log(chalk.gray(`   Line ${result.line}: ${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}`));
        console.log();
      });
    }

    await this.question(chalk.yellow('\nPress Enter to continue...'));
  }

  async listAllPrompts() {
    console.log(chalk.blue.bold('\n📋 All Available Prompts'));
    console.log(chalk.gray('─'.repeat(50)));

    for (const [categoryKey, category] of Object.entries(this.config.categories)) {
      console.log(chalk.magenta.bold(`\n${category.name}:`));
      console.log(chalk.gray(category.description));

      for (const promptFile of category.prompts) {
        const filePath = path.join(this.promptsDir, categoryKey, promptFile);

        try {
          const stats = fs.statSync(filePath);
          const fileSize = (stats.size / 1024).toFixed(1);
          console.log(chalk.cyan(`  • ${promptFile}`) + chalk.gray(` (${fileSize} KB)`));
        } catch (error) {
          console.log(chalk.red(`  • ${promptFile} (file not found)`));
        }
      }
    }

    await this.question(chalk.yellow('\nPress Enter to continue...'));
  }

  showHelp() {
    console.log(chalk.blue.bold('\n❓ Help'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log();
    console.log(chalk.cyan('Usage:'));
    console.log('  npm run prompts              # Interactive menu');
    console.log('  npm run prompts:db           # Show database prompts');
    console.log('  npm run prompts:templates    # Show code templates');
    console.log('  npm run prompts:search <term> # Search prompts');
    console.log();
    console.log(chalk.cyan('Categories:'));

    for (const [key, category] of Object.entries(this.config.categories)) {
      console.log(`  ${chalk.cyan(key.padEnd(12))} ${category.name}`);
    }
    console.log();
    console.log(chalk.cyan('Features:'));
    console.log('  • Browse prompts by category');
    console.log('  • Search prompt content');
    console.log('  • Copy prompts to clipboard (when supported)');
    console.log('  • View line numbers for reference');
    console.log();
  }

  async copyToClipboard(text) {
    try {
      // Try different clipboard methods
      if (process.platform === 'darwin') {
        const { exec } = require('child_process');
        exec(`echo "${text}" | pbcopy`, (error) => {
          if (error) {
            console.log(chalk.yellow('\nCopy to clipboard failed. Prompt displayed above.'));
          } else {
            console.log(chalk.green('\n✅ Copied to clipboard!'));
          }
        });
      } else if (process.platform === 'win32') {
        const { exec } = require('child_process');
        exec(`echo "${text}" | clip`, (error) => {
          if (error) {
            console.log(chalk.yellow('\nCopy to clipboard failed. Prompt displayed above.'));
          } else {
            console.log(chalk.green('\n✅ Copied to clipboard!'));
          }
        });
      } else {
        console.log(chalk.yellow('\nCopy to clipboard not supported on this platform.'));
        console.log(chalk.gray('Prompt displayed above for manual copying.'));
      }
    } catch (error) {
      console.log(chalk.yellow('\nCopy to clipboard not available.'));
      console.log(chalk.gray('Prompt displayed above for manual copying.'));
    }
  }

  question(prompt) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  async handleCommandLineArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      return false; // Show interactive menu
    }

    const command = args[0];

    switch (command) {
      case '--help':
      case '-h':
        this.showHelp();
        return true;

      case 'database':
      case 'db':
        await this.showSpecificCategory('database');
        return true;

      case 'templates':
        await this.showSpecificCategory('templates');
        return true;

      case 'search':
        if (args[1]) {
          this.searchTerm = args[1];
          await this.searchPrompts();
        } else {
          console.error(chalk.red('Please provide a search term'));
          console.log(chalk.cyan('Usage: npm run prompts:search <term>'));
        }
        return true;

      case 'list':
        await this.listAllPrompts();
        return true;

      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.cyan('Use --help for available commands'));
        return true;
    }
  }

  async showSpecificCategory(categoryKey) {
    if (!this.config.categories[categoryKey]) {
      console.error(chalk.red(`Category "${categoryKey}" not found`));
      return;
    }

    const category = this.config.categories[categoryKey];
    console.log(chalk.blue.bold(`\n📁 ${category.name}`));
    console.log(chalk.gray('─'.repeat(40)));

    for (const promptFile of category.prompts) {
      const filePath = path.join(this.promptsDir, categoryKey, promptFile);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim()).length;
        console.log(chalk.cyan(`• ${promptFile}`) + chalk.gray(` (${lines} lines)`));
      } catch (error) {
        console.log(chalk.red(`• ${promptFile} (file not found)`));
      }
    }

    const fileChoice = await this.question(chalk.yellow('\nEnter prompt file name to view (or press Enter to skip): '));

    if (fileChoice.trim()) {
      const promptIndex = category.prompts.findIndex(p => p.includes(fileChoice.trim()));
      if (promptIndex !== -1) {
        await this.showPromptContent(categoryKey, promptIndex);
      } else {
        console.log(chalk.red('File not found'));
      }
    }
  }

  async run() {
    // Handle command line arguments first
    if (await this.handleCommandLineArgs()) {
      return;
    }

    // Interactive mode
    while (true) {
      try {
        const choice = await this.showMenu();

        if (choice === '0') {
          console.log(chalk.green('\n👋 Goodbye!'));
          break;
        }

        const categories = Object.keys(this.config.categories);

        if (choice <= categories.length) {
          // Category selected
          const categoryKey = categories[choice - 1];

          while (true) {
            const promptChoice = await this.showCategoryMenu(categoryKey);

            if (promptChoice === '0') {
              break;
            }

            const promptIndex = parseInt(promptChoice) - 1;
            if (promptIndex >= 0 && promptIndex < this.config.categories[categoryKey].prompts.length) {
              await this.showPromptContent(categoryKey, promptIndex);
            } else {
              console.log(chalk.red('Invalid selection'));
              await this.question(chalk.yellow('Press Enter to continue...'));
            }
          }
        } else if (choice == categories.length + 1) {
          // Search
          await this.searchPrompts();
        } else if (choice == categories.length + 2) {
          // List all
          await this.listAllPrompts();
        } else if (choice == categories.length + 3) {
          // Help
          this.showHelp();
          await this.question(chalk.yellow('\nPress Enter to continue...'));
        } else {
          console.log(chalk.red('Invalid selection'));
          await this.question(chalk.yellow('Press Enter to continue...'));
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        await this.question(chalk.yellow('Press Enter to continue...'));
      }
    }
  }
}

// Run the CLI
if (require.main === module) {
  const cli = new PromptCLI();
  cli.run().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = PromptCLI;