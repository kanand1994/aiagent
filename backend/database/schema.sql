-- IT Automation Platform Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    full_name VARCHAR(100),
    department VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open',
    priority VARCHAR(20) DEFAULT 'Medium',
    category VARCHAR(50),
    requester_id INTEGER,
    assignee_id INTEGER,
    routed_agent VARCHAR(50),
    routing_confidence DECIMAL(3,2),
    auto_routed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open',
    severity VARCHAR(20) DEFAULT 'Medium',
    priority VARCHAR(10) DEFAULT 'P3',
    category VARCHAR(50),
    assignee_id INTEGER,
    impact TEXT,
    urgency VARCHAR(20),
    resolution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending Approval',
    priority VARCHAR(20) DEFAULT 'Medium',
    requester_id INTEGER,
    approver_id INTEGER,
    justification TEXT,
    estimated_completion DATE,
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open',
    priority VARCHAR(20) DEFAULT 'Medium',
    category VARCHAR(50),
    assignee_id INTEGER,
    root_cause TEXT,
    workaround TEXT,
    impact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Problem-Incident relationships
CREATE TABLE IF NOT EXISTS problem_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER,
    incident_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id),
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Knowledge Base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags TEXT,
    author_id INTEGER,
    views INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (username, password, email, role, full_name, department) VALUES 
('admin', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'admin@company.com', 'admin', 'System Administrator', 'IT'),
('ittech', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'ittech@company.com', 'ittech', 'IT Technician', 'IT'),
('manager', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'manager@company.com', 'manager', 'IT Manager', 'IT'),
('security', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'security@company.com', 'security', 'Security Analyst', 'Security'),
('user', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'user@company.com', 'user', 'End User', 'General');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_requester ON tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

-- Change Management Tables
CREATE TABLE IF NOT EXISTS changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    description TEXT NOT NULL,
    business_justification TEXT NOT NULL,
    rollback_plan TEXT NOT NULL,
    scheduled_date TEXT,
    status TEXT DEFAULT 'pending',
    requested_by INTEGER,
    approved_at TEXT,
    rejected_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (requested_by) REFERENCES users (id)
);

-- Asset Management Tables
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    serial_number TEXT UNIQUE,
    location TEXT,
    owner TEXT,
    status TEXT DEFAULT 'active',
    ip_address TEXT,
    mac_address TEXT,
    operating_system TEXT,
    os_version TEXT,
    cpu TEXT,
    memory TEXT,
    storage TEXT,
    compliance_score INTEGER DEFAULT 0,
    last_scan TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Software Request Tables
CREATE TABLE IF NOT EXISTS software_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_name TEXT NOT NULL,
    version TEXT,
    target_machine TEXT NOT NULL,
    justification TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    requested_by INTEGER,
    approved_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (requested_by) REFERENCES users (id)
);

-- Virtual Machine Tables
CREATE TABLE IF NOT EXISTS virtual_machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    environment TEXT NOT NULL,
    cpu INTEGER NOT NULL,
    memory INTEGER NOT NULL,
    storage INTEGER NOT NULL,
    purpose TEXT,
    ip_address TEXT,
    status TEXT DEFAULT 'provisioning',
    cpu_usage INTEGER DEFAULT 0,
    memory_usage INTEGER DEFAULT 0,
    disk_usage INTEGER DEFAULT 0,
    requested_by INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (requested_by) REFERENCES users (id)
);

-- Patch Management Tables
CREATE TABLE IF NOT EXISTS patch_management (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER,
    patch_name TEXT NOT NULL,
    patch_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    scheduled_date TEXT,
    installed_date TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets (id)
);

-- User Access Management Tables
CREATE TABLE IF NOT EXISTS access_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    resource_type TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    access_level TEXT NOT NULL,
    justification TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    requested_by INTEGER,
    approved_by INTEGER,
    approved_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (requested_by) REFERENCES users (id),
    FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- OS Management Tables
CREATE TABLE IF NOT EXISTS os_deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER,
    os_name TEXT NOT NULL,
    os_version TEXT NOT NULL,
    deployment_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    scheduled_date TEXT,
    completed_date TEXT,
    requested_by INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets (id),
    FOREIGN KEY (requested_by) REFERENCES users (id)
);

-- Insert sample data for changes
INSERT OR IGNORE INTO changes (id, title, type, risk_level, description, business_justification, rollback_plan, status, requested_by, created_at) VALUES
(1, 'Upgrade Database Server', 'major', 'high', 'Upgrade production database from MySQL 5.7 to 8.0', 'Improved performance and security features', 'Restore from backup and revert configuration', 'approved', 1, '2024-01-15 10:00:00'),
(2, 'Install Security Patch', 'standard', 'medium', 'Install latest Windows security updates', 'Address critical security vulnerabilities', 'Uninstall patch if issues occur', 'completed', 2, '2024-01-14 14:30:00'),
(3, 'Network Configuration Change', 'normal', 'low', 'Update firewall rules for new application', 'Enable access for new business application', 'Revert firewall rules to previous state', 'pending', 1, '2024-01-16 09:15:00');

-- Insert sample data for assets
INSERT OR IGNORE INTO assets (id, name, type, serial_number, location, owner, status, ip_address, operating_system, compliance_score, created_at, last_updated) VALUES
(1, 'WS-001', 'workstation', 'WS001SN', 'Office Floor 1', 'John Doe', 'active', '192.168.1.101', 'Windows 11', 92, '2024-01-10 08:00:00', '2024-01-16 10:00:00'),
(2, 'SRV-DB-01', 'server', 'SRV001SN', 'Data Center Rack A1', 'IT Team', 'active', '10.0.1.10', 'Ubuntu 22.04', 88, '2024-01-05 12:00:00', '2024-01-16 02:00:00'),
(3, 'LAP-002', 'laptop', 'LAP002SN', 'Remote', 'Jane Smith', 'active', '192.168.1.102', 'macOS Sonoma', 95, '2024-01-12 14:00:00', '2024-01-16 08:00:00');

-- Insert sample data for software requests
INSERT OR IGNORE INTO software_requests (id, application_name, version, target_machine, justification, status, requested_by, created_at) VALUES
(1, 'Visual Studio Code', '1.85.0', 'WS-001', 'Need for development work', 'completed', 1, '2024-01-15 11:00:00'),
(2, 'Adobe Photoshop', '2024', 'WS-002', 'Required for marketing materials', 'pending', 2, '2024-01-16 09:30:00'),
(3, 'Docker Desktop', '4.26.0', 'LAP-002', 'Container development and testing', 'approved', 1, '2024-01-16 10:15:00');

-- Insert sample data for virtual machines
INSERT OR IGNORE INTO virtual_machines (id, name, template, environment, cpu, memory, storage, ip_address, status, requested_by, created_at) VALUES
(1, 'DEV-WEB-01', 'Ubuntu 22.04 LTS', 'development', 2, 4, 50, '192.168.100.10', 'running', 1, '2024-01-14 16:00:00'),
(2, 'TEST-DB-01', 'Windows Server 2022', 'testing', 4, 8, 100, '192.168.100.11', 'stopped', 2, '2024-01-15 10:30:00'),
(3, 'STAGE-APP-01', 'CentOS 8', 'staging', 2, 8, 75, '192.168.100.12', 'running', 1, '2024-01-16 08:45:00');