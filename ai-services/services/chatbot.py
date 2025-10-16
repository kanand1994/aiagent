import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self):
        self.conversation_history = {}
        self.intent_patterns = {
            "password_reset": ["password", "reset", "forgot", "login", "access"],
            "software_install": ["install", "software", "application", "program"],
            "network_issue": ["network", "internet", "connection", "wifi", "vpn"],
            "email_problem": ["email", "outlook", "mail", "smtp", "imap"],
            "hardware_issue": ["hardware", "computer", "laptop", "printer", "monitor"],
            "ticket_status": ["ticket", "status", "update", "progress"],
            "general_help": ["help", "support", "assistance", "guide"]
        }
        
        self.responses = {
            "password_reset": {
                "message": "I can help you with password reset. Let me guide you through the process:",
                "actions": ["Check if account is locked", "Verify identity", "Generate temporary password"],
                "escalate": False,
                "create_ticket": True
            },
            "software_install": {
                "message": "I'll help you with software installation. What application do you need?",
                "actions": ["Check software catalog", "Verify licensing", "Schedule installation"],
                "escalate": False,
                "create_ticket": True
            },
            "network_issue": {
                "message": "I see you're having network connectivity issues. Let's troubleshoot:",
                "actions": ["Check network status", "Test connectivity", "Restart network adapter"],
                "escalate": True,
                "create_ticket": True
            },
            "email_problem": {
                "message": "I can help resolve email issues. What specific problem are you experiencing?",
                "actions": ["Check email server status", "Verify account settings", "Test connection"],
                "escalate": False,
                "create_ticket": True
            },
            "hardware_issue": {
                "message": "Hardware issues require immediate attention. Let me create a priority ticket:",
                "actions": ["Document hardware details", "Schedule technician visit", "Check warranty"],
                "escalate": True,
                "create_ticket": True
            },
            "ticket_status": {
                "message": "I can check your ticket status. Please provide your ticket number:",
                "actions": ["Retrieve ticket details", "Show current status", "Provide updates"],
                "escalate": False,
                "create_ticket": False
            },
            "general_help": {
                "message": "I'm here to help! I can assist with various IT issues including:",
                "actions": ["Password resets", "Software installations", "Network problems", "Email issues"],
                "escalate": False,
                "create_ticket": False
            }
        }

    async def process_message(self, message: str, user_id: str, session_id: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Process incoming chat message and generate appropriate response"""
        try:
            # Store conversation history
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            self.conversation_history[session_id].append({
                "timestamp": datetime.now().isoformat(),
                "user_message": message,
                "user_id": user_id
            })
            
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Generate response
            response = await self._generate_response(intent, message, context)
            
            # Store bot response
            self.conversation_history[session_id].append({
                "timestamp": datetime.now().isoformat(),
                "bot_response": response,
                "intent": intent
            })
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {
                "message": "I'm sorry, I encountered an error. Please try again or contact support.",
                "intent": "error",
                "actions": [],
                "escalate": True,
                "create_ticket": True,
                "confidence": 0.0
            }

    async def _analyze_intent(self, message: str) -> str:
        """Analyze user message to determine intent"""
        message_lower = message.lower()
        intent_scores = {}
        
        for intent, keywords in self.intent_patterns.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                intent_scores[intent] = score / len(keywords)
        
        if intent_scores:
            return max(intent_scores, key=intent_scores.get)
        
        return "general_help"

    async def _generate_response(self, intent: str, message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate appropriate response based on intent"""
        base_response = self.responses.get(intent, self.responses["general_help"])
        
        response = {
            "message": base_response["message"],
            "intent": intent,
            "actions": base_response["actions"],
            "escalate": base_response["escalate"],
            "create_ticket": base_response["create_ticket"],
            "confidence": 0.85,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add context-specific information
        if context:
            response["context"] = context
        
        # Add suggested next steps
        if intent == "password_reset":
            response["next_steps"] = [
                "Verify your identity with security questions",
                "Check your email for reset instructions",
                "Contact IT if you don't receive the email within 5 minutes"
            ]
        elif intent == "software_install":
            response["next_steps"] = [
                "Check if the software is in our approved catalog",
                "Verify you have the necessary permissions",
                "Schedule installation during maintenance window"
            ]
        elif intent == "network_issue":
            response["next_steps"] = [
                "Check if other devices are affected",
                "Try restarting your network adapter",
                "Test with ethernet cable if using WiFi"
            ]
        
        return response

    async def get_suggestions(self, user_id: str) -> List[str]:
        """Get contextual suggestions for the user"""
        suggestions = [
            "I need help with password reset",
            "How do I install new software?",
            "I'm having network connectivity issues",
            "My email is not working",
            "Check my ticket status",
            "I need general IT support"
        ]
        
        return suggestions

    async def get_conversation_history(self, session_id: str) -> List[Dict]:
        """Retrieve conversation history for a session"""
        return self.conversation_history.get(session_id, [])

    async def clear_conversation_history(self, session_id: str) -> bool:
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
            return True
        return False