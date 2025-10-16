# System Architecture & Design

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Deployment Architecture](#deployment-architecture)
6. [Technology Stack](#technology-stack)

---

## System Overview

The Authentication Component Detector is a full-stack web application that uses AI to analyze websites and detect authentication components. It combines web scraping, browser automation, and Google Gemini AI to provide intelligent analysis of login forms and authentication mechanisms.

### Key Features
- 🌐 Web scraping with dynamic JavaScript rendering (Playwright)
- 🤖 AI-powered analysis using Google Gemini
- 📊 Real-time results with formatted markdown output
- 🔍 Multiple detection methods (9 different strategies)
- 🛡️ CAPTCHA detection and handling
- ⚡ Automatic JS-heavy page detection

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER / BROWSER                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend Host)                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  React + Vite Frontend                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │   App.jsx   │  │ ResultCard   │  │ SingleUrlAnalyzer│    │  │
│  │  │  (Routes)   │  │  (Display)   │  │    (Input)       │    │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘    │  │
│  │         │                 │                    │              │  │
│  │         └─────────────────┴────────────────────┘              │  │
│  │                           │                                   │  │
│  │                  ┌────────▼────────┐                         │  │
│  │                  │  API Service    │                         │  │
│  │                  │  (Axios Client) │                         │  │
│  │                  └────────┬────────┘                         │  │
│  └───────────────────────────┼───────────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             │ HTTP POST /analyze
                             │ (with URL payload)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DigitalOcean Droplet (Backend Host)                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Docker Container                           │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │              FastAPI Backend (main.py)                  │ │  │
│  │  │  ┌────────────┐                                         │ │  │
│  │  │  │  /analyze  │ ◄─── POST Request                      │ │  │
│  │  │  │  endpoint  │                                         │ │  │
│  │  │  └─────┬──────┘                                         │ │  │
│  │  │        │                                                 │ │  │
│  │  │        ▼                                                 │ │  │
│  │  │  ┌─────────────────┐       ┌──────────────────────┐   │ │  │
│  │  │  │  AuthDetector   │       │ AgenticAuthDetector  │   │ │  │
│  │  │  │  (scraper.py)   │       │    (agent.py)        │   │ │  │
│  │  │  └────┬────────────┘       └──────────┬───────────┘   │ │  │
│  │  │       │                                │               │ │  │
│  │  │       ├──► JS-Heavy Check              │               │ │  │
│  │  │       │                                │               │ │  │
│  │  │       ├──► Playwright Rendering ◄──────┤               │ │  │
│  │  │       │    (Browser Automation)        │               │ │  │
│  │  │       │                                │               │ │  │
│  │  │       ├──► BeautifulSoup Parsing       │               │ │  │
│  │  │       │    (HTML Analysis)             │               │ │  │
│  │  │       │                                │               │ │  │
│  │  │       ├──► Component Detection         │               │ │  │
│  │  │       │    (9 Methods)                 │               │ │  │
│  │  │       │                                │               │ │  │
│  │  │       └──► CAPTCHA Detection           │               │ │  │
│  │  │                                        │               │ │  │
│  │  │                   ▼                    ▼               │ │  │
│  │  │       ┌────────────────────────────────────┐          │ │  │
│  │  │       │    Google Gemini API Call          │          │ │  │
│  │  │       │  (AI Analysis & Validation)        │          │ │  │
│  │  │       └────────────────────────────────────┘          │ │  │
│  │  │                        │                               │ │  │
│  │  └────────────────────────┼───────────────────────────────┘ │  │
│  │                           │                                 │  │
│  │  ┌────────────────────────▼───────────────────────────────┐ │  │
│  │  │            Chromium Browser (Playwright)               │ │  │
│  │  │  - Headless rendering                                  │ │  │
│  │  │  - Anti-detection measures                             │ │  │
│  │  │  - JavaScript execution                                │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Environment Variables:                                              │
│  • GEMINI_API_KEY                                                   │
│  • FRONTEND_URL (CORS)                                              │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │ API Call
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Google AI Platform                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Gemini 1.5 Flash Model                           │  │
│  │  • Component validation                                       │  │
│  │  • Confidence scoring (1-10)                                  │  │
│  │  • Detailed analysis generation                               │  │
│  │  • Markdown-formatted output                                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components (React + Vite)

```
frontend/
├── src/
│   ├── App.jsx                 # Main application component
│   │   ├── State Management    # Results, loading, errors
│   │   ├── CORS Handling       # API communication
│   │   └── Layout              # Header, main, footer
│   │
│   ├── components/
│   │   ├── Header.jsx          # App title and description
│   │   ├── SingleUrlAnalyzer.jsx
│   │   │   ├── URL Input       # Text field for URL
│   │   │   ├── Example Chips   # Quick test buttons
│   │   │   ├── Validation      # URL format check
│   │   │   └── Submit Handler  # API call trigger
│   │   │
│   │   ├── ResultCard.jsx
│   │   │   ├── Status Display  # Found/Not Found/CAPTCHA
│   │   │   ├── CAPTCHA Warning # Bot protection alert
│   │   │   ├── Details Grid    # Component metadata
│   │   │   ├── Markdown Render # ReactMarkdown with GFM
│   │   │   └── HTML Snippet    # Beautified code display
│   │   │
│   │   └── LoadingSpinner.jsx  # Analyzing animation
│   │
│   └── services/
│       └── api.js              # Axios HTTP client
│           ├── analyzeUrl()    # POST /analyze
│           └── Error Handling  # Network/server errors
```

### Backend Components (Python + FastAPI)

```
backend/
├── main.py                     # FastAPI application
│   ├── CORS Middleware         # Frontend access control
│   ├── /analyze endpoint       # Main API route
│   ├── Error Handling          # Try-catch wrapper
│   └── Environment Config      # dotenv loading
│
├── scraper.py                  # Core detection engine
│   ├── AuthDetector class
│   │   ├── detect()            # Main entry point
│   │   ├── _detect_simple()    # Traditional HTML
│   │   ├── _detect_with_playwright_simple()
│   │   │   ├── Browser Launch  # Chromium instance
│   │   │   ├── Page Navigation # URL loading
│   │   │   ├── Anti-detection  # Webdriver hiding
│   │   │   └── Content Extract # HTML retrieval
│   │   │
│   │   ├── _is_js_heavy_page()
│   │   │   ├── Domain Check    # Known JS sites
│   │   │   ├── Script Analysis # Count & patterns
│   │   │   ├── Framework Check # React/Vue/Angular
│   │   │   └── Score Calculation
│   │   │
│   │   ├── _check_captcha()
│   │   │   ├── Text Indicators # "verify you are human"
│   │   │   ├── Service Names   # DataDome, PerimeterX
│   │   │   └── Challenge Pages # Cloudflare, reCAPTCHA
│   │   │
│   │   └── _traditional_detection()
│   │       ├── Password Inputs # type="password"
│   │       ├── Form Classes    # login/signin/auth
│   │       ├── Username Fields # name="username"
│   │       ├── Email Fields    # name="email"
│   │       └── Submit Buttons  # type="submit"
│   │
│   └── Detection Methods (9 total)
│       1. Password input fields
│       2. Login form classes
│       3. Username/password pairs
│       4. WordPress-style fields
│       5. Email fields
│       6. Action URLs (/login, /signin)
│       7. Submit buttons
│       8. OAuth buttons
│       9. Social login links
│
└── agent.py                    # AI enhancement layer
    └── AgenticAuthDetector class
        ├── detect_with_agents()     # Orchestrator
        ├── _enhance_static_results() # AI validation
        │   ├── Gemini API Call
        │   ├── Confidence Scoring
        │   └── Analysis Generation
        └── Error Fallback          # Graceful degradation
```

---

## Data Flow

### Request Flow (Analysis Pipeline)

```
┌──────────────┐
│  User Input  │
│   (URL)      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Frontend (SingleUrlAnalyzer)            │
│  • Validate URL format                   │
│  • Add https:// if missing               │
│  • Clear previous results                │
│  • Show loading animation                │
└──────┬───────────────────────────────────┘
       │
       │ HTTP POST /analyze
       │ { url: "https://example.com/login" }
       ▼
┌──────────────────────────────────────────┐
│  Backend (FastAPI /analyze)              │
│  • CORS validation                       │
│  • Check for CAPTCHA in response         │
│  • Early return if blocked               │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  AuthDetector.detect()                   │
│  • Check if JS-heavy                     │
│    ├─ Yes → Playwright rendering         │
│    └─ No  → Traditional scraping         │
└──────┬───────────────────────────────────┘
       │
       ├─────────────────────┬──────────────────────┐
       ▼                     ▼                      ▼
┌──────────────┐   ┌──────────────┐    ┌──────────────────┐
│  Traditional │   │  Playwright  │    │  CAPTCHA Check   │
│   Scraping   │   │   Rendering  │    │                  │
│              │   │              │    │  • DataDome      │
│ • requests   │   │ • Launch     │    │  • PerimeterX    │
│   library    │   │   Chrome     │    │  • Cloudflare    │
│ • Fast       │   │ • Execute JS │    │  • reCAPTCHA     │
│ • Simple     │   │ • Get HTML   │    │                  │
└──────┬───────┘   └──────┬───────┘    └────────┬─────────┘
       │                  │                     │
       └──────────────────┴─────────────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │  BeautifulSoup Parse │
               │  • Parse HTML        │
               │  • Find forms        │
               │  • Extract inputs    │
               └──────────┬───────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │ Component Detection  │
               │ (9 methods)          │
               │  ✓ Password fields   │
               │  ✓ Username fields   │
               │  ✓ Email fields      │
               │  ✓ Submit buttons    │
               │  ✓ Form actions      │
               │  ✓ Login classes     │
               │  ✓ OAuth buttons     │
               │  ✓ Social logins     │
               │  ✓ CAPTCHA presence  │
               └──────────┬───────────┘
                          │
       ┌──────────────────┴────────────────────┐
       │                                       │
       ▼                                       ▼
┌─────────────┐                    ┌──────────────────┐
│ Not Found   │                    │ Components Found │
│  Return:    │                    │                  │
│  • found=0  │                    │    Proceed to    │
│  • message  │                    │  AI Enhancement  │
└─────────────┘                    └────────┬─────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │ AgenticAuthDetector      │
                              │ • Validate components    │
                              │ • Score confidence       │
                              └────────┬─────────────────┘
                                       │
                                       ▼
                              ┌──────────────────────────┐
                              │  Google Gemini API       │
                              │  • Send components JSON  │
                              │  • Get AI analysis       │
                              │  • Receive markdown      │
                              └────────┬─────────────────┘
                                       │
                                       ▼
                              ┌──────────────────────────┐
                              │  Response Assembly       │
                              │  {                       │
                              │    url,                  │
                              │    found: true,          │
                              │    components: [...],    │
                              │    ai_analysis: "...",   │
                              │    method: "static"      │
                              │  }                       │
                              └────────┬─────────────────┘
                                       │
                                       ▼
                              ┌──────────────────────────┐
                              │  Frontend (ResultCard)   │
                              │  • Display status        │
                              │  • Render markdown       │
                              │  • Show HTML snippet     │
                              │  • Display metadata      │
                              └──────────────────────────┘
```

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERNET / END USERS                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌─────────────────────┐          ┌─────────────────────────────┐
│  VERCEL CDN EDGE    │          │  DigitalOcean Load Balancer│
│  (Frontend)         │          │  (Optional - Future)       │
│                     │          └─────────────┬───────────────┘
│  • Global CDN       │                        │
│  • Auto SSL         │                        ▼
│  • DDoS Protection  │          ┌─────────────────────────────┐
│  • Git Integration  │          │  Ubuntu 22.04 Droplet       │
└─────────┬───────────┘          │  IP: 159.89.141.33          │
          │                      │                             │
          │                      │  ┌────────────────────────┐ │
          │                      │  │  Nginx (Reverse Proxy) │ │
          │                      │  │  Port: 80, 443         │ │
          │                      │  │  SSL: Let's Encrypt    │ │
          │                      │  └──────────┬─────────────┘ │
          │                      │             │               │
          │                      │  ┌──────────▼─────────────┐ │
          │                      │  │  Docker Container      │ │
          │                      │  │                        │ │
          │                      │  │  ┌──────────────────┐ │ │
          │ HTTPS API Calls      │  │  │  FastAPI App     │ │ │
          └──────────────────────┼──┼──┤  Port: 8000      │ │ │
                                 │  │  │                  │ │ │
                                 │  │  │  ┌────────────┐ │ │ │
                                 │  │  │  │ Chromium   │ │ │ │
                                 │  │  │  │ (Headless) │ │ │ │
                                 │  │  │  └────────────┘ │ │ │
                                 │  │  └──────────────────┘ │ │
                                 │  └────────────────────────┘ │
                                 │                             │
                                 │  UFW Firewall:              │
                                 │  • Port 22 (SSH)            │
                                 │  • Port 80 (HTTP)           │
                                 │  • Port 443 (HTTPS)         │
                                 │  • Port 8000 (Blocked ext.) │
                                 └─────────────────────────────┘
```

### Deployment Details

#### Frontend - Vercel
- **URL**: `https://getcovered-assessment-one.vercel.app/`
- **Region**: Global (CDN Edge Locations)
- **Build**: Automatic on git push to main branch
- **Environment**:
  - `VITE_API_URL`: Backend API endpoint
- **Features**:
  - Automatic HTTPS/SSL
  - Global CDN
  - Preview deployments for PRs
  - Instant rollbacks
  - Custom domains support

#### Backend - DigitalOcean Droplet
- **Provider**: DigitalOcean
- **Location**: Choose nearest datacenter (e.g., NYC, SFO, AMS)
- **Instance**: Basic Droplet
  - **Size**: 1GB RAM, 1 vCPU ($6/month)
  - **OS**: Ubuntu 22.04 LTS
  - **Storage**: 25GB SSD
- **IP Address**: Static (e.g., 159.89.141.33)
- **Domain** (Optional): DuckDNS subdomain with SSL
- **Container**: Docker
  - Base Image: Python 3.11-slim
  - Dependencies: All from requirements.txt
  - Browser: Chromium (via Playwright)
- **Environment Variables**:
  - `GEMINI_API_KEY`: Google AI API key
  - `FRONTEND_URL`: Vercel frontend URL (CORS)
- **Reverse Proxy**: Nginx
  - HTTP → HTTPS redirect
  - Proxy to localhost:8000
  - SSL termination
  - Request buffering
  - Timeout: 120s

### External Services

#### Google AI Platform
- **Service**: Gemini API
- **Model**: gemini-pro
- **Endpoint**: `https://generativelanguage.googleapis.com`
- **Authentication**: API Key (Bearer token)
- **Rate Limits**: 
  - Free tier: 60 requests/minute
  - Consider paid tier for production
- **Cost**: 
  - Free tier available
  - Pay-as-you-go pricing for scale

#### GitHub
- **Repository**: `Namith-Telkar/getcovered_assessment`
- **Branch**: main
- **Integration**: 
  - Vercel auto-deploy
  - Git push triggers rebuild
- **Webhooks**: Vercel deployment triggers

---

## Technology Stack

### Frontend Stack
```
┌─────────────────────────────────────────────┐
│  Framework & Build                          │
│  • React 18.3.1 (UI Library)                │
│  • Vite 5.2.11 (Build Tool)                 │
│  • JSX (Component Syntax)                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Styling                                    │
│  • Tailwind CSS 3.4.3 (Utility-first CSS)   │
│  • PostCSS 8.4.38 (CSS Processing)          │
│  • Autoprefixer 10.4.19 (Browser compat)    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  HTTP & Rendering                           │
│  • Axios 1.7.2 (HTTP Client)                │
│  • React-Markdown 10.1.0 (MD Rendering)     │
│  • Remark-GFM 4.0.1 (GitHub MD support)     │
│  • js-beautify 1.15.4 (Code formatting)     │
└─────────────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────────────┐
│  Framework & Server                         │
│  • FastAPI 0.109.0+ (Web Framework)         │
│  • Uvicorn 0.27.0+ (ASGI Server)            │
│  • Pydantic 2.10.0+ (Data Validation)       │
│  • Python 3.11 (Runtime)                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Web Scraping & Parsing                     │
│  • Requests 2.31.0+ (HTTP Library)          │
│  • BeautifulSoup4 4.12.2+ (HTML Parser)     │
│  • Playwright 1.48.0+ (Browser Automation)  │
│  • Chromium (Headless Browser)              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  AI & Machine Learning                      │
│  • google-generativeai 0.8.0+ (Gemini SDK)  │
│  • Gemini 1.5 Pro Model                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Utilities                                  │
│  • python-dotenv 1.0.0+ (Env vars)          │
│  • asyncio (Async support)                  │
│  • re (Regex)                               │
│  • json (JSON handling)                     │
└─────────────────────────────────────────────┘
```

### Infrastructure
```
┌─────────────────────────────────────────────┐
│  Hosting                                    │
│  • Vercel (Frontend CDN)                    │
│  • DigitalOcean (Backend Droplet)           │
│  • DuckDNS (Free Domain - Optional)         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Containerization & Proxy                   │
│  • Docker (Container Runtime)               │
│  • Nginx (Reverse Proxy)                    │
│  • Let's Encrypt (SSL Certificates)         │
│  • Certbot (Cert Management)                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Version Control & CI/CD                    │
│  • Git (Version Control)                    │
│  • GitHub (Repository)                      │
│  • Vercel Auto-Deploy (CI/CD)               │
└─────────────────────────────────────────────┘
```

---

## Security Considerations

### Frontend Security
- ✅ HTTPS enforced by Vercel
- ✅ CSP headers configured
- ✅ XSS protection via React
- ✅ CORS restricted to backend domain
- ✅ No sensitive data in client code
- ✅ Environment variables for config

### Backend Security
- ✅ API key stored in environment variables
- ✅ CORS middleware configured
- ✅ Rate limiting recommended
- ✅ Input validation with Pydantic
- ✅ Firewall rules (UFW) active
- ✅ SSH key authentication
- ✅ Regular security updates
- ✅ Docker isolation
- ✅ Non-root user in container

### API Security
- ✅ Gemini API key rotation supported
- ✅ HTTPS for all API calls
- ✅ Request timeout limits
- ✅ Error message sanitization
- ⚠️ Consider API gateway for production

---

## Performance Characteristics

### Response Times
- **Static HTML sites**: 2-5 seconds
- **JS-heavy sites (Playwright)**: 10-30 seconds
- **CAPTCHA detection**: 15-30 seconds (early exit)
- **AI analysis**: +2-5 seconds (Gemini API)

### Resource Usage
- **Memory**: 500MB-1GB (with Chromium)
- **CPU**: 50-100% during Playwright rendering
- **Network**: 1-10MB per analysis
- **Storage**: ~2GB (Docker + Chromium)

### Scalability Considerations
- **Concurrent Requests**: Limited by single droplet
- **Recommended**: Add load balancer for >10 req/s
- **Bottleneck**: Playwright (browser instances)
- **Solution**: Horizontal scaling with multiple droplets

---

## Monitoring & Logging

### Current Logging
```python
# Backend console logs
print(f"🔍 Analyzing {url}")
print(f"✅ Found {len(components)} components")
print(f"❌ Error: {error}")
```

### Recommended for Production
- **Application Logs**: CloudWatch, Datadog, or Sentry
- **Access Logs**: Nginx logs
- **Error Tracking**: Sentry for exceptions
- **Uptime Monitoring**: UptimeRobot or Pingdom
- **Performance**: New Relic or Datadog APM
- **Cost Tracking**: DigitalOcean + Vercel dashboards

---

## Future Enhancements

### Architecture Improvements
1. **Caching Layer**: Redis for repeated URLs
2. **Queue System**: Celery for async processing
3. **Database**: PostgreSQL for history
4. **Load Balancer**: Nginx + multiple backends
5. **CDN**: CloudFlare for static assets
6. **API Gateway**: Kong or AWS API Gateway

### Feature Additions
1. **Authentication**: User accounts
2. **History**: Save past analyses
3. **Batch Processing**: Multiple URLs
4. **Webhooks**: Notify on completion
5. **Export**: PDF/CSV reports
6. **Scheduling**: Periodic checks

---

## Cost Breakdown

### Monthly Costs
- **Vercel**: $0 (Hobby tier)
- **DigitalOcean**: $6 (1GB droplet)
- **Google Gemini**: $0-$5 (free tier usually sufficient)
- **Domain** (optional): $12/year (~$1/month)
- **SSL**: $0 (Let's Encrypt free)

**Total: ~$6-12/month**

### Cost Optimization
- Use free Gemini tier (60 req/min)
- Implement caching to reduce API calls
- Use smaller droplet if traffic is low
- Consider serverless for sporadic usage

---

## References

- **Frontend Repo**: https://github.com/Namith-Telkar/getcovered_assessment/tree/main/frontend
- **Backend Repo**: https://github.com/Namith-Telkar/getcovered_assessment/tree/main/backend
- **Live Demo**: https://getcovered-assessment-one.vercel.app/
- **API Docs**: http://YOUR_DROPLET_IP:8000/docs (FastAPI auto-docs)

---

*Last Updated: October 15, 2025*
