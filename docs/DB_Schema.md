# Trendora — Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ generated_content : creates
    users ||--o{ content_calendar : schedules
    users ||--o{ competitor_channels : tracks
    users ||--o{ trend_gaps : discovers
    generated_content ||--o{ content_calendar : scheduled_in

    users {
        SERIAL id PK
        VARCHAR email UK
        VARCHAR password_hash
        TEXT_ARRAY selected_niches
        BOOLEAN style_trained
        TEXT style_profile
        TIMESTAMP created_at
    }

    trends {
        SERIAL id PK
        VARCHAR keyword
        VARCHAR niche
        INT volume
        VARCHAR velocity
        INT virality_score
        TIMESTAMP fetched_at
    }

    generated_content {
        SERIAL id PK
        INT user_id FK
        VARCHAR trend_keyword
        VARCHAR content_type
        TEXT script_text
        TEXT_ARRAY hooks
        TEXT_ARRAY hashtags
        TIMESTAMP created_at
    }

    content_calendar {
        SERIAL id PK
        INT user_id FK
        INT content_id FK
        DATE scheduled_date
        TIME scheduled_time
        VARCHAR status
        TIMESTAMP created_at
    }

    trends_history {
        SERIAL id PK
        VARCHAR keyword
        VARCHAR niche
        INT volume
        VARCHAR velocity
        DATE snapshot_date
    }

    predicted_trends {
        SERIAL id PK
        VARCHAR keyword
        VARCHAR niche
        INT current_volume
        INT predicted_volume
        FLOAT growth_rate
        FLOAT confidence_score
        DATE predicted_peak_date
        TIMESTAMP prediction_made_at
    }

    competitor_channels {
        SERIAL id PK
        INT user_id FK
        VARCHAR channel_id
        VARCHAR channel_name
        VARCHAR niche
    }

    trend_gaps {
        SERIAL id PK
        INT user_id FK
        VARCHAR keyword
        VARCHAR niche
        INT volume
        INT competitor_coverage
        FLOAT gap_score
    }
```

## Table Details

### Core Tables

| Table | Purpose | Row Growth |
|-------|---------|------------|
| `users` | User accounts and style profiles | Slow (per registration) |
| `trends` | Cached trending topics with virality scores | Medium (per niche fetch) |
| `generated_content` | AI-generated scripts, hooks, hashtags | Medium (per generation) |
| `content_calendar` | Scheduled content items | Medium (per save) |

### Analytics Tables

| Table | Purpose | Row Growth |
|-------|---------|------------|
| `trends_history` | Daily trend snapshots for ML training | Fast (daily cron × keywords) |
| `predicted_trends` | ML-generated forecasts | Fast (daily cron × keywords) |
| `competitor_channels` | Tracked YouTube channels | Slow (per add) |
| `trend_gaps` | Gap analysis results | Medium (per analysis run) |

## Unique Constraints

| Table | Unique Constraint |
|-------|-------------------|
| `users` | `email` |
| `trends` | `(keyword, niche, fetched_at)` |
| `trends_history` | `(keyword, niche, snapshot_date)` |
| `predicted_trends` | `(keyword, niche, prediction_made_at)` |

## Foreign Key Relationships

| Child Table | Column | References |
|-------------|--------|------------|
| `generated_content` | `user_id` | `users.id` |
| `content_calendar` | `user_id` | `users.id` |
| `content_calendar` | `content_id` | `generated_content.id` |
| `competitor_channels` | `user_id` | `users.id` |
| `trend_gaps` | `user_id` | `users.id` |
