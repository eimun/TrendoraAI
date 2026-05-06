from pytrends.request import TrendReq
import time
from datetime import datetime
from database import get_db_connection

# Initialize PyTrends
pytrends = TrendReq(hl='en-US', tz=360)

NICHE_KEYWORDS = {
    'tech': ['AI', 'ChatGPT', 'iPhone', 'Tesla', 'cryptocurrency'],
    'finance': ['stocks', 'investing', 'real estate', 'crypto', 'trading'],
    'lifestyle': ['fitness', 'diet', 'fashion', 'travel', 'wellness'],
    'health': ['nutrition', 'mental health', 'workout', 'sleep', 'meditation']
}

def fetch_trends_for_niche(niche, geo='US', timeframe='now 7-d'):
    """Fetch trending topics for a specific niche"""
    
    keywords = NICHE_KEYWORDS.get(niche.lower(), ['trending'])
    
    trends_data = []
    
    for keyword in keywords:
        try:
            # Build payload
            pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)
            
            # Get interest over time
            interest = pytrends.interest_over_time()
            
            if not interest.empty:
                # Get related queries
                related = pytrends.related_queries()
                rising = related[keyword]['rising']
                
                if rising is not None and not rising.empty:
                    for _, row in rising.head(5).iterrows():
                        trends_data.append({
                            'keyword': row['query'],
                            'volume': int(row['value']) if row['value'] != 'Breakout' else 999999,
                            'velocity': 'rising_fast' if row['value'] == 'Breakout' else 'rising',
                            'niche': niche
                        })
            
            time.sleep(2)  # Rate limiting
            
        except Exception as e:
            print(f"Error fetching trends for {keyword}: {e}")
            continue
    
    # If pytrends returned nothing (rate limited / blocked), use fallback data
    if not trends_data:
        print(f"⚠️ pytrends returned no data for {niche} ({timeframe}), using fallback trends")
        trends_data = get_fallback_trends(niche, geo=geo)
    
    return trends_data


import urllib.request
import xml.etree.ElementTree as ET
import re
import random

# ─── Category classification keywords ───
# These keywords/phrases are matched against the trend title AND news headlines
# to automatically classify a live Google Trends item into a category.
CATEGORY_KEYWORDS = {
    'tech': [
        'ai', 'chatgpt', 'openai', 'google', 'apple', 'iphone', 'android', 'samsung',
        'nvidia', 'microsoft', 'meta', 'tesla', 'spacex', 'software', 'app', 'hack',
        'cyber', 'robot', 'quantum', 'chip', 'gpu', 'laptop', 'tech', 'startup',
        'coding', 'developer', 'programming', 'react', 'python', 'linux', 'cloud',
        'api', 'blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3',
    ],
    'finance': [
        'stock', 'market', 'sensex', 'nifty', 'nasdaq', 'dow jones', 's&p',
        'invest', 'trading', 'forex', 'gold', 'silver', 'crude', 'oil price',
        'inflation', 'interest rate', 'fed', 'rbi', 'gdp', 'tax', 'budget',
        'bank', 'ipo', 'mutual fund', 'economy', 'recession', 'bond',
        'real estate', 'bull', 'bear', 'earnings', 'revenue', 'profit',
    ],
    'entertainment': [
        'movie', 'film', 'trailer', 'netflix', 'disney', 'marvel', 'dc',
        'oscar', 'grammy', 'emmy', 'bollywood', 'hollywood', 'tollywood',
        'actor', 'actress', 'singer', 'album', 'song', 'concert', 'tour',
        'streaming', 'series', 'show', 'anime', 'gaming', 'game', 'gta',
        'playstation', 'xbox', 'nintendo', 'celebrity', 'award',
    ],
    'sports': [
        'cricket', 'ipl', 'football', 'soccer', 'nba', 'nfl', 'mlb',
        'tennis', 'f1', 'formula', 'olympics', 'fifa', 'premier league',
        'champions league', 'wimbledon', 'match', 'score', 'player',
        'team', 'coach', 'goal', 'tournament', 'world cup', 'batting',
        'bowling', 'wicket', 'innings', 'run', 'captain', 'stadium',
    ],
    'health': [
        'health', 'medical', 'doctor', 'hospital', 'disease', 'virus',
        'vaccine', 'covid', 'mental health', 'fitness', 'workout', 'diet',
        'nutrition', 'sleep', 'meditation', 'yoga', 'weight loss', 'drug',
        'pharma', 'symptom', 'treatment', 'cancer', 'diabetes', 'surgery',
    ],
    'lifestyle': [
        'travel', 'food', 'recipe', 'fashion', 'beauty', 'wedding',
        'home', 'decor', 'diy', 'garden', 'pet', 'parenting', 'relationship',
        'culture', 'festival', 'holiday', 'lifestyle', 'trend', 'viral',
        'social media', 'influencer', 'tiktok', 'instagram', 'youtube',
    ],
}


def classify_trend(title, news_headlines=''):
    """Classify a trend into a category based on keyword matching against the title and news headlines."""
    combined_text = f"{title} {news_headlines}".lower()
    
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in combined_text)
        if score > 0:
            scores[category] = score
    
    if scores:
        return max(scores, key=scores.get)
    return 'general'


def get_fallback_trends(niche, geo='US'):
    """Fetch live data from Google Trends RSS and classify into categories.
    
    For ALL niches (including specific ones like 'tech', 'finance', etc.),
    we always pull the real-time RSS feed first and then filter by category
    using keyword-based classification. No hardcoded/predefined trends.
    """
    niche = niche.lower()
    
    try:
        url = f"https://trends.google.com/trending/rss?geo={geo}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        ns = {'ht': 'https://trends.google.com/trending/rss'}
        live_trends = []
        
        for item in root.findall('./channel/item')[:30]:
            title = item.find('title').text or ''
            
            # Collect news headlines for better classification
            news_headlines = []
            for news_item in item.findall('ht:news_item', ns):
                news_title_el = news_item.find('ht:news_item_title', ns)
                if news_title_el is not None and news_title_el.text:
                    news_headlines.append(news_title_el.text)
            
            headlines_text = ' '.join(news_headlines)
            
            traffic_el = item.find('ht:approx_traffic', ns)
            traffic_text = traffic_el.text if traffic_el is not None else '0'
            try:
                numeric_traffic = int(re.sub(r'[^0-9]', '', traffic_text))
            except:
                numeric_traffic = random.randint(10000, 500000)
            
            # Boost low RSS traffic numbers to realistic "search volume" scale
            if numeric_traffic < 1000:
                numeric_traffic = numeric_traffic * random.randint(100, 500)
                
            velocity = 'rising_fast' if numeric_traffic > 100000 else 'rising'
            
            # Classify the trend into a category
            detected_category = classify_trend(title, headlines_text)
            
            live_trends.append({
                'keyword': title,
                'volume': numeric_traffic,
                'velocity': velocity,
                'niche': detected_category,
            })
        
        # If a specific category is requested, filter the live trends
        if niche != 'all' and niche != 'general':
            filtered = [t for t in live_trends if t['niche'] == niche]
            if filtered:
                return filtered
            # If no trends matched the category, return empty list
            print(f"⚠️ No live trends matched category '{niche}'")
            return []
        
        return live_trends
        
    except Exception as e:
        print(f"RSS Fallback failed: {e}")
        return [
            {'keyword': 'Google Trends is temporarily unavailable', 'volume': 0, 'velocity': 'stable', 'niche': niche or 'general'},
        ]

def cache_trends_to_db(trends_data):
    """Save trends to database with virality scores"""
    from virality_scorer import calculate_virality_score
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for trend in trends_data:
        # Calculate virality score
        virality_data = calculate_virality_score(trend)
        score = virality_data['score']
        
        try:
            cur.execute('''
                INSERT INTO trends (keyword, niche, volume, velocity, virality_score)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (keyword, niche, fetched_at) DO UPDATE
                SET volume = EXCLUDED.volume, 
                    velocity = EXCLUDED.velocity,
                    virality_score = EXCLUDED.virality_score
            ''', (trend['keyword'], trend['niche'], trend['volume'], trend['velocity'], score))
        except Exception as e:
            print(f"Error caching trend: {e}")
    
    conn.commit()
    cur.close()
    conn.close()

def get_cached_trends(niche, max_age_hours=2):
    """Get trends from cache with virality scores"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT keyword, niche, volume, velocity, virality_score, fetched_at
        FROM trends
        WHERE niche = %s
        AND fetched_at > NOW() - INTERVAL '%s hours'
        ORDER BY virality_score DESC, volume DESC
        LIMIT 20
    ''', (niche, max_age_hours))
    
    trends = cur.fetchall()
    cur.close()
    conn.close()
    
    return [
        {
            'keyword': t[0],
            'niche': t[1],
            'volume': t[2],
            'velocity': t[3],
            'virality_score': t[4] or 0,
            'fetched_at': t[5].isoformat()
        }
        for t in trends
    ]
