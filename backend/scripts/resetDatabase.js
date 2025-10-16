#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗑️  Resetting IT Automation Platform Database...');

// Delete the existing database file
const dbPath = path.join(__dirname, '../database/it_automation.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Deleted existing database file');
} else {
  console.log('ℹ️  No existing database file found');
}

// Initialize fresh database
const db = require('../database/database');

// Wait for database to be ready
setTimeout(() => {
  console.log('✅ Fresh database created with empty tables');
  console.log('');
  console.log('Default user accounts created:');
  console.log('- admin/admin123 (IT Administrator)');
  console.log('- ittech/admin123 (IT Technician)');
  console.log('- manager/admin123 (IT Manager)');
  console.log('- security/admin123 (Security Analyst)');
  console.log('- user/admin123 (End User)');
  console.log('');
  console.log('🎯 Database is now completely clean and ready for use!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart the backend server: npm start');
  console.log('2. Clear browser cache and refresh frontend');
  console.log('3. Verify all modules show empty data');
  
  // Close database connection
  db.close();
  process.exit(0);
}, 3000);