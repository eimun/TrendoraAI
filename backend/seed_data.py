"""
Populate database with sample data for demo
Run once: python seed_data.py
"""

from database import get_db_connection
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random

load_dotenv()

def seed_trends():
    """Add sample trending topics"""
    sample_trends = [
        {'keyword': 'AI Chatbot Integration', 'niche': 'tech', 'volume': 125000, 'velocity': 'rising_fast', 'score': 85},
        {'keyword': 'GPT-5 Release Date', 'niche': 'tech', 'volume': 210000, 'velocity': 'rising_fast', 'score': 92},
        {'keyword': 'Python FastAPI Tutorial', 'niche': 'tech', 'volume': 45000, 'velocity': 'rising', 'score': 54},
        {'keyword': 'React Native vs Flutter', 'niche': 'tech', 'volume': 78000, 'velocity': 'rising', 'score': 68},
        {'keyword': 'Cybersecurity Best Practices', 'niche': 'tech', 'volume': 93000, 'velocity': 'stable', 'score': 61},
        {'keyword': 'Real Estate Investment Tips', 'niche': 'finance', 'volume': 98000, 'velocity': 'rising', 'score': 72},
        {'keyword': 'Crypto Bull Run 2026', 'niche': 'finance', 'volume': 175000, 'velocity': 'rising_fast', 'score': 88},
        {'keyword': 'Side Hustle Ideas', 'niche': 'finance', 'volume': 134000, 'velocity': 'rising', 'score': 76},
        {'keyword': 'Morning Workout Routine', 'niche': 'health', 'volume': 156000, 'velocity': 'rising_fast', 'score': 88},
        {'keyword': 'Gut Health Tips', 'niche': 'health', 'volume': 112000, 'velocity': 'rising', 'score': 74},
        {'keyword': 'Cold Plunge Benefits', 'niche': 'health', 'volume': 89000, 'velocity': 'rising_fast', 'score': 81},
        {'keyword': 'Minimalist Home Decor', 'niche': 'lifestyle', 'volume': 87000, 'velocity': 'rising', 'score': 65},
        {'keyword': 'Digital Nomad Travel', 'niche': 'lifestyle', 'volume': 102000, 'velocity': 'rising', 'score': 70},
        {'keyword': 'Capsule Wardrobe Guide', 'niche': 'lifestyle', 'volume': 67000, 'velocity': 'stable', 'score': 52},
    ]
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for trend in sample_trends:
        cur.execute('''
            INSERT INTO trends (keyword, niche, volume, velocity, virality_score, fetched_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT DO NOTHING
        ''', (trend['keyword'], trend['niche'], trend['volume'], trend['velocity'], trend['score']))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Seeded {len(sample_trends)} trends")

def seed_historical_data():
    """Add 14 days of historical data for predictions"""
    keywords_by_niche = {
        'tech': ['AI Chatbot Integration', 'GPT-5 Release Date', 'Python FastAPI Tutorial'],
        'finance': ['Real Estate Investment Tips', 'Crypto Bull Run 2026', 'Side Hustle Ideas'],
        'health': ['Morning Workout Routine', 'Gut Health Tips', 'Cold Plunge Benefits'],
        'lifestyle': ['Minimalist Home Decor', 'Digital Nomad Travel'],
    }
    
    conn = get_db_connection()
    cur = conn.cursor()
    count = 0
    
    for niche, keywords in keywords_by_niche.items():
        for keyword in keywords:
            base_volume = random.randint(50000, 100000)
            
            for days_ago in range(14, 0, -1):
                date = datetime.now() - timedelta(days=days_ago)
                # Simulate growth with some noise
                growth_factor = 1 + (14 - days_ago) * 0.05 + random.uniform(-0.02, 0.02)
                volume = int(base_volume * growth_factor)
                
                cur.execute('''
                    INSERT INTO trends_history (keyword, niche, volume, velocity, snapshot_date)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                ''', (keyword, niche, volume, 'rising', date.date()))
                count += 1
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Seeded {count} historical data points")

def seed_predictions():
    """Add sample predictions"""
    predictions = [
        {'keyword': 'AI Chatbot Integration', 'niche': 'tech', 'current': 125000, 'predicted': 187500, 'growth': 8.5, 'confidence': 0.89, 'peak_days': 5},
        {'keyword': 'GPT-5 Release Date', 'niche': 'tech', 'current': 210000, 'predicted': 350000, 'growth': 12.3, 'confidence': 0.92, 'peak_days': 3},
        {'keyword': 'Morning Workout Routine', 'niche': 'health', 'current': 156000, 'predicted': 195000, 'growth': 5.2, 'confidence': 0.78, 'peak_days': 7},
        {'keyword': 'Crypto Bull Run 2026', 'niche': 'finance', 'current': 175000, 'predicted': 280000, 'growth': 10.1, 'confidence': 0.85, 'peak_days': 4},
        {'keyword': 'Cold Plunge Benefits', 'niche': 'health', 'current': 89000, 'predicted': 120000, 'growth': 6.8, 'confidence': 0.81, 'peak_days': 6},
    ]
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for pred in predictions:
        peak_date = (datetime.now() + timedelta(days=pred['peak_days'])).date()
        cur.execute('''
            INSERT INTO predicted_trends (keyword, niche, current_volume, predicted_volume, growth_rate, confidence_score, predicted_peak_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        ''', (pred['keyword'], pred['niche'], pred['current'], pred['predicted'], pred['growth'], pred['confidence'], peak_date))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Seeded {len(predictions)} predictions")

if __name__ == '__main__':
    print("🌱 Seeding demo data...")
    seed_trends()
    seed_historical_data()
    seed_predictions()
    print("\n✅ Demo data ready!")
    print("Demo account: demo@trendora.com / demo123")
    print("(Create it via the /api/auth/register endpoint)")
