from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import logging
from datetime import datetime
import asyncio

# Import service modules
from services.chatbot import ChatbotService
from services.incident_analyzer import IncidentAnalyzer
from services.problem_analyzer import ProblemAnalyzer
from services.patch_intelligence import PatchIntelligence
from services.automation_engine import AutomationEngine
from services.knowledge_base import KnowledgeBaseService
from services.multi_agent_system import MultiAgentSystem

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IT Automation AI Services",
    description="AI-powered services for IT automation platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
chatbot_service = ChatbotService()
incident_analyzer = IncidentAnalyzer()
problem_analyzer = ProblemAnalyzer()
patch_intelligence = PatchIntelligence()
automation_engine = AutomationEngine()
knowledge_base = KnowledgeBaseService()
multi_agent_system = MultiAgentSystem()

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    user_id: str
    session_id: str
    preferred_agent: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class IncidentData(BaseModel):
    title: str
    description: str
    severity: str
    affected_systems: List[str]
    symptoms: List[str]
    timestamp: datetime

class ProblemAnalysisRequest(BaseModel):
    incidents: List[Dict[str, Any]]
    timeframe_days: int = 30

class PatchAnalysisRequest(BaseModel):
    system_id: str
    current_patches: List[str]
    system_type: str
    criticality_level: str

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "chatbot": "active",
            "incident_analyzer": "active",
            "problem_analyzer": "active",
            "patch_intelligence": "active",
            "automation_engine": "active",
            "knowledge_base": "active"
        }
    }

# Multi-Agent Chat endpoints
@app.post("/api/chat/message")
async def process_chat_message(message: ChatMessage):
    try:
        # Use multi-agent system for intelligent routing
        user_context = {
            'user_id': message.user_id,
            'session_id': message.session_id,
            **(message.context or {})
        }
        
        response = await multi_agent_system.route_message(
            message.message,
            user_context,
            message.preferred_agent
        )
        return response
    except Exception as e:
        logger.error(f"Multi-agent chat processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agents/status")
async def get_agents_status():
    try:
        status = await multi_agent_system.get_agent_status()
        return status
    except Exception as e:
        logger.error(f"Agent status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/suggestions/{user_id}")
async def get_chat_suggestions(user_id: str):
    try:
        suggestions = await chatbot_service.get_suggestions(user_id)
        return {"suggestions": suggestions}
    except Exception as e:
        logger.error(f"Suggestions error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Incident analysis endpoints
@app.post("/api/incidents/analyze")
async def analyze_incident(incident: IncidentData):
    try:
        analysis = await incident_analyzer.analyze_incident(
            incident.title,
            incident.description,
            incident.severity,
            incident.affected_systems,
            incident.symptoms
        )
        return analysis
    except Exception as e:
        logger.error(f"Incident analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/incidents/classify")
async def classify_incident(incident: IncidentData):
    try:
        classification = await incident_analyzer.classify_incident(incident.dict())
        return classification
    except Exception as e:
        logger.error(f"Incident classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/incidents/predict-resolution")
async def predict_resolution_time(incident: IncidentData):
    try:
        prediction = await incident_analyzer.predict_resolution_time(incident.dict())
        return prediction
    except Exception as e:
        logger.error(f"Resolution prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Problem analysis endpoints
@app.post("/api/problems/analyze")
async def analyze_problems(request: ProblemAnalysisRequest):
    try:
        analysis = await problem_analyzer.analyze_recurring_problems(
            request.incidents,
            request.timeframe_days
        )
        return analysis
    except Exception as e:
        logger.error(f"Problem analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/problems/root-cause")
async def find_root_cause(request: ProblemAnalysisRequest):
    try:
        root_cause = await problem_analyzer.find_root_cause(request.incidents)
        return root_cause
    except Exception as e:
        logger.error(f"Root cause analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Patch intelligence endpoints
@app.post("/api/patches/analyze")
async def analyze_patches(request: PatchAnalysisRequest):
    try:
        analysis = await patch_intelligence.analyze_patch_requirements(
            request.system_id,
            request.current_patches,
            request.system_type,
            request.criticality_level
        )
        return analysis
    except Exception as e:
        logger.error(f"Patch analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/patches/recommendations/{system_id}")
async def get_patch_recommendations(system_id: str):
    try:
        recommendations = await patch_intelligence.get_patch_recommendations(system_id)
        return recommendations
    except Exception as e:
        logger.error(f"Patch recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Automation endpoints
@app.post("/api/automation/execute")
async def execute_automation(background_tasks: BackgroundTasks, task_data: Dict[str, Any]):
    try:
        task_id = await automation_engine.execute_task(task_data, background_tasks)
        return {"task_id": task_id, "status": "initiated"}
    except Exception as e:
        logger.error(f"Automation execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/automation/status/{task_id}")
async def get_automation_status(task_id: str):
    try:
        status = await automation_engine.get_task_status(task_id)
        return status
    except Exception as e:
        logger.error(f"Automation status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Knowledge base endpoints
@app.get("/api/knowledge/search")
async def search_knowledge_base(query: str, category: Optional[str] = None):
    try:
        results = await knowledge_base.search(query, category)
        return results
    except Exception as e:
        logger.error(f"Knowledge search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/knowledge/add")
async def add_knowledge_article(article_data: Dict[str, Any]):
    try:
        article_id = await knowledge_base.add_article(article_data)
        return {"article_id": article_id, "status": "created"}
    except Exception as e:
        logger.error(f"Knowledge addition error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )