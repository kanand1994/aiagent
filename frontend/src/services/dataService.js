// Data Service for live data management
class DataService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.wsConnection = null;
    this.subscribers = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Test connection to backend
      await this.apiCall('/health');
      this.initialized = true;
      console.log('DataService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DataService:', error);
      throw error;
    }
  }

  // Generic API call method
  async apiCall(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async apiCallLegacy(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // WebSocket connection for real-time updates
  connectWebSocket() {
    if (this.wsConnection) return;

    this.wsConnection = new WebSocket(`ws://localhost:3001/ws`);
    
    this.wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(data.type, data.payload);
    };

    this.wsConnection.onclose = () => {
      setTimeout(() => this.connectWebSocket(), 5000); // Reconnect after 5 seconds
    };
  }

  // Subscribe to real-time updates
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);
  }

  // Unsubscribe from updates
  unsubscribe(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).delete(callback);
    }
  }

  // Notify subscribers of updates
  notifySubscribers(eventType, data) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).forEach(callback => callback(data));
    }
  }

  // Dashboard data
  async getDashboardMetrics() {
    return this.apiCall('/api/dashboard/metrics');
  }

  async getTicketTrends() {
    return this.apiCall('/api/dashboard/ticket-trends');
  }

  async getSystemPerformance() {
    return this.apiCall('/api/dashboard/system-performance');
  }

  async getCriticalAlerts() {
    return this.apiCall('/api/dashboard/critical-alerts');
  }

  // Tickets
  async getTickets(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/tickets?${params}`);
  }

  async createTicket(ticketData) {
    return this.apiCall('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async updateTicket(ticketId, updates) {
    return this.apiCall(`/api/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTicket(ticketId) {
    return this.apiCall(`/api/tickets/${ticketId}`, {
      method: 'DELETE'
    });
  }

  // Incidents
  async getIncidents(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/incidents?${params}`);
  }

  async createIncident(incidentData) {
    return this.apiCall('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  }

  async updateIncident(incidentId, updates) {
    return this.apiCall(`/api/incidents/${incidentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Requests
  async getRequests(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/requests?${params}`);
  }

  async createRequest(requestData) {
    return this.apiCall('/api/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async updateRequest(requestId, updates) {
    return this.apiCall(`/api/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Assets
  async getAssets(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/assets?${params}`);
  }

  async createAsset(assetData) {
    return this.apiCall('/api/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  }

  async updateAsset(assetId, updates) {
    return this.apiCall(`/api/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Users (Admin only)
  async getUsers() {
    return this.apiCall('/api/users');
  }

  async createUser(userData) {
    return this.apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId, updates) {
    return this.apiCall(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(userId) {
    return this.apiCall(`/api/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // VMs
  async getVMs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/vms?${params}`);
  }

  async createVM(vmData) {
    return this.apiCall('/api/vms', {
      method: 'POST',
      body: JSON.stringify(vmData)
    });
  }

  // Patches
  async getPatches(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/patches?${params}`);
  }

  async deployPatch(patchData) {
    return this.apiCall('/api/patches/deploy', {
      method: 'POST',
      body: JSON.stringify(patchData)
    });
  }

  // Knowledge Base
  async searchKnowledgeBase(query, category = null) {
    const params = new URLSearchParams({ query });
    if (category) params.append('category', category);
    return this.apiCall(`/api/knowledge/search?${params}`);
  }

  // AI Chat
  async sendChatMessage(message, agentType = 'auto', context = {}) {
    return this.apiCall('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        user_id: 'current_user',
        session_id: 'dashboard_session',
        preferred_agent: agentType === 'auto' ? null : agentType,
        context
      })
    });
  }

  // Notifications
  async getNotifications(userId) {
    return this.apiCall(`/api/notifications?userId=${userId}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.apiCall(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsAsRead(userId) {
    return this.apiCall(`/api/notifications/mark-all-read?userId=${userId}`, {
      method: 'PATCH'
    });
  }

  async deleteNotification(notificationId) {
    return this.apiCall(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async createNotification(notificationData) {
    return this.apiCall('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  async getNotificationStats(userId) {
    return this.apiCall(`/api/notifications/stats?userId=${userId}`);
  }
}

export default new DataService();