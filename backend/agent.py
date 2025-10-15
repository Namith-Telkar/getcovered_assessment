import asyncio
from playwright.async_api import async_playwright
import google.generativeai as genai
import json
from typing import List, Dict, Any
import os

class AgenticAuthDetector:
    def __init__(self):
        # Initialize Gemini
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-flash-latest')
        
    async def detect_with_agents(self, url: str, static_components: List[Dict]) -> Dict[str, Any]:
        """Orchestrate detection using multiple agents"""
        
        # If static detection found components, enhance with validation
        if static_components:
            return await self._enhance_static_results(url, static_components)
        
        # If static failed, return not found
        return {
            'components': [],
            'ai_analysis': "No authentication components found on this page.",
            'method': 'not_found'
        }
    
    async def _enhance_static_results(self, url: str, components: List[Dict]) -> Dict[str, Any]:
        """Enhance static results with AI validation and analysis"""
        try:
            validation_prompt = f"""
            Analyze these detected auth components from {url}:
            {json.dumps(components, indent=2)}
            
            Are these likely functional login forms? Rate confidence 1-10 and explain briefly.
            """
            
            response = self.model.generate_content(validation_prompt)
            
            return {
                'components': components,
                'ai_analysis': response.text,
                'method': 'static_enhanced'
            }
            
        except Exception as e:
            return {
                'components': components,
                'ai_analysis': f"Validation error: {e}",
                'method': 'static_only'
            }
