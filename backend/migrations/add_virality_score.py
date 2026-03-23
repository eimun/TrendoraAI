from database import get_db_connection

def migrate():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Add column to trends table
    cur.execute('''
        ALTER TABLE trends 
        ADD COLUMN IF NOT EXISTS virality_score INT DEFAULT 0
    ''')
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Virality score column added!")

if __name__ == '__main__':
    migrate()
