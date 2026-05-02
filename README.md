# Trendora 🚀

**AI-Powered Trend Intelligence Platform for Content Creators**

Trendora helps content creators discover trending topics, analyze competitor gaps, and generate viral content using AI.

## 🚀 Live Demo
**Link:** (https://trendora-ojt.vercel.app/)
*To easily test the platform without registering, you can use these demo credentials:*
- **Email:** `demo@trendora.com`
- **Password:** `demo123`

## Tech Stack
- **Backend**: Python / Flask / PostgreSQL
- **Frontend**: React / Tailwind CSS / Framer Motion / Recharts
- **AI**: Groq API (Llama 3)
- **APIs**: Google Trends, YouTube Data API
- **Deployment**: Render (backend) + Vercel (frontend)

## Features
- 📊 Real-time trend tracking across niches
- 🏆 Community Leaderboard for top saved trends
- 📝 Saved Trends with AI note generation
- ✨ AI-powered 60-second video script generation
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

### Environment Variables (.env)
You must configure the following keys in your backend `.env` file (or your hosting provider like Render):
- `DATABASE_URL`: PostgreSQL connection string
- `GROQ_API_KEY`: Groq API key (required for lightning-fast Llama 3 AI summaries)
- `YOUTUBE_API_KEY`: YouTube Data API v3 key
- `SECRET_KEY`: Flask session secret key

### Frontend
```bash
cd frontend
npm install
npm start
```

## Team
- Eimun Akitpurti
