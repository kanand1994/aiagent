const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignee, page = 1, limit = 10 } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignee) filters.requester = assignee;
    
    const tickets = await dbService.getTickets(filters);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = tickets.slice(startIndex, endIndex);
    
    res.json({
      tickets: paginatedTickets,
      total: tickets.length,
      page: parseInt(page),
      totalPages: Math.ceil(tickets.length / limit)
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await dbService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, category, requester, routingInfo } = req.body;
    
    // Get requester user ID (for now, use username lookup)
    const requesterUser = await dbService.getUserByUsername(requester);
    const requester_id = requesterUser ? requesterUser.id : null;
    
    const ticketData = {
      title,
      description,
      priority,
      category,
      requester_id,
      routed_agent: routingInfo?.recommendedAgent,
      routing_confidence: routingInfo?.confidence,
      auto_routed: routingInfo?.autoRoute || false
    };
    
    const newTicket = await dbService.createTicket(ticketData);
    
    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('ticket-created', newTicket);
    }
    
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const updatedTicket = {
      ...tickets[ticketIndex],
      ...req.body,
      updated: new Date().toISOString()
    };
    
    tickets[ticketIndex] = updatedTicket;
    
    // Emit real-time update
    req.app.get('io').emit('ticket-updated', updatedTicket);
    
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const deletedTicket = tickets.splice(ticketIndex, 1)[0];
    
    // Emit real-time update
    req.app.get('io').emit('ticket-deleted', deletedTicket);
    
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign ticket
router.post('/:id/assign', async (req, res) => {
  try {
    const { assignee } = req.body;
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    tickets[ticketIndex].assignee = assignee;
    tickets[ticketIndex].status = 'In Progress';
    tickets[ticketIndex].updated = new Date().toISOString();
    
    // Emit real-time update
    req.app.get('io').emit('ticket-assigned', tickets[ticketIndex]);
    
    res.json(tickets[ticketIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find similar tickets
router.post('/similar', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const searchText = `${title} ${description}`.toLowerCase();
    
    // Simple similarity algorithm - in production, use more sophisticated NLP
    const similarTickets = tickets
      .filter(ticket => {
        const ticketText = `${ticket.title} ${ticket.description || ''}`.toLowerCase();
        const commonWords = searchText.split(' ').filter(word => 
          word.length > 3 && ticketText.includes(word)
        );
        return commonWords.length > 0;
      })
      .map(ticket => {
        const ticketText = `${ticket.title} ${ticket.description || ''}`.toLowerCase();
        const searchWords = searchText.split(' ').filter(word => word.length > 3);
        const matchingWords = searchWords.filter(word => ticketText.includes(word));
        const similarity = matchingWords.length / searchWords.length;
        
        return {
          ...ticket,
          similarity: Math.round(similarity * 100) / 100
        };
      })
      .filter(ticket => ticket.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    res.json({ tickets: similarTickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket routing statistics
router.get('/routing-stats', async (req, res) => {
  try {
    const stats = {
      total: tickets.length,
      byAgent: {},
      autoRouted: 0,
      accuracy: 0
    };
    
    tickets.forEach(ticket => {
      const agent = ticket.assignedAgent || 'unassigned';
      stats.byAgent[agent] = (stats.byAgent[agent] || 0) + 1;
      if (ticket.autoRouted) {
        stats.autoRouted++;
      }
    });
    
    stats.accuracy = stats.total > 0 ? stats.autoRouted / stats.total : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;