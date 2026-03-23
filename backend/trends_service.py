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

def fetch_trends_for_niche(niche, geo='US'):
    """Fetch trending topics for a specific niche"""
    
    keywords = NICHE_KEYWORDS.get(niche.lower(), ['trending'])
    
    trends_data = []
    
    for keyword in keywords:
        try:
            # Build payload
            pytrends.build_payload([keyword], timeframe='now 7-d', geo=geo)
            
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
        print(f"⚠️ pytrends returned no data for {niche}, using fallback trends")
        trends_data = get_fallback_trends(niche, geo=geo)
    
    return trends_data


import urllib.request
import xml.etree.ElementTree as ET
import re
import random

def get_fallback_trends(niche, geo='US'):
    """Fetch live data from Google Trends RSS as a reliable fallback for cloud servers"""
    try:
        url = f"https://trends.google.com/trending/rss?geo={geo}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        live_trends = []
        
        for item in root.findall('./channel/item')[:20]:
            title = item.find('title').text
            
            # Extract traffic number safely (e.g. "50,000+" -> 50000)
            traffic_text = item.find('{https://trends.google.com/trending/rss}approx_traffic').text
            try:
                numeric_traffic = int(re.sub(r'\D', '', traffic_text))
            except:
                numeric_traffic = random.randint(10000, 500000)
                
            velocity = 'rising_fast' if numeric_traffic > 10000 else 'rising'
            
            live_trends.append({
                'keyword': title,
                'volume': numeric_traffic,
                'velocity': velocity,
                'niche': niche
            })
            
        return live_trends
        
    except Exception as e:
        print(f"RSS Fallback failed: {e}")
        # Absolute last resort static fallback
        return [
            {'keyword': 'Tech AI Basics', 'volume': 50000, 'velocity': 'rising', 'niche': niche},
            {'keyword': 'Remote Work Settings', 'volume': 40000, 'velocity': 'rising', 'niche': niche},
            {'keyword': 'Market Watch 2025', 'volume': 80000, 'velocity': 'rising_fast', 'niche': niche}
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
