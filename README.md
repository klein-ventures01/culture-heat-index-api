# Cultural Heat Index API

A comprehensive brand analysis tool that evaluates cultural relevance across music, fashion, sports, and social media.

## Setup for Railway Deployment

### 1. Environment Variables
Set these in your Railway dashboard:

```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
PORT=3000
```

Optional authentication:
```
PUBLIC_TOKEN=your_secret_token_here
```

### 2. Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js project
3. Set the environment variables in the Railway dashboard
4. Deploy!

### 3. Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start the API server
npm start

# Or for development with auto-reload
npm run dev
```

### 4. Frontend Development

The frontend is served by Vite and proxies API calls to the Express server:

```bash
# Start Vite dev server (serves frontend)
npm run dev

# In another terminal, start the API server
npm start
```

## API Endpoints

### POST /api/chi/report
Generates a cultural heat index report for a brand.

**Request:**
```json
{
  "brand": "Nike"
}
```

**Response:**
```json
{
  "brand": "Nike",
  "logo": "https://example.com/logo.png",
  "overallScore": 85.5,
  "confidence": "High",
  "summary": "Nike maintains strong cultural relevance...",
  "momentum": [
    {"label": "Social Media", "delta": "+12%"},
    {"label": "Celebrity Endorsements", "delta": "+8%"}
  ],
  "sources": [
    {"url": "https://example.com/source1"}
  ],
  "competitive": [
    {"brand": "Adidas", "overall": 78.2, "summary": "Strong competitor..."}
  ]
}
```

## Features

- Real-time brand analysis using OpenAI
- Cultural relevance scoring across multiple dimensions
- Momentum tracking and competitive analysis
- Clean, responsive web interface
- Railway-optimized deployment configuration

## Tech Stack

- **Backend**: Node.js, Express, OpenAI API
- **Frontend**: Vanilla HTML/CSS/JS with Vite
- **Deployment**: Railway
- **AI**: OpenAI GPT-4