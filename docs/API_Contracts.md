# Trendora — API Contracts

**Base URL:** `https://your-render-url.onrender.com`

---

## Authentication

### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOi...",
  "user_id": 1
}
```

**Errors:**
- `400` — Email and password required / Email already exists

---

### POST `/api/auth/login`
Authenticate an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOi...",
  "user_id": 1
}
```

**Errors:**
- `401` — Invalid credentials

---

## Trends

> 🔒 All endpoints below require `Authorization: Bearer <token>` header.

### POST `/api/trends/fetch`
Fetch trending topics for a niche.

**Request:**
```json
{
  "niche": "tech"
}
```

**Response (200):**
```json
{
  "trends": [
    {
      "keyword": "AI Agents",
      "niche": "tech",
      "volume": 950000,
      "velocity": "rising_fast",
      "virality_score": 85,
      "fetched_at": "2026-02-24T06:15:00"
    }
  ]
}
```

---

## Content Generation

### POST `/api/generate/script`
Generate AI-powered content scripts.

**Request:**
```json
{
  "keyword": "AI Agents",
  "type": "video",
  "use_style": true
}
```

**Response (200):**
```json
{
  "script": {
    "hook": "Stop scrolling — AI Agents are changing everything...",
    "body": "Here's what you need to know...",
    "cta": "Follow for more tech breakdowns!",
    "visual_cues": ["close-up", "screen recording", "talking head"]
  },
  "hooks": [
    "You won't believe what AI can do now",
    "Why every creator needs AI Agents",
    "How to use AI Agents to 10x your content"
  ],
  "hashtags": ["#AIAgents", "#Tech", "#Viral", "#AI"]
}
```

---

## Content Calendar

### POST `/api/calendar/save`
Save generated content to the calendar.

**Request:**
```json
{
  "content_id": 1,
  "scheduled_date": "2026-03-01",
  "scheduled_time": "14:00"
}
```

**Response (201):**
```json
{
  "message": "Content scheduled successfully",
  "calendar_id": 5
}
```

### GET `/api/calendar/list`
Retrieve all scheduled content.

**Response (200):**
```json
{
  "calendar": [
    {
      "id": 5,
      "content_id": 1,
      "trend_keyword": "AI Agents",
      "scheduled_date": "2026-03-01",
      "scheduled_time": "14:00",
      "status": "scheduled"
    }
  ]
}
```

---

## Gap Analysis

### POST `/api/gaps/add-competitor`
Track a competitor YouTube channel.

**Request:**
```json
{
  "channel_id": "UC...",
  "channel_name": "TechCreator",
  "niche": "tech"
}
```

**Response (201):**
```json
{
  "message": "Competitor added"
}
```

### POST `/api/gaps/analyze`
Run gap analysis against tracked competitors.

**Request:**
```json
{
  "niche": "tech"
}
```

**Response (200):**
```json
{
  "gaps": [
    {
      "keyword": "AI Agents",
      "volume": 950000,
      "competitor_coverage": 1,
      "total_competitors": 5,
      "gap_score": 0.76,
      "opportunity": "High"
    }
  ]
}
```

---

## Virality Scoring

### POST `/api/virality/score`
Calculate virality score for a trend.

**Request:**
```json
{
  "keyword": "AI Agents",
  "volume": 950000,
  "velocity": "rising_fast"
}
```

**Response (200):**
```json
{
  "score": 85,
  "confidence": "Very High",
  "breakdown": {
    "volume_contribution": 34,
    "velocity_contribution": 25.5,
    "competition_contribution": 25.5
  }
}
```

---

## Style Learning

### POST `/api/style/train`
Train AI on user's writing style.

**Request:**
```json
{
  "sample_texts": [
    "Here's the thing about AI — it's not replacing creators...",
    "Stop overthinking your content. Just post..."
  ]
}
```

**Response (200):**
```json
{
  "message": "Style profile trained successfully",
  "style_profile": {
    "tone": "casual",
    "vocabulary_level": "simple",
    "sentence_structure": "short",
    "humor_style": "witty",
    "emoji_usage": "minimal",
    "pacing": "fast",
    "perspective": "second-person",
    "signature_phrases": ["Here's the thing", "Stop overthinking"],
    "key_characteristics": ["direct", "motivational", "conversational"]
  }
}
```

---

## Predictive Forecasting

### POST `/api/predictions/forecast`
Generate ML predictions for a niche.

**Request:**
```json
{
  "niche": "tech"
}
```

**Response (200):**
```json
{
  "predictions": [
    {
      "keyword": "AI Agents",
      "niche": "tech",
      "current_volume": 950000,
      "predicted_volume_7d": 1425000,
      "growth_rate": 8.5,
      "confidence": 0.89,
      "predicted_peak_date": "2026-03-01",
      "recommendation": "🔥 Act NOW! Explosive growth detected."
    }
  ]
}
```

### GET `/api/predictions/cached`
Retrieve previously generated predictions.

**Query Parameters:** `?niche=tech`

**Response (200):**
```json
{
  "predictions": [...]
}
```

---

## Health Check

### GET `/api/health`
Check API status.

**Response (200):**
```json
{
  "status": "healthy",
  "message": "Trendora API is running"
}
```
