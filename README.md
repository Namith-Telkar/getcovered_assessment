# AI-Powered Authentication Component Detector

A web application that uses AI (Google Gemini) to detect authentication components on websites.

## Features

- Web scraping with intelligent authentication detection
- AI-powered HTML analysis using Google Gemini
- React frontend with real-time results
- Handles multi-step login flows
- **Dynamic JavaScript detection** - automatically detects if a page needs JS rendering
- **JavaScript rendering** for modern SPAs (Instagram, Twitter, WordPress, etc.)
- **9 detection methods** for maximum accuracy

## Setup

### Prerequisites

**Get a Gemini API Key:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Create a `.env` file in the `backend/` directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

### Backend

```bash
cd backend
pip install -r requirements.txt

# Install Playwright browsers (required for JavaScript-heavy sites like Instagram)
playwright install chromium
python -m playwright install chromium

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Enter a website URL
2. Click "Analyze"
3. View detected authentication components
