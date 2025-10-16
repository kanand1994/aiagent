const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = path.join(__dirname, 'it_automation.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    statements.forEach((statement, index) => {
      this.db.run(statement, (err) => {
        if (err) {
          console.error(`Error executing statement ${index + 1}:`, err.message);
        }
      });
    });

    // Insert default users with hashed passwords
    this.insertDefaultUsers();
  }

  async insertDefaultUsers() {
    const defaultPassword = await bcrypt.hash('admin123', 10);
    
    const users = [
      ['admin', defaultPassword, 'admin@company.com', 'admin', 'System Administrator', 'IT'],
      ['ittech', defaultPassword, 'ittech@company.com', 'ittech', 'IT Technician', 'IT'],
      ['manager', defaultPassword, 'manager@company.com', 'manager', 'IT Manager', 'IT'],
      ['security', defaultPassword, 'security@company.com', 'security', 'Security Analyst', 'Security'],
      ['user', defaultPassword, 'user@company.com', 'user', 'End User', 'General']
    ];

    const insertUser = `INSERT OR IGNORE INTO users (username, password, email, role, full_name, department) VALUES (?, ?, ?, ?, ?, ?)`;
    
    users.forEach(user => {
      this.db.run(insertUser, user, (err) => {
        if (err) {
          console.error('Error inserting user:', err.message);
        }
      });
    });
  }

  // Generic query method
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Generic run method for INSERT, UPDATE, DELETE
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Generate unique ID for entities
  generateId(prefix) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
  }

  // Audit logging
  async logAction(userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
    const sql = `INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    try {
      await this.run(sql, [
        userId, 
        action, 
        entityType, 
        entityId, 
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();