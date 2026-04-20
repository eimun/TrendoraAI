import os
import json
from groq import Groq

# Initialize the Groq Client
api_key = os.getenv("GROQ_API_KEY")

try:
    if api_key:
        client = Groq(api_key=api_key)
        print("✅ Groq AI Client initialized successfully.")
    else:
        client = None
        print("⚠️ GROQ_API_KEY not found in environment variables. AI features will be disabled.")
except Exception as e:
    client = None
    print(f"⚠️ Failed to initialize Groq Client: {e}")

def generate_trend_analysis(keyword, niche, volume, velocity):
    """
    Generates a structured JSON analysis about a trending topic using the Groq API (Llama 3).
    """
    if not client:
        return {"summary": "AI analysis is currently unavailable because the Groq API key is missing.", "ideas": [], "keywords": []}

    prompt = f"""
    A topic just started trending on the internet: "{keyword}".
    It is categorized under "{niche}" with {volume} searches and a {velocity} momentum.
    
    You must return a raw JSON object containing exactly these exactly three keys:
    1. "summary": In 2-3 engaging sentences, explain why "{keyword}" might be trending today. Provide specific, creative context. Write as if you are a witty internet culture analyst. Avoid generic phrases like "surging search volume indicates".
    2. "ideas": A list of string array containing 3 extremely creative, actionable content creation ideas for YouTube, TikTok, or a Blog based on this trend.
    3. "keywords": A list of string array containing 3 highly related parallel search keywords to this trend.
    
    DO NOT return any markdown formatting, no conversational text, ONLY the raw JSON object.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = chat_completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"❌ Error generating AI summary for {keyword}: {e}")
        return {"summary": "We couldn't generate an AI summary for this trend at the moment. Please try again later.", "ideas": [], "keywords": []}
