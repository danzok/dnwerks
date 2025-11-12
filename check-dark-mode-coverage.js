#!/usr/bin/env node

/**
 * Dark Mode Coverage Checker
 * 
 * This script scans all page.tsx files and identifies which ones
 * have dark mode classes implemented and which ones need them.
 */

const fs = require('fs');
const path = require('path');

// Function to check if a file contains dark mode classes
function hasDarkMode(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for dark mode patterns
    const darkModePatterns = [
      /dark:bg-[a-zA-Z0-9-]+/,
      /dark:text-[a-zA-Z0-9-]+/,
      /dark:border-[a-zA-Z0-9-]+/,
      /bg-background/,
      /text-foreground/,
      /text-muted-foreground/
    ];
    
    return darkModePatterns.some(pattern => pattern.test(content));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all page.tsx files
function findPages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findPages(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
const appDir = path.join(__dirname, 'src', 'app');
const allPages = findPages(appDir);

console.log('🌙 Dark Mode Coverage Report');
console.log('================================');
console.log('');

let pagesWithDarkMode = [];
let pagesNeedingDarkMode = [];

allPages.forEach(pagePath => {
  const relativePath = path.relative(process.cwd(), pagePath);
  const hasMode = hasDarkMode(pagePath);
  
  if (hasMode) {
    pagesWithDarkMode.push(relativePath);
  } else {
    pagesNeedingDarkMode.push(relativePath);
  }
});

// Report results
console.log(`✅ Pages WITH Dark Mode (${pagesWithDarkMode.length}):`);
pagesWithDarkMode.forEach(page => {
  console.log(`   ✓ ${page}`);
});

console.log('');
console.log(`⚠️  Pages NEEDING Dark Mode (${pagesNeedingDarkMode.length}):`);
pagesNeedingDarkMode.forEach(page => {
  console.log(`   ⚠️  ${page}`);
});

console.log('');
console.log(`📊 Coverage: ${((pagesWithDarkMode.length / allPages.length) * 100).toFixed(1)}%`);
console.log('');

if (pagesNeedingDarkMode.length > 0) {
  console.log('🔧 To add dark mode to a page, add these classes:');
  console.log('');
  console.log('   // Page container');
  console.log('   <div className="min-h-screen bg-gray-50 dark:bg-background">');
  console.log('   ');
  console.log('   // Cards');
  console.log('   <Card className="bg-white dark:bg-card border-gray-200 dark:border-border">');
  console.log('   ');
  console.log('   // Text');
  console.log('   <h1 className="text-gray-900 dark:text-foreground">');
  console.log('   <p className="text-gray-600 dark:text-muted-foreground">');
}