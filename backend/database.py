import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_db_connection():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            selected_niches TEXT[],
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')
    
    # Trends table (cached data)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS trends (
            id SERIAL PRIMARY KEY,
            keyword VARCHAR(255) NOT NULL,
            niche VARCHAR(100),
            volume INT,
            velocity VARCHAR(50),
            fetched_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(keyword, niche, fetched_at)
        )
    ''')
    
    # Generated content table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS generated_content (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id),
            trend_keyword VARCHAR(255),
            content_type VARCHAR(50),
            script_text TEXT,
            hooks TEXT[],
            hashtags TEXT[],
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')
    
    # Content calendar table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS content_calendar (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id),
            content_id INT REFERENCES generated_content(id),
            scheduled_date DATE,
            scheduled_time TIME,
            status VARCHAR(50) DEFAULT 'scheduled',
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database initialized successfully!")

if __name__ == '__main__':
    init_db()
