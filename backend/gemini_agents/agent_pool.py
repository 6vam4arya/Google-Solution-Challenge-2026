"""
Agent pool manager - manages all 6 Gemini-powered agents
"""

from typing import List
from .malware_agent import MalwareAgent
from .injection_agent import InjectionAgent
from .network_agent import NetworkAgent
from .auth_agent import AuthenticationAgent
from .insider_agent import InsiderThreatAgent
from .compliance_agent import ComplianceAgent
from .base_agent import BaseAgent, AgentResponse


class AgentPool:
    """Manages all security analysis agents"""
    
    def __init__(self, api_key: str):
        """Initialize all 6 specialized agents"""
        self.api_key = api_key
        self.agents: List[BaseAgent] = [
            MalwareAgent(api_key),
            InjectionAgent(api_key),
            NetworkAgent(api_key),
            AuthenticationAgent(api_key),
            InsiderThreatAgent(api_key),
            ComplianceAgent(api_key),
        ]
    
    def analyze_log(self, log: str) -> List[AgentResponse]:
        """
        Analyze a log with all agents in parallel
        
        Args:
            log: Security log to analyze
            
        Returns:
            List of AgentResponse from all agents
        """
        responses = []
        
        # In production, use asyncio for true parallelism
        # For now, sequential analysis
        for agent in self.agents:
            response = agent.analyze(log)
            responses.append(response)
        
        return responses
    
    def get_agents_info(self) -> List[dict]:
        """Get info about all agents"""
        return [
            {
                "id": agent.get_agent_id(),
                "name": agent.get_agent_name(),
                "specialty": agent.get_system_prompt().split('\n')[1]
            }
            for agent in self.agents
        ]
