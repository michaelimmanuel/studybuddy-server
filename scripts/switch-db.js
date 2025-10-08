#!/usr/bin/env node

/**
 * Database Environment Switcher
 * Usage: node scripts/switch-db.js [dev|prod]
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

function switchDatabase(environment) {
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (environment === 'dev') {
    // Switch to development
    envContent = envContent.replace(/^NODE_ENV=.*/m, 'NODE_ENV=development');
    console.log('Switched to DEVELOPMENT database');
    console.log('Database: Local PostgreSQL');
  } else if (environment === 'prod') {
    // Switch to production
    envContent = envContent.replace(/^NODE_ENV=.*/m, 'NODE_ENV=production');
    console.log('Switched to PRODUCTION database');
    console.log('Database: Supabase Production');
  } else {
    console.log('Usage: node scripts/switch-db.js [dev|prod]');
    process.exit(1);
  }

  fs.writeFileSync(envPath, envContent);
  console.log('Environment updated in .env file');
  console.log('Remember to restart your server!');
}

const environment = process.argv[2];
switchDatabase(environment);