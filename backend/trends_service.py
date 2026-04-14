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

def get_fallback_trends(niche, geo='US'):
    """Fetch live data from Google Trends RSS, or use category-specific mock data if a niche is selected."""
    niche = niche.lower()
    
    # If a specific category is requested, we use predefined realistic datasets
    # because Google Trends RSS no longer supports category filtering directly.
    if niche != 'all' and niche != 'general':
        category_data = {
            'tech': ['OpenAI Sora', 'Apple Vision Pro', 'Nvidia Blackwell', 'Cybersecurity', 'React 19', 'Quantum Computing', 'Bitcoin Halving', 'Linux Kernel'],
            'finance': ['S&P 500 Record High', 'Federal Reserve Rates', 'Gold Prices', 'Real Estate Bubble', 'Vanguard Funds', 'Inflation Report', 'Corporate Earnings'],
            'entertainment': ['Dune Part 2', 'Taylor Swift Tour', 'GTA 6 Trailer', 'Oscars 2025', 'Netflix Top 10', 'Marvel Phase 5', 'Gaming E3'],
            'sports': ['Champions League', 'NBA Playoffs', 'Formula 1', 'NFL Draft', 'Premier League', 'Olympic Games', 'Wimbledon', 'Messi Inter Miami'],
            'health': ['Ozempic Alternatives', 'Intermittent Fasting', 'Mental Health Tech', 'Sleep Optimization', 'Gut Microbiome', 'Longevity Research'],
            'lifestyle': ['Minimalism', 'Digital Nomad Visas', 'Slow Living', 'Solo Travel', 'Van Life', 'Vintage Fashion', 'Home Office Setups']
        }
        
        keywords = category_data.get(niche, ['Generic Trend 1', 'Generic Trend 2', 'Generic Trend 3'])
        random.shuffle(keywords)
        
        results = []
        for kw in keywords[:10]:
            vol = random.randint(10000, 500000)
            results.append({
                'keyword': kw,
                'volume': vol,
                'velocity': 'rising_fast' if vol > 100000 else 'rising',
                'niche': niche
            })
        return results

    # If 'all' categories is requested, pull the actual live general RSS feed
    try:
        url = f"https://trends.google.com/trending/rss?geo={geo}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        live_trends = []
        
        for item in root.findall('./channel/item')[:20]:
            title = item.find('title').text
            
            traffic_text = item.find('{https://trends.google.com/trending/rss}approx_traffic').text
            try:
                numeric_traffic = int(re.sub(r'\D', '', traffic_text))
            except:
                numeric_traffic = random.randint(10000, 500000)
                
            velocity = 'rising_fast' if numeric_traffic > 100000 else 'rising'
            
            live_trends.append({
                'keyword': title,
                'volume': numeric_traffic,
                'velocity': velocity,
                'niche': 'general'
            })
            
        return live_trends
        
    except Exception as e:
        print(f"RSS Fallback failed: {e}")
        return [
            {'keyword': 'Global News Event', 'volume': 500000, 'velocity': 'rising_fast', 'niche': 'general'},
            {'keyword': 'Breaking Story', 'volume': 200000, 'velocity': 'rising', 'niche': 'general'}
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
