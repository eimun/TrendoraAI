# Trendora — User Flow Diagram

This diagram visualizes the end-to-end journey of a user interacting with the Trendora platform, using distinct shapes to represent different elements (User = Circle, UI/Pages = Rounded Boxes, Actions/Inputs = Parallelograms, Decisions = Diamonds, Databases/Storage = Cylinders).

```mermaid
flowchart TD
    %% Define Shapes
    U((👤 User))
    LP([Landing Page])
    REG{Has Account?}
    DASH([Dashboard])
    
    %% Flows
    U --> LP
    LP --> REG
    REG -- No --> SIGNUP[/Sign Up Form/]
    REG -- Yes --> LOGIN[/Login Form/]
    
    SIGNUP -->|JWT Token| DASH
    LOGIN -->|JWT Token| DASH
    
    subgraph "Core Platform Features"
        direction TB
        
        %% Trend Gen Flow
        T_NICHE{Select Niche?}
        T_VIEW[[View Scored Trends]]
        T_GEN([Click Generate])
        T_RES[/AI Content Script/]
        T_CAL[(Save to Calendar)]
        
        %% Style Flow
        S_PAGE([Style Trainer])
        S_INPUT[/Paste Sample Content/]
        S_PROF[(Style Profile Database)]
        
        %% Gap Flow
        G_PAGE([Gap Analysis])
        G_INPUT[/Add Competitor URLs/]
        G_CALC{{Calculate Coverage}}
        G_RES[[View Missed Trends]]
        
        %% Prediction Flow
        P_PAGE([Predictions])
        P_ML{{Run ML Model}}
        P_RES[[View 7-Day Forecast]]
    end
    
    DASH -->|Browse Trends| T_NICHE
    T_NICHE --> T_VIEW
    T_VIEW --> T_GEN
    T_GEN --> T_RES
    T_RES --> T_CAL
    
    DASH -->|Train Voice| S_PAGE
    S_PAGE --> S_INPUT
    S_INPUT --> S_PROF
    
    DASH -->|Analyze Competitors| G_PAGE
    G_PAGE --> G_INPUT
    G_INPUT --> G_CALC
    G_CALC --> G_RES
    
    DASH -->|Forecast Longevity| P_PAGE
    P_PAGE --> P_ML
    P_ML --> P_RES
    
    T_CAL -.-> DASH
    S_PROF -.-> DASH
    G_RES -.-> DASH
    P_RES -.-> DASH
```

## Key User Journeys

### 1. The Content Creator Flow
1. User logs in and lands on the **Dashboard**.
2. Selects their niche (e.g., "Tech").
3. Browses the top virality-scored trends.
4. Clicks "Generate Content" on a promising trend.
5. Gets an AI-generated script, hooks, and hashtags for a YouTube Short/TikTok.
6. Saves the item to their Content Calendar.

### 2. The Voice Cloning Flow
1. User navigates to the **Style Trainer**.
2. Pastes examples of their past successful posts or scripts.
3. Trendora analyzes and saves a unique "Style Profile" (tone, pacing, vocabulary).
4. From now on, any generated content uses their personalized voice.

### 3. The Strategist Flow
1. User goes to **Gap Analysis**.
2. Enters their top competitors' YouTube channel URLs.
3. Trendora cross-references trending topics with competitor videos.
4. User finds "High Opportunity" gaps (topics their competitors haven't covered yet).
5. User navigates to **Predictions** to see if that topic will continue growing over the next 7 days before filming.
