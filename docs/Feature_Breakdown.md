# Trendora — Feature Breakdown

## Core Features

### 1. 🔐 User Authentication
- Email/password registration with bcrypt hashing
- JWT-based session tokens (7-day expiry)
- Token middleware for protected routes

### 2. 📈 Trend Discovery
- Real-time trending topic fetching via Google Trends (PyTrends)
- Niche-based filtering: Tech, Finance, Lifestyle, Health
- Curated fallback trends when PyTrends is rate-limited
- Database caching with configurable TTL
- Trend volume and velocity tracking

### 3. 🔥 Virality Scoring Engine
- Multi-factor scoring algorithm (0–100 scale):
  - **Search Volume** — 40 points max
  - **Velocity/Momentum** — 30 points max
  - **Competition Level** (via YouTube search) — 30 points max
- Confidence classification: Very High / High / Medium / Low
- Score breakdown per factor

### 4. 🤖 AI Content Generation
- Powered by Google Gemini 2.0 Flash
- Generates:
  - 60-second TikTok/YouTube Shorts scripts (hook, body, CTA, visual cues)
  - Blog outlines (title, hook, sections, conclusion)
  - Multiple hook variations (curiosity, controversy, value-promise)
  - Relevant hashtag suggestions
- JSON-structured output with markdown code block parsing

### 5. ✍️ Style Cloning (AI Voice Matching)
- Analyzes user's past content to build a style profile:
  - Tone, vocabulary level, sentence structure
  - Humor style, emoji usage, pacing, perspective
  - Signature phrases and key characteristics
- Generates new content matching the user's unique voice
- Style profile stored in database per user

### 6. 🕳️ Trend Gap Analysis
- Track competitor YouTube channels per niche
- Analyze which trending topics competitors haven't covered
- Gap scoring: `(1 - coverage_ratio) × normalized_volume`
- Ranked opportunity list (High / Medium / Low)
- Database persistence for historical gap tracking

### 7. 🔮 Predictive Forecasting
- ML-powered trend trajectory predictions (scikit-learn LinearRegression)
- 14-day historical data analysis
- Outputs:
  - 7-day volume prediction
  - Growth rate and confidence score (R²)
  - Predicted peak date
  - Actionable recommendation (Act Now / Create Soon / Declining)
- Batch prediction for all trends in a niche
- Cached predictions in database

### 8. 📅 Content Calendar
- Save generated content to a scheduled calendar
- Date and time scheduling
- Status management (scheduled/published/draft)

---

## Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `cron_archiver.py` | Daily | Archives trending data to `trends_history` table |
| `cron_predictions.py` | Daily | Runs batch predictions for all niches |

---

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/` | Email/password authentication |
| Dashboard | `/dashboard` | Trend grid with niche selector, content generator, style trainer |
| Gap Analysis | `/gap-analysis` | Competitor tracking and gap opportunity finder |
| Predictions | `/predictions` | ML forecasting dashboard with growth recommendations |
