# Trendora — Low-Level Design (LLD)

## Backend Module Architecture

```mermaid
graph TB
    subgraph "Flask Application (app.py)"
        APP[app.py<br/>Flask Entry Point]
        INIT[init_db + migrations<br/>on startup]
    end

    subgraph "Authentication"
        AUTH[auth.py<br/>JWT Auth + Middleware]
    end

    subgraph "API Routes (Blueprints)"
        R_TRENDS[routes/trends.py]
        R_GEN[routes/generate.py]
        R_CAL[routes/calendar.py]
        R_GAPS[routes/gaps.py]
        R_VIR[routes/virality.py]
        R_STYLE[routes/style.py]
        R_PRED[routes/predictions.py]
    end

    subgraph "Core Services"
        TRENDS[trends_service.py<br/>PyTrends + Fallback]
        AI[ai_service.py<br/>Gemini Content Gen]
        YT[youtube_service.py<br/>YouTube Data API]
        STYLE[style_analyzer.py<br/>Voice Cloning]
        VIR[virality_scorer.py<br/>Multi-factor Scoring]
        PRED[prediction_engine.py<br/>sklearn Regression]
    end

    subgraph "Infrastructure"
        DB[database.py<br/>PostgreSQL Connection]
        CACHE[cache.py<br/>In-Memory TTL Cache]
    end

    subgraph "Background Workers"
        CRON_A[cron_archiver.py<br/>Daily Trend Snapshots]
        CRON_P[cron_predictions.py<br/>Daily Batch Predictions]
    end

    APP --> AUTH
    APP --> R_TRENDS & R_GEN & R_CAL & R_GAPS & R_VIR & R_STYLE & R_PRED

    R_TRENDS --> TRENDS
    R_GEN --> AI
    R_GAPS --> YT
    R_VIR --> VIR
    R_STYLE --> STYLE
    R_PRED --> PRED

    TRENDS --> DB & CACHE
    AI --> STYLE
    VIR --> YT
    PRED --> DB
    CRON_A --> DB & TRENDS
    CRON_P --> PRED & DB
```

## Frontend Component Hierarchy

```mermaid
graph TB
    subgraph "React Application"
        APP_JS[App.js<br/>BrowserRouter + ErrorBoundary]
    end

    subgraph "Pages"
        LOGIN[Login.jsx<br/>Auth Form]
        DASH[Dashboard.jsx<br/>Trend Grid + Generator]
        GAP[GapAnalysis.jsx<br/>Competitor Tracker]
        PREDICT[PredictiveDashboard.jsx<br/>ML Forecasts]
    end

    subgraph "Shared Components"
        NAV[Navbar.jsx<br/>Navigation Links]
        SPIN[LoadingSpinner.jsx]
        ERR[ErrorBoundary.jsx]
        STYLE_T[StyleTrainer.jsx<br/>Voice Training UI]
    end

    subgraph "Inline Components"
        CARD[TrendCard<br/>in Dashboard.jsx]
        GEN[ContentGenerator<br/>in Dashboard.jsx]
    end

    APP_JS --> LOGIN & DASH & GAP & PREDICT
    DASH --> NAV & STYLE_T & CARD
    CARD --> GEN
    GAP --> NAV
    PREDICT --> NAV
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Framework** | Flask + Blueprints | Lightweight, modular route organization |
| **Auth** | JWT (PyJWT) | Stateless, fits React SPA pattern |
| **AI Model** | Gemini 2.0 Flash | Fast, cost-effective, good JSON output |
| **ML Model** | sklearn LinearRegression | Simple, interpretable, fast inference |
| **Database** | PostgreSQL | Reliable, supports arrays, good Render integration |
| **Caching** | In-memory dict | Simple for MVP (Redis recommended for scale) |
| **Frontend State** | React useState/useEffect | Lightweight, no state library needed yet |
