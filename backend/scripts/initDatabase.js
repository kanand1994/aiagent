#!/usr/bin/env node

const db = require('../database/database');

console.log('Initializing IT Automation Platform Database...');

// Wait for database to be ready
setTimeout(() => {
  console.log('Database initialization completed!');
  console.log('');
  console.log('Default user accounts created:');
  console.log('- admin/admin123 (IT Administrator)');
  console.log('- ittech/admin123 (IT Technician)');
  console.log('- manager/admin123 (IT Manager)');
  console.log('- security/admin123 (Security Analyst)');
  console.log('- user/admin123 (End User)');
  console.log('');
  console.log('Database is ready for use!');
  
  // Close database connection
  db.close();
  process.exit(0);
}, 2000);