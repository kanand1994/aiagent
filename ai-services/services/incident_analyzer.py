import asyncio
from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class IncidentAnalyzer:
    def __init__(self):
        self.severity_keywords = {
            'critical': ['down', 'outage', 'critical', 'emergency', 'failure', 'crash'],
            'high': ['slow', 'performance', 'timeout', 'error', 'issue'],
            'medium': ['warning', 'minor', 'degraded'],
            'low': ['information', 'notice', 'advisory']
        }
        
        self.category_keywords = {
            'network': ['network', 'connectivity', 'internet', 'vpn', 'dns', 'firewall'],
            'application': ['application', 'software', 'app', 'service', 'api'],
            'hardware': ['hardware', 'server', 'disk', 'memory', 'cpu', 'storage'],
            'security': ['security', 'breach', 'unauthorized', 'malware', 'virus']
        }

    async def analyze_incident(self, title: str, description: str, severity: str, 
                             affected_systems: List[str], symptoms: List[str]) -> Dict[str, Any]:
        """Analyze incident and provide recommendations"""
        try:
            # Classify incident category
            category = await self._classify_category(title + " " + description)
            
            # Predict resolution time
            resolution_time = await self._predict_resolution_time(severity, category)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(category, severity, symptoms)
            
            # Check for similar incidents
            similar_incidents = await self._find_similar_incidents(title, description)
            
            return {
                'incident_id': f"INC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'category': category,
                'predicted_resolution_time': resolution_time,
                'recommendations': recommendations,
                'similar_incidents': similar_incidents,
                'priority_score': await self._calculate_priority_score(severity, affected_systems),
                'escalation_required': await self._check_escalation_needed(severity, affected_systems),
                'automated_actions': await self._suggest_automated_actions(category, symptoms),
                'analysis_timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error analyzing incident: {str(e)}")
            raise

    async def classify_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Classify incident based on content analysis"""
        text = f"{incident_data.get('title', '')} {incident_data.get('description', '')}"
        
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text.lower())
            if score > 0:
                category_scores[category] = score / len(keywords)
        
        primary_category = max(category_scores, key=category_scores.get) if category_scores else 'general'
        
        return {
            'primary_category': primary_category,
            'category_scores': category_scores,
            'confidence': max(category_scores.values()) if category_scores else 0.0
        }

    async def predict_resolution_time(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict incident resolution time based on historical data"""
        severity = incident_data.get('severity', 'medium').lower()
        category = incident_data.get('category', 'general').lower()
        
        # Base resolution times (in hours)
        base_times = {
            'critical': 2,
            'high': 8,
            'medium': 24,
            'low': 72
        }
        
        # Category multipliers
        category_multipliers = {
            'network': 1.5,
            'hardware': 2.0,
            'application': 1.2,
            'security': 1.8,
            'general': 1.0
        }
        
        base_time = base_times.get(severity, 24)
        multiplier = category_multipliers.get(category, 1.0)
        predicted_hours = base_time * multiplier
        
        return {
            'predicted_hours': predicted_hours,
            'confidence': 0.75,
            'factors': {
                'severity': severity,
                'category': category,
                'base_time': base_time,
                'category_multiplier': multiplier
            }
        }

    async def _classify_category(self, text: str) -> str:
        """Classify incident category based on text analysis"""
        text_lower = text.lower()
        category_scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        return max(category_scores, key=category_scores.get) if category_scores else 'general'

    async def _predict_resolution_time(self, severity: str, category: str) -> int:
        """Predict resolution time in hours"""
        base_times = {'critical': 2, 'high': 8, 'medium': 24, 'low': 72}
        multipliers = {'network': 1.5, 'hardware': 2.0, 'application': 1.2, 'security': 1.8}
        
        base = base_times.get(severity.lower(), 24)
        multiplier = multipliers.get(category.lower(), 1.0)
        
        return int(base * multiplier)

    async def _generate_recommendations(self, category: str, severity: str, symptoms: List[str]) -> List[str]:
        """Generate incident resolution recommendations"""
        recommendations = []
        
        if category == 'network':
            recommendations.extend([
                "Check network connectivity and routing",
                "Verify firewall rules and configurations",
                "Test DNS resolution",
                "Monitor network traffic patterns"
            ])
        elif category == 'application':
            recommendations.extend([
                "Check application logs for errors",
                "Verify service dependencies",
                "Monitor resource utilization",
                "Test application endpoints"
            ])
        elif category == 'hardware':
            recommendations.extend([
                "Check hardware health status",
                "Monitor system resources",
                "Verify hardware connections",
                "Review system logs"
            ])
        elif category == 'security':
            recommendations.extend([
                "Isolate affected systems",
                "Review security logs",
                "Check for unauthorized access",
                "Update security policies"
            ])
        
        if severity.lower() in ['critical', 'high']:
            recommendations.insert(0, "Escalate to senior technician immediately")
            recommendations.append("Prepare communication for stakeholders")
        
        return recommendations

    async def _find_similar_incidents(self, title: str, description: str) -> List[Dict[str, Any]]:
        """Find similar historical incidents"""
        # Mock similar incidents for demonstration
        return [
            {
                'incident_id': 'INC-20240101001',
                'title': 'Similar network connectivity issue',
                'resolution': 'Restarted network services',
                'resolution_time': 4,
                'similarity_score': 0.85
            }
        ]

    async def _calculate_priority_score(self, severity: str, affected_systems: List[str]) -> int:
        """Calculate priority score based on severity and impact"""
        severity_scores = {'critical': 10, 'high': 7, 'medium': 4, 'low': 1}
        base_score = severity_scores.get(severity.lower(), 4)
        
        # Add impact based on number of affected systems
        impact_score = min(len(affected_systems), 5)
        
        return base_score + impact_score

    async def _check_escalation_needed(self, severity: str, affected_systems: List[str]) -> bool:
        """Check if incident requires escalation"""
        return severity.lower() in ['critical', 'high'] or len(affected_systems) > 10

    async def _suggest_automated_actions(self, category: str, symptoms: List[str]) -> List[str]:
        """Suggest automated remediation actions"""
        actions = []
        
        if category == 'network':
            actions.extend([
                "Run network diagnostics",
                "Restart network services",
                "Check interface status"
            ])
        elif category == 'application':
            actions.extend([
                "Restart application services",
                "Clear application cache",
                "Check database connectivity"
            ])
        elif category == 'hardware':
            actions.extend([
                "Run hardware diagnostics",
                "Check system health",
                "Monitor resource usage"
            ])
        
        return actions