import os
from groq import Groq

# Initialize the Groq Client
api_key = os.getenv("GROQ_API_KEY")

try:
    if api_key:
        client = Groq(api_key=api_key)
    else:
        client = None
        print("⚠️ GROQ_API_KEY not found in environment variables. AI features will be disabled.")
except Exception as e:
    client = None
    print(f"⚠️ Failed to initialize Groq Client: {e}")

def generate_trend_summary(keyword, niche, volume, velocity):
    """
    Generate a 2-3 sentence insight about why a trend is currently popular.
    """
    if not client:
        return "AI analysis is currently unavailable because the Groq API key is missing."

    prompt = f"""
    A topic just started trending on the internet: "{keyword}".
    It is categorized under "{niche}" with {volume} searches and a {velocity} momentum.
    
    In 2-3 engaging sentences, explain why "{keyword}" might be trending today based on current events or its general appeal. 
    Provide specific, creative, and unique context about this subject. 
    CRITICAL: Avoid generic robotic phrases like "The recent surge in search volume indicates a growing interest in..." or "This highlights a shift towards...". 
    Write as if you are a witty internet culture analyst explaining the hype to a friend. 
    Do not use any markdown formatting, asterisks, or bullet points. Just plain text.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"❌ Error generating AI summary for {keyword}: {e}")
        return "We couldn't generate an AI summary for this trend at the moment. Please try again later."
