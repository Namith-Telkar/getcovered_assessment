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

## References

- **Live Demo**: https://getcovered-assessment-one.vercel.app/

---

_Last Updated: October 15, 2025_
