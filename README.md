# Trendora 🚀

**AI-Powered Trend Intelligence Platform for Content Creators**

Trendora helps content creators discover trending topics, analyze competitor gaps, and generate viral content using AI.

## Tech Stack
- **Backend**: Python / Flask / PostgreSQL
- **Frontend**: React / Tailwind CSS / Framer Motion / Recharts
- **AI**: Google Gemini API
- **APIs**: Google Trends, YouTube Data API
- **Deployment**: Render (backend) + Vercel (frontend)

## Features
- 📊 Real-time trend tracking across niches
- 🎯 Competitor gap analysis
- 🔮 Predictive trend forecasting
- ✨ AI-powered content generation
- 🎨 Personal writing style training
- 🌙 Dark mode support
- 📱 Collapsible sidebar navigation

## Project Structure
```
Trendora/
├── backend/           # Flask API server
│   ├── routes/        # API endpoints
│   ├── migrations/    # Database migrations
│   ├── tests/         # Unit tests
│   ├── app.py         # Main application
│   ├── auth.py        # JWT authentication
│   ├── database.py    # PostgreSQL connection
│   └── ...services    # Business logic
├── frontend/          # React application
│   └── src/
│       ├── components/  # React components
│       └── config.js    # API configuration
├── docs/              # Architecture docs
└── README.md
```

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in your keys
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Team
- Eimun Akitpurti
