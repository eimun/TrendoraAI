from youtube_service import search_videos_by_keyword
import math

def calculate_virality_score(trend):
    """
    Calculate virality score (0-100) based on multiple factors
    
    Factors:
    1. Search Volume (40 points max)
    2. Velocity/Momentum (30 points max)
    3. Competition Level (30 points max)
    """
    
    score = 0
    
    # FACTOR 1: Search Volume (0-40 points)
    volume = trend.get('volume', 0)
    
    if volume > 500000:
        score += 40
    elif volume > 100000:
        score += 35
    elif volume > 50000:
        score += 25
    elif volume > 10000:
        score += 15
    else:
        score += 5
    
    # FACTOR 2: Velocity (0-30 points)
    velocity = trend.get('velocity', 'stable')
    
    if velocity == 'rising_fast' or velocity == 'breakout':
        score += 30
    elif velocity == 'rising':
        score += 20
    else:
        score += 10
    
    # FACTOR 3: Competition (0-30 points)
    # Lower competition = higher score
    keyword = trend.get('keyword', '')
    competitor_count = search_videos_by_keyword(keyword, max_results=50)
    
    if competitor_count < 10:
        score += 30  # Almost no competition!
    elif competitor_count < 50:
        score += 25
    elif competitor_count < 100:
        score += 20
    elif competitor_count < 500:
        score += 15
    else:
        score += 5
    
    # Normalize to 0-100
    final_score = min(max(score, 0), 100)
    
    # Calculate confidence level
    if final_score >= 80:
        confidence = 'Very High'
    elif final_score >= 60:
        confidence = 'High'
    elif final_score >= 40:
        confidence = 'Medium'
    else:
        confidence = 'Low'
    
    return {
        'score': final_score,
        'confidence': confidence,
        'breakdown': {
            'volume_contribution': min(40, score * 0.4),
            'velocity_contribution': min(30, score * 0.3),
            'competition_contribution': min(30, score * 0.3)
        }
    }

def batch_score_trends(trends):
    """Score multiple trends at once"""
    
    scored_trends = []
    
    for trend in trends:
        virality_data = calculate_virality_score(trend)
        
        scored_trends.append({
            **trend,
            'virality_score': virality_data['score'],
            'confidence': virality_data['confidence'],
            'score_breakdown': virality_data['breakdown']
        })
    
    # Sort by score descending
    scored_trends.sort(key=lambda x: x['virality_score'], reverse=True)
    
    return scored_trends
