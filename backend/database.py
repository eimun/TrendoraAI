import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_db_connection():
    # Enforce sslmode=require for local connections to Render DBs
    conn = psycopg2.connect(os.getenv('DATABASE_URL'), sslmode='require')
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
    
    # Saved trends (bookmarks) table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS saved_trends (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            keyword VARCHAR(255) NOT NULL,
            volume INT DEFAULT 0,
            velocity VARCHAR(50) DEFAULT 'normal',
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')

    # Trend notes table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS trend_notes (
            id SERIAL PRIMARY KEY,
            saved_trend_id INT REFERENCES saved_trends(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    ''')

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database initialized successfully!")

if __name__ == '__main__':
    init_db()
