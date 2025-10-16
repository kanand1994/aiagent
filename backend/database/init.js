const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'it_automation.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

// Create new database
const db = new Database(dbPath);
console.log('Created new database');

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
const statements = schema.split(';').filter(stmt => stmt.trim());

statements.forEach(statement => {
  if (statement.trim()) {
    try {
      db.exec(statement);
    } catch (error) {
      console.error('Error executing statement:', statement.substring(0, 100) + '...');
      console.error(error.message);
    }
  }
});

console.log('Database initialized successfully');
db.close();