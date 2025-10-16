from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from scraper import AuthDetector
from agent import AgenticAuthDetector
import logging
import os
import json
import hashlib
from dotenv import load_dotenv
import redis
from redis.exceptions import RedisError

# Load environment variables from .env file
load_dotenv()

# Initialize Redis client
redis_client = None
CACHE_TTL = 86400  # Cache for 1 day (86400 seconds)

try:
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_password = os.getenv("REDIS_PASSWORD", None)
    
    redis_client = redis.Redis(
        host=redis_host,
        port=redis_port,
        password=redis_password,
        decode_responses=True,
        socket_connect_timeout=5
    )
    # Test connection
    redis_client.ping()
    print(f"✅ Redis connected successfully at {redis_host}:{redis_port}")
except Exception as e:
    print(f"⚠️  Redis connection failed: {e}")
    print("⚠️  Continuing without cache...")
    redis_client = None

app = FastAPI(title="Auth Component Detector API")

# Configure CORS - allow Vercel domains and localhost
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
]

# Add production origins from environment variable if set
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))

# Allow all Vercel preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = AuthDetector()

def get_cache_key(url: str, use_agents: bool) -> str:
    """Generate a unique cache key for the URL and settings"""
    key_string = f"{url}:{use_agents}"
    return f"auth_analysis:{hashlib.md5(key_string.encode()).hexdigest()}"

def get_cached_result(cache_key: str):
    """Get cached result from Redis"""
    if not redis_client:
        return None
    
    try:
        cached = redis_client.get(cache_key)
        if cached:
            print(f"🚀 Cache HIT for key: {cache_key}")
            return json.loads(cached)
        print(f"💤 Cache MISS for key: {cache_key}")
        return None
    except RedisError as e:
        print(f"⚠️  Redis get error: {e}")
        return None

def set_cached_result(cache_key: str, result: dict, ttl: int = CACHE_TTL):
    """Set result in Redis cache"""
    if not redis_client:
        return False
    
    try:
        redis_client.setex(
            cache_key,
            ttl,
            json.dumps(result)
        )
        print(f"💾 Cached result for key: {cache_key} (TTL: {ttl}s)")
        return True
    except RedisError as e:
        print(f"⚠️  Redis set error: {e}")
        return False

class URLRequest(BaseModel):
    url: str
    use_agents: bool = True

class AuthResponse(BaseModel):
    url: str
    found: bool
    components: list
    ai_analysis: str
    method: str = "static"
    captcha_detected: bool = False
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Auth Component Detector API with Agentic Enhancement"}

@app.post("/analyze")
async def analyze_url(request: URLRequest):
    # Generate cache key
    cache_key = get_cache_key(request.url, request.use_agents)
    
    # Try to get cached result
    cached_result = get_cached_result(cache_key)
    if cached_result:
        return cached_result
    
    try:
        # Use Playwright for all requests by default (maximum compatibility)
        static_result = await detector.detect(request.url, use_playwright=True)
        
        # Check for CAPTCHA - if detected, return immediately without agents
        if "captcha" in static_result.get('ai_analysis', '').lower() or "bot protection" in static_result.get('ai_analysis', '').lower():
            result = {
                "url": static_result['url'],
                "found": False,
                "components": [],
                "ai_analysis": static_result['ai_analysis'],
                "method": "captcha_blocked",
                "captcha_detected": True,
                "error": None
            }
            # Cache CAPTCHA results for shorter duration (15 minutes)
            set_cached_result(cache_key, result, ttl=3600)
            return result
        
        # Log HTML snippet length for debugging
        if static_result.get('components'):
            for i, comp in enumerate(static_result['components']):
                html_len = len(comp.get('html', ''))
                print(f"📏 Component {i+1}: HTML length = {html_len} characters")
        
        if request.use_agents:
            # Use agentic approach
            agent_detector = AgenticAuthDetector()
            result = await agent_detector.detect_with_agents(request.url, static_result['components'])
            
            response = {
                "url": request.url,
                "found": len(result['components']) > 0,
                "components": result['components'],
                "ai_analysis": result.get('ai_analysis', ''),
                "method": result['method'],
                "captcha_detected": static_result.get('captcha_detected', False),
                "error": None
            }
            # Cache successful results
            set_cached_result(cache_key, response)
            return response
        else:
            # Return static results
            response = {
                "url": static_result['url'],
                "found": static_result['found'],
                "components": static_result['components'],
                "ai_analysis": static_result['ai_analysis'],
                "method": "static",
                "captcha_detected": static_result.get('captcha_detected', False),
                "error": static_result.get('error')
            }
            # Cache successful results
            set_cached_result(cache_key, response)
            return response
            
    except Exception as e:
        logging.error(f"Error analyzing {request.url}: {str(e)}")
        return {
            "url": request.url,
            "found": False,
            "components": [],
            "ai_analysis": "",
            "method": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
