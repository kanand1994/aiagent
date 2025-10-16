import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from .chatbot import ChatbotService
from .incident_analyzer import IncidentAnalyzer
from .problem_analyzer import ProblemAnalyzer
from .patch_intelligence import PatchIntelligence
from .automation_engine import AutomationEngine
from .knowledge_base import KnowledgeBaseService

logger = logging.getLogger(__name__)

class MultiAgentSystem:
    def __init__(self):
        # Initialize all specialized agents
        self.agents = {
            'orchestrator': OrchestratorAgent(),
            'servicedesk': ServiceDeskAgent(),
            'incident': IncidentAgent(),
            'request': RequestAgent(),
            'problem': ProblemAgent(),
            'change': ChangeAgent(),
            'asset': AssetAgent(),
            'application': ApplicationAgent(),
            'vm': VMAgent(),
            'patch': PatchAgent(),
            'user': UserAgent(),
            'os': OSAgent()
        }
        
        # Agent capabilities and routing rules
        self.agent_capabilities = {
            'servicedesk': ['ticket', 'support', 'help', 'issue', 'create ticket', 'service desk'],
            'incident': ['incident', 'outage', 'down', 'error', 'failure', 'alert'],
            'request': ['request', 'install', 'software', 'access', 'service'],
            'problem': ['problem', 'root cause', 'recurring', 'pattern', 'analysis'],
            'change': ['change', 'deployment', 'update', 'release', 'rollback'],
            'asset': ['asset', 'inventory', 'configuration', 'cmdb', 'discovery'],
            'application': ['application', 'app', 'software', 'deployment', 'install'],
            'vm': ['vm', 'virtual machine', 'provision', 'server', 'infrastructure'],
            'patch': ['patch', 'update', 'security', 'vulnerability', 'compliance'],
            'user': ['user', 'account', 'access', 'permission', 'onboard', 'offboard'],
            'os': ['os', 'operating system', 'configuration', 'hardening', 'baseline']
        }

    async def route_message(self, message: str, user_context: Dict[str, Any], 
                           preferred_agent: Optional[str] = None) -> Dict[str, Any]:
        """Route message to appropriate agent based on content and context"""
        try:
            # If specific agent requested, use it
            if preferred_agent and preferred_agent in self.agents:
                target_agent = preferred_agent
            else:
                # Use orchestrator to determine best agent
                target_agent = await self._determine_target_agent(message, user_context)
            
            # Get response from target agent
            response = await self.agents[target_agent].process_message(message, user_context)
            
            # Add agent metadata
            response['agent_info'] = {
                'agent_id': target_agent,
                'agent_name': self.agents[target_agent].name,
                'capabilities': self.agents[target_agent].capabilities,
                'confidence': response.get('confidence', 0.8)
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Error in multi-agent routing: {str(e)}")
            # Fallback to orchestrator
            return await self.agents['orchestrator'].process_message(message, user_context)

    async def _determine_target_agent(self, message: str, user_context: Dict[str, Any]) -> str:
        """Determine the best agent to handle the message"""
        message_lower = message.lower()
        
        # Score each agent based on keyword matches
        agent_scores = {}
        for agent_id, keywords in self.agent_capabilities.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                agent_scores[agent_id] = score
        
        # Return highest scoring agent or orchestrator as fallback
        if agent_scores:
            return max(agent_scores, key=agent_scores.get)
        
        return 'orchestrator'

    async def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        status = {}
        for agent_id, agent in self.agents.items():
            status[agent_id] = {
                'name': agent.name,
                'status': 'active',
                'capabilities': agent.capabilities,
                'last_used': getattr(agent, 'last_used', None)
            }
        return status

class BaseAgent:
    def __init__(self, name: str, capabilities: List[str]):
        self.name = name
        self.capabilities = capabilities
        self.last_used = None
        
    async def process_message(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Process message and return response"""
        self.last_used = datetime.now()
        return await self._generate_response(message, user_context)
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Override in subclasses"""
        raise NotImplementedError

class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__("Orchestrator Agent", ["routing", "coordination", "general"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the Orchestrator Agent. I help route your requests to the appropriate specialist agents. How can I assist you today?",
            'actions': [
                'View available agents',
                'Get system status',
                'Access help documentation'
            ],
            'suggestions': [
                'Create an incident ticket',
                'Request software installation',
                'Check system health',
                'Provision new VM'
            ],
            'confidence': 0.9
        }

class IncidentAgent(BaseAgent):
    def __init__(self):
        super().__init__("Incident Management Agent", ["incident_analysis", "impact_assessment", "escalation"])
        self.incident_analyzer = IncidentAnalyzer()
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        # Analyze the incident context
        severity = self._detect_severity(message)
        
        return {
            'message': f"I'm the Incident Management Agent. I've analyzed your message and detected a {severity} severity issue. I can help you create an incident ticket, analyze the impact, and coordinate the response.",
            'actions': [
                'Create incident ticket',
                'Analyze system impact',
                'Notify stakeholders',
                'Escalate to on-call team'
            ],
            'redirect_to': '/incidents',
            'suggested_priority': severity,
            'confidence': 0.85
        }
    
    def _detect_severity(self, message: str) -> str:
        message_lower = message.lower()
        if any(word in message_lower for word in ['critical', 'down', 'outage', 'emergency']):
            return 'Critical'
        elif any(word in message_lower for word in ['high', 'urgent', 'major']):
            return 'High'
        elif any(word in message_lower for word in ['medium', 'moderate']):
            return 'Medium'
        return 'Low'

class RequestAgent(BaseAgent):
    def __init__(self):
        super().__init__("Request Fulfillment Agent", ["service_catalog", "approval_workflow", "fulfillment"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        request_type = self._detect_request_type(message)
        
        return {
            'message': f"I'm the Request Fulfillment Agent. I can help you with {request_type} requests. I'll guide you through our service catalog and handle the approval workflow.",
            'actions': [
                'Browse service catalog',
                'Create new request',
                'Check request status',
                'Track approvals'
            ],
            'redirect_to': '/requests',
            'suggested_category': request_type,
            'confidence': 0.8
        }
    
    def _detect_request_type(self, message: str) -> str:
        message_lower = message.lower()
        if any(word in message_lower for word in ['software', 'application', 'install']):
            return 'Software'
        elif any(word in message_lower for word in ['hardware', 'laptop', 'desktop']):
            return 'Hardware'
        elif any(word in message_lower for word in ['access', 'permission', 'account']):
            return 'Access'
        return 'General'

class ProblemAgent(BaseAgent):
    def __init__(self):
        super().__init__("Problem Management Agent", ["root_cause_analysis", "pattern_detection", "prevention"])
        self.problem_analyzer = ProblemAnalyzer()
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the Problem Management Agent. I specialize in identifying root causes and preventing recurring issues. I can analyze incident patterns and suggest preventive measures.",
            'actions': [
                'Analyze incident patterns',
                'Perform root cause analysis',
                'Create problem record',
                'Suggest preventive actions'
            ],
            'redirect_to': '/problems',
            'confidence': 0.85
        }

class ChangeAgent(BaseAgent):
    def __init__(self):
        super().__init__("Change Management Agent", ["change_planning", "risk_assessment", "approval_process"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the Change Management Agent. I help plan, assess, and implement changes safely. I can guide you through the change approval process and risk assessment.",
            'actions': [
                'Create change request',
                'Assess change risk',
                'Schedule implementation',
                'Plan rollback strategy'
            ],
            'redirect_to': '/changes',
            'confidence': 0.8
        }

class AssetAgent(BaseAgent):
    def __init__(self):
        super().__init__("Asset Management Agent", ["asset_discovery", "configuration_tracking", "cmdb_management"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the Asset Management Agent. I maintain the CMDB and track all IT assets and their configurations. I can help you discover, track, and manage your IT infrastructure.",
            'actions': [
                'Discover new assets',
                'Update CMDB records',
                'Track configuration changes',
                'Generate asset reports'
            ],
            'redirect_to': '/assets',
            'confidence': 0.8
        }

class ApplicationAgent(BaseAgent):
    def __init__(self):
        super().__init__("Application Management Agent", ["software_deployment", "lifecycle_management", "automation"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the Application Management Agent. I handle software deployments, application lifecycle management, and automation. I can help you install, update, and manage applications.",
            'actions': [
                'Deploy application',
                'Update software',
                'Manage licenses',
                'Automate installations'
            ],
            'redirect_to': '/applications',
            'confidence': 0.8
        }

class VMAgent(BaseAgent):
    def __init__(self):
        super().__init__("VM Management Agent", ["vm_provisioning", "resource_management", "automation"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the VM Management Agent. I can provision new virtual machines, manage resources, and automate VM lifecycle operations. What type of VM environment do you need?",
            'actions': [
                'Provision new VM',
                'Manage VM resources',
                'Create VM templates',
                'Monitor VM performance'
            ],
            'redirect_to': '/vms',
            'confidence': 0.85
        }

class PatchAgent(BaseAgent):
    def __init__(self):
        super().__init__("Patch Management Agent", ["patch_analysis", "deployment_planning", "compliance_tracking"])
        self.patch_intelligence = PatchIntelligence()
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the Patch Management Agent. I analyze patch requirements, plan deployments, and ensure compliance. I can help you stay secure and up-to-date.",
            'actions': [
                'Analyze patch requirements',
                'Schedule patch deployment',
                'Test patches',
                'Monitor compliance'
            ],
            'redirect_to': '/patches',
            'confidence': 0.85
        }

class UserAgent(BaseAgent):
    def __init__(self):
        super().__init__("User Access Management Agent", ["user_provisioning", "access_control", "compliance"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the User Access Management Agent. I handle user onboarding, access provisioning, and compliance. I can help you manage user accounts and permissions.",
            'actions': [
                'Create user account',
                'Manage permissions',
                'Onboard new user',
                'Conduct access review'
            ],
            'redirect_to': '/users',
            'confidence': 0.8
        }

class ServiceDeskAgent(BaseAgent):
    def __init__(self):
        super().__init__("Service Desk Agent", ["ticket_creation", "support", "knowledge_base", "routing"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        # Analyze if this is a ticket creation request
        message_lower = message.lower()
        is_ticket_request = any(phrase in message_lower for phrase in [
            'create ticket', 'new ticket', 'ticket for', 'report issue', 'need help with'
        ])
        
        if is_ticket_request:
            # Extract ticket information from message
            ticket_suggestion = self._extract_ticket_info(message)
            
            return {
                'message': f"I'll help you create a ticket for this issue. Based on your message, I suggest routing this to the {ticket_suggestion['recommended_agent']} for optimal handling.",
                'actions': [
                    'Create smart ticket',
                    'View similar tickets',
                    'Get instant help',
                    'Contact specialist'
                ],
                'redirect_to': '/service-desk',
                'ticket_suggestion': ticket_suggestion,
                'confidence': 0.95
            }
        
        return {
            'message': "I'm the Service Desk Agent. I can help you create tickets, track existing ones, search our knowledge base, and route you to the right support team. What do you need help with?",
            'actions': [
                'Create support ticket',
                'Search knowledge base', 
                'Check ticket status',
                'Contact support team'
            ],
            'redirect_to': '/service-desk',
            'confidence': 0.9
        }
    
    def _extract_ticket_info(self, message: str) -> Dict[str, Any]:
        """Extract ticket information from user message"""
        message_lower = message.lower()
        
        # Determine priority based on urgency keywords
        priority = 'Medium'
        if any(word in message_lower for word in ['urgent', 'critical', 'emergency', 'down', 'not working']):
            priority = 'High'
        elif any(word in message_lower for word in ['when possible', 'low priority', 'not urgent']):
            priority = 'Low'
        
        # Determine category based on content
        category = 'Other'
        if any(word in message_lower for word in ['email', 'outlook', 'mail']):
            category = 'Email'
        elif any(word in message_lower for word in ['network', 'internet', 'wifi', 'connection']):
            category = 'Network'
        elif any(word in message_lower for word in ['software', 'application', 'program', 'install']):
            category = 'Software'
        elif any(word in message_lower for word in ['hardware', 'computer', 'laptop', 'printer']):
            category = 'Hardware'
        elif any(word in message_lower for word in ['access', 'permission', 'login', 'password']):
            category = 'Access'
        
        # Determine recommended agent
        recommended_agent = 'servicedesk'
        if any(word in message_lower for word in ['down', 'outage', 'not working', 'error']):
            recommended_agent = 'incident'
        elif any(word in message_lower for word in ['install', 'request', 'need access']):
            recommended_agent = 'request'
        elif any(word in message_lower for word in ['recurring', 'multiple times', 'pattern']):
            recommended_agent = 'problem'
        elif any(word in message_lower for word in ['change', 'update', 'deployment']):
            recommended_agent = 'change'
        
        return {
            'title': message[:100] if len(message) <= 100 else message[:97] + '...',
            'description': message,
            'priority': priority,
            'category': category,
            'recommended_agent': recommended_agent,
            'confidence': 0.8
        }

class OSAgent(BaseAgent):
    def __init__(self):
        super().__init__("OS Management Agent", ["os_deployment", "configuration_management", "hardening"])
    
    async def _generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'message': "I'm the OS Management Agent. I handle operating system deployment, configuration, and security hardening. I can help you manage OS lifecycle and compliance.",
            'actions': [
                'Deploy OS image',
                'Configure system settings',
                'Apply security hardening',
                'Monitor compliance'
            ],
            'redirect_to': '/os-management',
            'confidence': 0.8
        }