// Intelligent Ticket Router Service
class TicketRouter {
  constructor() {
    // Define routing rules based on keywords and patterns
    this.routingRules = {
      servicedesk: {
        keywords: ['help', 'support', 'question', 'how to', 'guide', 'tutorial', 'assistance'],
        patterns: [/help.*with/i, /how.*do/i, /need.*help/i, /support.*for/i],
        priority: 1,
        module: '/service-desk',
        agent: 'servicedesk'
      },
      incident: {
        keywords: ['down', 'outage', 'not working', 'broken', 'error', 'failure', 'crash', 'urgent', 'critical', 'emergency'],
        patterns: [/system.*down/i, /not.*working/i, /server.*down/i, /application.*error/i, /network.*issue/i],
        priority: 5,
        module: '/incidents',
        agent: 'incident'
      },
      request: {
        keywords: ['install', 'request', 'need', 'access', 'permission', 'software', 'hardware', 'new'],
        patterns: [/install.*software/i, /need.*access/i, /request.*for/i, /new.*account/i],
        priority: 3,
        module: '/requests',
        agent: 'request'
      },
      problem: {
        keywords: ['recurring', 'pattern', 'multiple', 'frequent', 'root cause', 'analysis', 'investigate'],
        patterns: [/recurring.*issue/i, /multiple.*users/i, /root.*cause/i, /pattern.*of/i],
        priority: 4,
        module: '/problems',
        agent: 'problem'
      },
      change: {
        keywords: ['change', 'update', 'upgrade', 'deployment', 'release', 'maintenance', 'schedule'],
        patterns: [/change.*request/i, /update.*system/i, /schedule.*maintenance/i, /deploy.*new/i],
        priority: 3,
        module: '/changes',
        agent: 'change'
      }
    };

    // Category-specific routing
    this.categoryRouting = {
      'Network': 'incident',
      'Hardware': 'incident',
      'Software': 'request',
      'Access': 'request',
      'Security': 'incident',
      'Email': 'servicedesk',
      'Phone': 'servicedesk',
      'Printer': 'servicedesk'
    };

    // Priority-based routing
    this.priorityRouting = {
      'Critical': 'incident',
      'High': 'incident',
      'Medium': 'request',
      'Low': 'servicedesk'
    };
  }

  // Main routing function
  routeTicket(ticketData) {
    const { title, description, category, priority } = ticketData;
    const text = `${title} ${description}`.toLowerCase();
    
    // Calculate scores for each routing option
    const scores = {};
    
    Object.entries(this.routingRules).forEach(([key, rule]) => {
      scores[key] = this.calculateScore(text, rule);
    });

    // Apply category-based routing bonus
    if (category && this.categoryRouting[category]) {
      const categoryRoute = this.categoryRouting[category];
      scores[categoryRoute] = (scores[categoryRoute] || 0) + 10;
    }

    // Apply priority-based routing bonus
    if (priority && this.priorityRouting[priority]) {
      const priorityRoute = this.priorityRouting[priority];
      scores[priorityRoute] = (scores[priorityRoute] || 0) + 5;
    }

    // Find the best route
    const bestRoute = Object.entries(scores).reduce((best, [key, score]) => {
      return score > best.score ? { route: key, score } : best;
    }, { route: 'servicedesk', score: 0 });

    const routeInfo = this.routingRules[bestRoute.route];
    
    return {
      recommendedAgent: bestRoute.route,
      confidence: Math.min(bestRoute.score / 10, 1), // Normalize to 0-1
      module: routeInfo.module,
      reasoning: this.generateReasoning(bestRoute.route, ticketData),
      suggestedActions: this.getSuggestedActions(bestRoute.route, ticketData),
      autoRoute: bestRoute.score > 15 // Auto-route if confidence is high
    };
  }

  // Calculate routing score based on keywords and patterns
  calculateScore(text, rule) {
    let score = 0;

    // Keyword matching
    rule.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += rule.priority;
      }
    });

    // Pattern matching
    rule.patterns.forEach(pattern => {
      if (pattern.test(text)) {
        score += rule.priority * 2; // Patterns have higher weight
      }
    });

    return score;
  }

  // Generate human-readable reasoning
  generateReasoning(route, ticketData) {
    const reasons = {
      servicedesk: `Routed to Service Desk because this appears to be a general support request or question.`,
      incident: `Routed to Incident Management because this indicates a system issue or outage requiring immediate attention.`,
      request: `Routed to Request Fulfillment because this appears to be a request for new services, software, or access.`,
      problem: `Routed to Problem Management because this suggests a recurring issue that needs root cause analysis.`,
      change: `Routed to Change Management because this involves system changes, updates, or scheduled maintenance.`
    };

    let reasoning = reasons[route] || reasons.servicedesk;

    // Add specific reasoning based on detected keywords
    const { title, category, priority } = ticketData;
    if (category) {
      reasoning += ` Category "${category}" also supports this routing decision.`;
    }
    if (priority === 'Critical' || priority === 'High') {
      reasoning += ` High priority level indicates urgent attention is needed.`;
    }

    return reasoning;
  }

  // Get suggested actions based on route
  getSuggestedActions(route, ticketData) {
    const actions = {
      servicedesk: [
        'Search Knowledge Base',
        'Provide Self-Help Resources',
        'Schedule Support Call',
        'Escalate if Needed'
      ],
      incident: [
        'Assess Impact and Urgency',
        'Notify Stakeholders',
        'Begin Troubleshooting',
        'Create Communication Plan'
      ],
      request: [
        'Check Service Catalog',
        'Verify Approvals Needed',
        'Estimate Fulfillment Time',
        'Assign to Appropriate Team'
      ],
      problem: [
        'Gather Related Incidents',
        'Perform Root Cause Analysis',
        'Identify Patterns',
        'Develop Permanent Solution'
      ],
      change: [
        'Assess Change Impact',
        'Schedule Change Window',
        'Prepare Rollback Plan',
        'Get Change Approval'
      ]
    };

    return actions[route] || actions.servicedesk;
  }

  // Get routing statistics for analytics
  getRoutingStats(tickets) {
    const stats = {
      total: tickets.length,
      byAgent: {},
      accuracy: 0,
      autoRouted: 0
    };

    tickets.forEach(ticket => {
      const routing = this.routeTicket(ticket);
      stats.byAgent[routing.recommendedAgent] = (stats.byAgent[routing.recommendedAgent] || 0) + 1;
      if (routing.autoRoute) {
        stats.autoRouted++;
      }
    });

    stats.accuracy = stats.autoRouted / stats.total;
    return stats;
  }

  // Update routing rules based on feedback
  updateRoutingRules(feedback) {
    // In a real implementation, this would use machine learning
    // to improve routing accuracy based on user feedback
    console.log('Routing feedback received:', feedback);
  }
}

export default new TicketRouter();