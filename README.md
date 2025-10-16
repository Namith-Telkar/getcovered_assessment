# 🔐## What It Does

Enter any website URL and get:

- ✅ Authentication components detected (login forms, password fields, etc.)
- 🤖 AI-powered analysis with confidence scoring
- 📊 Detailed breakdown of each component
- 🚫 CAPTCHA detection alerts
- ⚡ Redis caching for 100-600x faster repeat requestsication Component Detector

Detect authentication components on any website using AI-powered analysis.

## What It Does

Enter any website URL and get:

- ✅ Authentication components detected (login forms, password fields, etc.)
- 🤖 AI-powered analysis with confidence scoring
- 📊 Detailed breakdown of each component
- � CAPTCHA detection alerts

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + Playwright + Google Gemini AI + Redis
- **Deployment**: Vercel (frontend) + DigitalOcean (backend)

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Google Gemini API key](https://makersuite.google.com/app/apikey) (free)

### Installation

```bash
# Clone repository
git clone https://github.com/Namith-Telkar/getcovered_assessment.git
cd getcovered_assessment

# Backend setup
cd backend
pip install -r requirements.txt
playwright install chromium

# Create .env file and add your GEMINI_API_KEY
cp .env.example .env

# Optional: Start Redis for caching (100-600x faster repeat requests)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start backend (http://localhost:8000)
uvicorn main:app --reload

# Frontend setup (in new terminal)
cd frontend
npm install

# Start frontend (http://localhost:5173)
npm run dev
```

## Usage

1. Open `http://localhost:5173`
2. Enter a URL (e.g., `https://github.com/login`)
3. Click "Analyze"
4. View detected components and AI analysis

## Deployment

Deploy to production in ~30 minutes:

**Frontend** → Vercel

- Connect GitHub repo
- Auto-deploy on push

**Backend** → DigitalOcean

- Docker container
- SSL with Let's Encrypt
- Redis caching (optional but recommended)

📖 **Full guides**: [DEPLOYMENT.md](./DEPLOYMENT.md) | [HTTPS-SETUP.md](./HTTPS-SETUP.md) | [REDIS-SETUP.md](./REDIS-SETUP.md)

## Project Structure

```
auth-detector-webapp/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── scraper.py           # Detection engine
│   ├── agent.py             # AI analysis
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── package.json
└── README.md
```

## Author

**Namith Telkar**

- GitHub: [@Namith-Telkar](https://github.com/Namith-Telkar)
- Repository: [getcovered_assessment](https://github.com/Namith-Telkar/getcovered_assessment)

## License

MIT License - See LICENSE file for details

---
