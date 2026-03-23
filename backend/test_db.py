import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('DATABASE_URL')
print(f"URL: {url}")
try:
    print("Trying without explicit kwargs...")
    conn = psycopg2.connect(url, connect_timeout=10)
    print("SUCCESS")
    conn.close()
except Exception as e:
    print(f"Error 1: {e}")

try:
    print("Trying with sslmode=require...")
    conn = psycopg2.connect(url, sslmode='require', connect_timeout=10)
    print("SUCCESS")
    conn.close()
except Exception as e:
    print(f"Error 2: {e}")
