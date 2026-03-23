from flask import Blueprint, jsonify, request
from auth import token_required
from trends_service import fetch_trends_for_niche, cache_trends_to_db, get_cached_trends

trends_bp = Blueprint('trends', __name__)

@trends_bp.route('/fetch', methods=['POST'])
@token_required
def fetch_trends():
    try:
        data = request.json
        niche = data.get('niche', 'tech')
        
        # Check cache first
        cached = get_cached_trends(niche, max_age_hours=2)
        
        if cached:
            return jsonify({
                "trends": cached,
                "source": "cache"
            })
        
        # Fetch fresh data
        trends = fetch_trends_for_niche(niche)
        
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
