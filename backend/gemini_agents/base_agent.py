"""
Base agent class for Gemini-powered security analysts
"""

import google.generativeai as genai
import json
import time
from typing import Optional, Dict, Any
from abc import ABC, abstractmethod
from pydantic import BaseModel


class AgentResponse(BaseModel):
    """Standard response format for all agents"""
    agent_id: str
    agent_name: str
    decision: bool  # True = threat, False = safe
    severity: str  # Low, Medium, High, Critical
    confidence: int  # 0-100
    attack_type: str
    reasoning: str
    recommendation: str


class BaseAgent(ABC):
    """Base class for all Gemini-powered security agents"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-pro"):
        self.api_key = api_key
        self.model_name = model_name
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent"""
        pass
    
    @abstractmethod
    def get_agent_id(self) -> str:
        """Return unique agent ID"""
        pass
    
    @abstractmethod
    def get_agent_name(self) -> str:
        """Return human-readable agent name"""
        pass
    
    def _call_gemini_with_retry(self, prompt: str, max_retries: int = 3) -> Optional[str]:
        """
        Call Gemini API with retry logic
        
        Args:
            prompt: The prompt to send to Gemini
            max_retries: Number of retry attempts
            
        Returns:
            Response text or None if failed
        """
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    time.sleep(wait_time)
                else:
                    print(f"Failed after {max_retries} retries: {str(e)}")
                    return None
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """
        Parse JSON from Gemini response
        
        Args:
            text: Raw response text from Gemini
            
        Returns:
            Parsed JSON dict
        """
        try:
            # Try direct parsing first
            return json.loads(text)
        except json.JSONDecodeError:
            # Try extracting JSON from markdown code blocks
            if "```json" in text:
                start = text.find("```json") + 7
                end = text.find("```", start)
                if end != -1:
                    return json.loads(text[start:end].strip())
            elif "```" in text:
                start = text.find("```") + 3
                end = text.find("```", start)
                if end != -1:
                    return json.loads(text[start:end].strip())
            
            # Return error response if parsing fails
            return {
                "threat": False,
                "severity": "Unknown",
                "confidence": 0,
                "attack_type": "Parse Error",
                "reasoning": "Failed to parse Gemini response"
            }
    
    def analyze(self, log: str) -> AgentResponse:
        """
        Analyze a security log and return structured response
        
        Args:
            log: Raw security log or event
            
        Returns:
            Structured AgentResponse
        """
        # Construct the analysis prompt
        full_prompt = f"""{self.get_system_prompt()}

Log/Event to analyze:
{log}

Return ONLY valid JSON in this format:
{{
  "threat": true/false,
  "severity": "Low" | "Medium" | "High" | "Critical",
  "confidence": 0-100,
  "attack_type": "string",
  "reasoning": "string"
}}
"""
        
        # Call Gemini with retry logic
        response_text = self._call_gemini_with_retry(full_prompt)
        
        if response_text is None:
            return AgentResponse(
                agent_id=self.get_agent_id(),
                agent_name=self.get_agent_name(),
                decision=False,
                severity="Unknown",
                confidence=0,
                attack_type="Analysis Failed",
                reasoning="Failed to reach Gemini API",
                recommendation="Retry analysis"
            )
        
        # Parse Gemini's response
        parsed = self._parse_json_response(response_text)
        
        # Build recommendation based on severity
        recommendation = self._get_recommendation(
            parsed.get("threat", False),
            parsed.get("severity", "Unknown")
        )
        
        return AgentResponse(
            agent_id=self.get_agent_id(),
            agent_name=self.get_agent_name(),
            decision=parsed.get("threat", False),
            severity=parsed.get("severity", "Unknown"),
            confidence=parsed.get("confidence", 0),
            attack_type=parsed.get("attack_type", "Unknown"),
            reasoning=parsed.get("reasoning", "No reasoning provided"),
            recommendation=recommendation
        )
    
    @staticmethod
    def _get_recommendation(is_threat: bool, severity: str) -> str:
        """Get action recommendation based on threat level"""
        if not is_threat:
            return "Monitor and log"
        
        severity_lower = severity.lower()
        if severity_lower == "critical":
            return "Block immediately and alert security team"
        elif severity_lower == "high":
            return "Block and investigate"
        elif severity_lower == "medium":
            return "Review and monitor"
        else:
            return "Monitor for patterns"
