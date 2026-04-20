from flask import Blueprint, jsonify, request
from auth import token_required
from trends_service import fetch_trends_for_niche, cache_trends_to_db, get_cached_trends
from virality_scorer import calculate_virality_score
from ai_service import generate_trend_analysis

trends_bp = Blueprint('trends', __name__)

@trends_bp.route('/fetch', methods=['POST'])
@token_required
def fetch_trends():
    try:
        data = request.json
        niche = data.get('niche', 'tech')
        geo = data.get('geo', 'US')
        timeframe = data.get('timeframe', 'now 1-d')
        
        # Always fetch fresh RSS data so geo/category changes work instantly
        trends = fetch_trends_for_niche(niche, geo=geo, timeframe=timeframe)
        
        # Attach virality score so frontend UI components have access to it
        for t in trends:
            if 'virality_score' not in t:
                score_data = calculate_virality_score(t)
                t['virality_score'] = score_data['score']

        if trends:
            try:
                cache_trends_to_db(trends)
            except Exception as e:
                print(f"⚠️ Failed to cache trends: {e}")
        
        return jsonify({
            "trends": trends,
            "source": "live"
        })
    except Exception as e:
        print(f"❌ Error in fetch_trends: {e}")
        return jsonify({"error": str(e), "trends": []}), 500

@trends_bp.route('/analyze', methods=['POST'])
@token_required
def analyze_trend():
    try:
        data = request.json
        keyword = data.get('keyword', '')
        niche = data.get('niche', 'general')
        volume = data.get('volume', 0)
        velocity = data.get('velocity', 'stable')
        
        if not keyword:
            return jsonify({"error": "Keyword is required"}), 400
            
        analysis = generate_trend_analysis(keyword, niche, volume, velocity)
        
        return jsonify(analysis)
    except Exception as e:
        print(f"❌ Error in analyze_trend: {e}")
        return jsonify({"error": "Failed to analyze trend"}), 500
