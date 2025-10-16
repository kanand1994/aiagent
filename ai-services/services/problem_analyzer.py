import asyncio
from typing import Dict, List, Any
from datetime import datetime, timedelta
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class ProblemAnalyzer:
    def __init__(self):
        self.correlation_threshold = 0.7
        self.min_incident_count = 3
        
    async def analyze_recurring_problems(self, incidents: List[Dict[str, Any]], 
                                       timeframe_days: int = 30) -> Dict[str, Any]:
        """Analyze incidents to identify recurring problems"""
        try:
            # Filter incidents by timeframe
            cutoff_date = datetime.now() - timedelta(days=timeframe_days)
            recent_incidents = [
                inc for inc in incidents 
                if datetime.fromisoformat(inc.get('created_date', datetime.now().isoformat())) > cutoff_date
            ]
            
            # Group incidents by similarity
            problem_groups = await self._group_similar_incidents(recent_incidents)
            
            # Analyze patterns
            patterns = await self._analyze_patterns(problem_groups)
            
            # Identify root causes
            root_causes = await self._identify_root_causes(problem_groups)
            
            # Generate recommendations
            recommendations = await self._generate_problem_recommendations(patterns, root_causes)
            
            return {
                'analysis_id': f"PROB-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'timeframe_days': timeframe_days,
                'total_incidents': len(recent_incidents),
                'problem_groups': problem_groups,
                'patterns': patterns,
                'root_causes': root_causes,
                'recommendations': recommendations,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing recurring problems: {str(e)}")
            raise

    async def find_root_cause(self, incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform root cause analysis on a group of incidents"""
        try:
            # Analyze common factors
            common_factors = await self._find_common_factors(incidents)
            
            # Analyze timeline patterns
            timeline_analysis = await self._analyze_timeline_patterns(incidents)
            
            # Identify potential root causes
            potential_causes = await self._identify_potential_causes(common_factors, timeline_analysis)
            
            # Score and rank causes
            ranked_causes = await self._rank_root_causes(potential_causes, incidents)
            
            return {
                'root_cause_analysis_id': f"RCA-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'incident_count': len(incidents),
                'common_factors': common_factors,
                'timeline_analysis': timeline_analysis,
                'potential_causes': potential_causes,
                'ranked_causes': ranked_causes,
                'confidence_score': await self._calculate_confidence_score(ranked_causes),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in root cause analysis: {str(e)}")
            raise

    async def _group_similar_incidents(self, incidents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Group incidents by similarity"""
        groups = []
        processed_incidents = set()
        
        for i, incident in enumerate(incidents):
            if i in processed_incidents:
                continue
                
            similar_group = [incident]
            processed_incidents.add(i)
            
            for j, other_incident in enumerate(incidents[i+1:], i+1):
                if j in processed_incidents:
                    continue
                    
                similarity = await self._calculate_similarity(incident, other_incident)
                if similarity > self.correlation_threshold:
                    similar_group.append(other_incident)
                    processed_incidents.add(j)
            
            if len(similar_group) >= self.min_incident_count:
                groups.append({
                    'group_id': f"GRP-{len(groups)+1}",
                    'incident_count': len(similar_group),
                    'incidents': similar_group,
                    'common_symptoms': await self._extract_common_symptoms(similar_group),
                    'affected_systems': await self._get_affected_systems(similar_group),
                    'frequency': len(similar_group) / len(incidents)
                })
        
        return groups

    async def _calculate_similarity(self, incident1: Dict[str, Any], incident2: Dict[str, Any]) -> float:
        """Calculate similarity score between two incidents"""
        # Simple similarity based on title and description keywords
        text1 = f"{incident1.get('title', '')} {incident1.get('description', '')}".lower()
        text2 = f"{incident2.get('title', '')} {incident2.get('description', '')}".lower()
        
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0

    async def _extract_common_symptoms(self, incidents: List[Dict[str, Any]]) -> List[str]:
        """Extract common symptoms from a group of incidents"""
        all_symptoms = []
        for incident in incidents:
            symptoms = incident.get('symptoms', [])
            if isinstance(symptoms, list):
                all_symptoms.extend(symptoms)
            else:
                # Extract from description if symptoms not available
                description = incident.get('description', '')
                all_symptoms.extend(description.split())
        
        # Count frequency and return most common
        symptom_counts = Counter(all_symptoms)
        return [symptom for symptom, count in symptom_counts.most_common(5)]

    async def _get_affected_systems(self, incidents: List[Dict[str, Any]]) -> List[str]:
        """Get list of affected systems from incidents"""
        systems = set()
        for incident in incidents:
            affected = incident.get('affected_systems', [])
            if isinstance(affected, list):
                systems.update(affected)
        return list(systems)

    async def _analyze_patterns(self, problem_groups: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patterns in problem groups"""
        patterns = {
            'temporal_patterns': [],
            'system_patterns': [],
            'severity_patterns': []
        }
        
        for group in problem_groups:
            incidents = group['incidents']
            
            # Temporal patterns
            times = [datetime.fromisoformat(inc.get('created_date', datetime.now().isoformat())) 
                    for inc in incidents]
            if len(times) > 1:
                time_diffs = [(times[i+1] - times[i]).total_seconds() / 3600 
                             for i in range(len(times)-1)]
                avg_interval = sum(time_diffs) / len(time_diffs)
                patterns['temporal_patterns'].append({
                    'group_id': group['group_id'],
                    'average_interval_hours': avg_interval,
                    'pattern_type': 'recurring' if avg_interval < 168 else 'sporadic'  # 168 hours = 1 week
                })
            
            # System patterns
            systems = group['affected_systems']
            if systems:
                patterns['system_patterns'].append({
                    'group_id': group['group_id'],
                    'affected_systems': systems,
                    'system_count': len(systems)
                })
            
            # Severity patterns
            severities = [inc.get('severity', 'medium') for inc in incidents]
            severity_counts = Counter(severities)
            patterns['severity_patterns'].append({
                'group_id': group['group_id'],
                'severity_distribution': dict(severity_counts),
                'most_common_severity': severity_counts.most_common(1)[0][0] if severity_counts else 'medium'
            })
        
        return patterns

    async def _identify_root_causes(self, problem_groups: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify potential root causes for problem groups"""
        root_causes = []
        
        for group in problem_groups:
            incidents = group['incidents']
            common_symptoms = group['common_symptoms']
            affected_systems = group['affected_systems']
            
            # Analyze common factors
            potential_causes = []
            
            # System-based causes
            if len(affected_systems) == 1:
                potential_causes.append({
                    'type': 'system_specific',
                    'description': f"Issue specific to {affected_systems[0]}",
                    'confidence': 0.8,
                    'evidence': f"All incidents affect only {affected_systems[0]}"
                })
            elif len(set(affected_systems)) < len(affected_systems):
                potential_causes.append({
                    'type': 'shared_dependency',
                    'description': "Issue with shared system dependency",
                    'confidence': 0.7,
                    'evidence': f"Multiple systems affected: {', '.join(set(affected_systems))}"
                })
            
            # Symptom-based causes
            if 'network' in ' '.join(common_symptoms).lower():
                potential_causes.append({
                    'type': 'network_infrastructure',
                    'description': "Network infrastructure issue",
                    'confidence': 0.75,
                    'evidence': "Network-related symptoms detected"
                })
            
            if 'performance' in ' '.join(common_symptoms).lower():
                potential_causes.append({
                    'type': 'resource_constraint',
                    'description': "System resource constraints",
                    'confidence': 0.7,
                    'evidence': "Performance-related symptoms detected"
                })
            
            root_causes.append({
                'group_id': group['group_id'],
                'potential_causes': potential_causes,
                'recommended_investigation': await self._generate_investigation_steps(potential_causes)
            })
        
        return root_causes

    async def _find_common_factors(self, incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Find common factors across incidents"""
        # Extract common systems
        all_systems = []
        for incident in incidents:
            systems = incident.get('affected_systems', [])
            all_systems.extend(systems)
        
        system_counts = Counter(all_systems)
        
        # Extract common timeframes
        times = [datetime.fromisoformat(inc.get('created_date', datetime.now().isoformat())) 
                for inc in incidents]
        
        # Extract common severities
        severities = [inc.get('severity', 'medium') for inc in incidents]
        severity_counts = Counter(severities)
        
        return {
            'common_systems': [sys for sys, count in system_counts.most_common(3)],
            'time_range': {
                'start': min(times).isoformat(),
                'end': max(times).isoformat(),
                'span_hours': (max(times) - min(times)).total_seconds() / 3600
            },
            'severity_distribution': dict(severity_counts),
            'most_common_severity': severity_counts.most_common(1)[0][0] if severity_counts else 'medium'
        }

    async def _analyze_timeline_patterns(self, incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze timeline patterns in incidents"""
        times = [datetime.fromisoformat(inc.get('created_date', datetime.now().isoformat())) 
                for inc in incidents]
        times.sort()
        
        # Calculate intervals
        intervals = [(times[i+1] - times[i]).total_seconds() / 3600 
                    for i in range(len(times)-1)]
        
        return {
            'incident_count': len(incidents),
            'time_span_hours': (max(times) - min(times)).total_seconds() / 3600 if len(times) > 1 else 0,
            'average_interval_hours': sum(intervals) / len(intervals) if intervals else 0,
            'intervals': intervals,
            'pattern_type': 'burst' if len(intervals) > 0 and max(intervals) < 24 else 'distributed'
        }

    async def _identify_potential_causes(self, common_factors: Dict[str, Any], 
                                       timeline_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify potential root causes based on analysis"""
        causes = []
        
        # Time-based causes
        if timeline_analysis['pattern_type'] == 'burst':
            causes.append({
                'type': 'triggering_event',
                'description': 'Single triggering event causing cascade of incidents',
                'confidence': 0.8,
                'evidence': f"Incidents clustered within {timeline_analysis['time_span_hours']:.1f} hours"
            })
        
        # System-based causes
        common_systems = common_factors['common_systems']
        if common_systems:
            causes.append({
                'type': 'system_failure',
                'description': f'Failure in common system: {common_systems[0]}',
                'confidence': 0.75,
                'evidence': f"System {common_systems[0]} involved in multiple incidents"
            })
        
        # Severity-based causes
        if common_factors['most_common_severity'] in ['critical', 'high']:
            causes.append({
                'type': 'infrastructure_issue',
                'description': 'Critical infrastructure component failure',
                'confidence': 0.7,
                'evidence': f"High severity incidents: {common_factors['most_common_severity']}"
            })
        
        return causes

    async def _rank_root_causes(self, potential_causes: List[Dict[str, Any]], 
                              incidents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank potential root causes by likelihood"""
        # Sort by confidence score
        ranked = sorted(potential_causes, key=lambda x: x['confidence'], reverse=True)
        
        # Add ranking information
        for i, cause in enumerate(ranked):
            cause['rank'] = i + 1
            cause['likelihood'] = 'High' if cause['confidence'] > 0.8 else 'Medium' if cause['confidence'] > 0.6 else 'Low'
        
        return ranked

    async def _calculate_confidence_score(self, ranked_causes: List[Dict[str, Any]]) -> float:
        """Calculate overall confidence score for root cause analysis"""
        if not ranked_causes:
            return 0.0
        
        # Weight by rank (higher ranked causes contribute more)
        total_weight = sum(1/i for i in range(1, len(ranked_causes) + 1))
        weighted_confidence = sum(cause['confidence'] / cause['rank'] for cause in ranked_causes)
        
        return weighted_confidence / total_weight

    async def _generate_investigation_steps(self, potential_causes: List[Dict[str, Any]]) -> List[str]:
        """Generate investigation steps based on potential causes"""
        steps = []
        
        for cause in potential_causes:
            if cause['type'] == 'system_specific':
                steps.extend([
                    "Review system logs and performance metrics",
                    "Check system configuration changes",
                    "Verify system resource utilization"
                ])
            elif cause['type'] == 'network_infrastructure':
                steps.extend([
                    "Analyze network traffic patterns",
                    "Check network device logs",
                    "Verify network configuration"
                ])
            elif cause['type'] == 'resource_constraint':
                steps.extend([
                    "Monitor CPU, memory, and disk usage",
                    "Review capacity planning metrics",
                    "Check for resource bottlenecks"
                ])
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(steps))

    async def _generate_problem_recommendations(self, patterns: Dict[str, Any], 
                                             root_causes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate recommendations based on problem analysis"""
        recommendations = []
        
        # Temporal pattern recommendations
        for pattern in patterns['temporal_patterns']:
            if pattern['pattern_type'] == 'recurring':
                recommendations.append({
                    'type': 'preventive',
                    'priority': 'high',
                    'description': f"Implement proactive monitoring for group {pattern['group_id']}",
                    'action': f"Set up alerts for early detection of recurring pattern (avg interval: {pattern['average_interval_hours']:.1f}h)"
                })
        
        # System pattern recommendations
        for pattern in patterns['system_patterns']:
            if pattern['system_count'] > 1:
                recommendations.append({
                    'type': 'infrastructure',
                    'priority': 'medium',
                    'description': f"Review shared dependencies for group {pattern['group_id']}",
                    'action': f"Analyze common infrastructure components affecting: {', '.join(pattern['affected_systems'])}"
                })
        
        # Root cause recommendations
        for rc_group in root_causes:
            for cause in rc_group['potential_causes']:
                if cause['confidence'] > 0.7:
                    recommendations.append({
                        'type': 'corrective',
                        'priority': 'high' if cause['confidence'] > 0.8 else 'medium',
                        'description': f"Address {cause['type']} for group {rc_group['group_id']}",
                        'action': cause['description']
                    })
        
        return recommendations