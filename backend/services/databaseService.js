const db = require('../database/database');

class DatabaseService {
  // User operations
  async getUsers() {
    return await db.query('SELECT id, username, email, role, full_name, department, created_at, is_active FROM users WHERE is_active = 1');
  }

  async getUserById(id) {
    return await db.get('SELECT id, username, email, role, full_name, department, created_at, is_active FROM users WHERE id = ? AND is_active = 1', [id]);
  }

  async getUserByUsername(username) {
    return await db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
  }

  async createUser(userData) {
    const { username, password, email, role, full_name, department } = userData;
    const result = await db.run(
      'INSERT INTO users (username, password, email, role, full_name, department) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, email, role, full_name, department]
    );
    return { id: result.id, username, email, role, full_name, department };
  }

  // Ticket operations
  async getTickets(filters = {}) {
    let sql = 'SELECT t.*, u1.username as requester_name, u2.username as assignee_name FROM tickets t LEFT JOIN users u1 ON t.requester_id = u1.id LEFT JOIN users u2 ON t.assignee_id = u2.id WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND t.status = ?';
      params.push(filters.status);
    }
    if (filters.priority) {
      sql += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    if (filters.requester) {
      sql += ' AND u1.username LIKE ?';
      params.push(`%${filters.requester}%`);
    }

    sql += ' ORDER BY t.created_at DESC';
    return await db.query(sql, params);
  }

  async createTicket(ticketData) {
    const ticketId = db.generateId('TKT');
    const { title, description, priority, category, requester_id, routed_agent, routing_confidence, auto_routed } = ticketData;
    
    const result = await db.run(
      'INSERT INTO tickets (ticket_id, title, description, priority, category, requester_id, routed_agent, routing_confidence, auto_routed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ticketId, title, description, priority, category, requester_id, routed_agent, routing_confidence, auto_routed]
    );
    
    return { id: result.id, ticket_id: ticketId, ...ticketData };
  }

  // Incident operations
  async getIncidents() {
    return await db.query('SELECT i.*, u.username as assignee_name FROM incidents i LEFT JOIN users u ON i.assignee_id = u.id ORDER BY i.created_at DESC');
  }

  async createIncident(incidentData) {
    const incidentId = db.generateId('INC');
    const { title, description, severity, priority, category, assignee_id, impact, urgency } = incidentData;
    
    const result = await db.run(
      'INSERT INTO incidents (incident_id, title, description, severity, priority, category, assignee_id, impact, urgency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [incidentId, title, description, severity, priority, category, assignee_id, impact, urgency]
    );
    
    return { id: result.id, incident_id: incidentId, ...incidentData };
  }

  // Request operations
  async getRequests() {
    return await db.query('SELECT r.*, u1.username as requester_name, u2.username as approver_name FROM requests r LEFT JOIN users u1 ON r.requester_id = u1.id LEFT JOIN users u2 ON r.approver_id = u2.id ORDER BY r.created_at DESC');
  }

  async createRequest(requestData) {
    const requestId = db.generateId('REQ');
    const { title, description, type, priority, requester_id, justification } = requestData;
    
    const result = await db.run(
      'INSERT INTO requests (request_id, title, description, type, priority, requester_id, justification) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [requestId, title, description, type, priority, requester_id, justification]
    );
    
    return { id: result.id, request_id: requestId, ...requestData };
  }

  // Problem operations  
  async getProblems() {
    return await db.query('SELECT p.*, u.username as assignee_name FROM problems p LEFT JOIN users u ON p.assignee_id = u.id ORDER BY p.created_at DESC');
  }

  async createProblem(problemData) {
    const problemId = db.generateId('PRB');
    const { title, description, priority, category, assignee_id, impact } = problemData;
    
    const result = await db.run(
      'INSERT INTO problems (problem_id, title, description, priority, category, assignee_id, impact) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [problemId, title, description, priority, category, assignee_id, impact]
    );
    
    return { id: result.id, problem_id: problemId, ...problemData };
  }

  // Update operations
  async updateTicket(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    await db.run(`UPDATE tickets SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.getTicketById(id);
  }

  async getTicketById(id) {
    return await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
  }
}

module.exports = new DatabaseService();