"""
FastAPI server for Gemini-powered security analysis
Exposes endpoints for log analysis and consensus voting
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import json

from gemini_agents.agent_pool import AgentPool
from gemini_agents.sanitizer import sanitize_log, PromptInjectionError
from gemini_agents.base_agent import AgentResponse

# Load environment variables
load_dotenv()

app = FastAPI(title="Gemini Security Analysis API", version="1.0.0")

# Configure CORS to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent pool
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

agent_pool = AgentPool(GEMINI_API_KEY)


class AnalyzeRequest(BaseModel):
    """Request model for log analysis"""
    log: str
    metadata: Optional[dict] = None


class ConsensusResponse(BaseModel):
    """Response model for consensus analysis"""
    consensus_score: int
    final_verdict: str  # "BLOCK", "ALLOW", "REVIEW"
    threat_detected: bool
    votes: list
    analysis_details: dict


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Gemini Security Analysis API"
    }


@app.get("/agents")
async def get_agents():
    """Get information about all agents"""
    return {
        "agents": agent_pool.get_agents_info(),
        "total_agents": len(agent_pool.agents)
    }


@app.post("/analyze")
async def analyze_log(request: AnalyzeRequest):
    """
    Analyze a security log with all agents
    
    Returns agent votes and consensus score
    """
    try:
        # Sanitize input to prevent prompt injection
        clean_log = sanitize_log(request.log)
    except PromptInjectionError as e:
        raise HTTPException(status_code=400, detail=f"Security error: {str(e)}")
    
    if not clean_log.strip():
        raise HTTPException(status_code=400, detail="Log cannot be empty")
    
    try:
        # Get analysis from all agents
        agent_responses: list[AgentResponse] = agent_pool.analyze_log(clean_log)
        
        # Convert to dicts for JSON serialization
        votes = [
            {
                "id": r.agent_id,
                "name": r.agent_name,
                "decision": r.decision,
                "severity": r.severity,
                "confidence": r.confidence,
                "attack_type": r.attack_type,
                "reasoning": r.reasoning,
                "recommendation": r.recommendation,
                "score": 80 if r.decision else 20  # Convert decision to score
            }
            for r in agent_responses
        ]
        
        # Calculate consensus
        threat_votes = sum(1 for v in votes if v["decision"])
        safe_votes = len(votes) - threat_votes
        
        # BFT consensus: need >2/3 majority
        quorum_size = len(votes)
        threat_threshold = (quorum_size * 2) // 3
        
        threat_detected = threat_votes > threat_threshold
        
        # Determine final verdict
        if threat_detected:
            final_verdict = "BLOCK"
        elif safe_votes > threat_threshold:
            final_verdict = "ALLOW"
        else:
            final_verdict = "REVIEW"
        
        # Calculate consensus score (average confidence)
        consensus_score = sum(v["confidence"] for v in votes) // len(votes)
        
        return ConsensusResponse(
            consensus_score=consensus_score,
            final_verdict=final_verdict,
            threat_detected=threat_detected,
            votes=votes,
            analysis_details={
                "threat_votes": threat_votes,
                "safe_votes": safe_votes,
                "total_agents": len(votes),
                "bft_threshold": threat_threshold,
                "metadata": request.metadata or {}
            }
        )
    
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze/agent/{agent_id}")
async def analyze_with_agent(agent_id: str, request: AnalyzeRequest):
    """
    Analyze with a specific agent only
    
    Agent IDs: A-01 (Malware), A-02 (Injection), A-03 (Network),
               A-04 (Auth), A-05 (Insider), A-06 (Compliance)
    """
    try:
        clean_log = sanitize_log(request.log)
    except PromptInjectionError as e:
        raise HTTPException(status_code=400, detail=f"Security error: {str(e)}")
    
    # Find agent
    agent = None
    for a in agent_pool.agents:
        if a.get_agent_id() == agent_id:
            agent = a
            break
    
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    try:
        response = agent.analyze(clean_log)
        return {
            "agent": {
                "id": response.agent_id,
                "name": response.agent_name
            },
            "analysis": {
                "decision": response.decision,
                "severity": response.severity,
                "confidence": response.confidence,
                "attack_type": response.attack_type,
                "reasoning": response.reasoning,
                "recommendation": response.recommendation
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent analysis failed: {str(e)}")


@app.get("/config")
async def get_config():
    """
    Get frontend configuration
    Called by frontend at startup
    """
    return {
        "api_base_url": os.getenv("API_BASE_URL", "http://localhost:8000"),
        "gemini_enabled": True,
        "agents_count": len(agent_pool.agents)
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
