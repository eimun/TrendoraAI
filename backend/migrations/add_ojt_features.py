import psycopg2
import os
import sys

# Import the centralized get_db_connection which has sslmode='require' handling
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection

def migrate():
    print("Running OJT Features migration...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Add default_niche to users
        try:
            cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS default_niche VARCHAR(50) DEFAULT 'tech'")
            print("✅ Added default_niche to users")
        except Exception as e:
            print(f"Skipping default_niche column: {e}")
            conn.rollback()

        # Create saved_trends table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS saved_trends (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                keyword VARCHAR(255) NOT NULL,
                volume INT,
                velocity VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW()
            )
        ''')
        print("✅ Created saved_trends table")

        # Create trend_notes table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS trend_notes (
                id SERIAL PRIMARY KEY,
                saved_trend_id INT REFERENCES saved_trends(id) ON DELETE CASCADE,
                note_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        ''')
        print("✅ Created trend_notes table")

        conn.commit()
        cur.close()
        conn.close()
        print("✅ OJT Features migration completed.")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    migrate()
