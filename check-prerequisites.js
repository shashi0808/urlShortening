#!/usr/bin/env node

/**
 * Check if all prerequisites are installed
 * Run this before setting up the project
 */

const { execSync } = require('child_process');

function checkCommand(command, name, installUrl) {
  try {
    const version = execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    console.log(`✅ ${name}: ${version}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Not installed`);
    console.log(`   Install from: ${installUrl}\n`);
    return false;
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking Prerequisites...\n');

  let allGood = true;

  // Check Node.js
  allGood &= checkCommand('node --version', 'Node.js', 'https://nodejs.org/');

  // Check npm
  allGood &= checkCommand('npm --version', 'npm', 'Comes with Node.js');

  // Check PostgreSQL
  allGood &= checkCommand('psql --version', 'PostgreSQL', 'https://www.postgresql.org/download/');

  // Check Git (optional but recommended)
  checkCommand('git --version', 'Git', 'https://git-scm.com/');

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('🎉 All prerequisites are installed!');
    console.log('\nNext steps:');
    console.log('1. npm run install:all');
    console.log('2. cd server && cp .env.example .env');
    console.log('3. Edit .env with your database URL');
    console.log('4. npm run dev');
  } else {
    console.log('⚠️  Please install missing prerequisites first.');
    console.log('\nRequired:');
    console.log('- Node.js (v16 or higher)');
    console.log('- PostgreSQL');
    console.log('\nOptional:');
    console.log('- Git (for version control)');
  }
}

if (require.main === module) {
  checkPrerequisites();
}

module.exports = { checkPrerequisites };