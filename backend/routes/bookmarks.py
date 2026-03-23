from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import token_required

bookmarks_bp = Blueprint('bookmarks', __name__)

@bookmarks_bp.route('/', methods=['POST'])
@token_required
def save_trend():
    data = request.json
    keyword = data.get('keyword')
    volume = data.get('volume', 0)
    velocity = data.get('velocity', 'normal')
    
    if not keyword:
        return jsonify({"error": "Keyword is required"}), 400
        
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if already saved
        cur.execute("SELECT id FROM saved_trends WHERE user_id = %s AND keyword = %s", (request.user_id, keyword))
        if cur.fetchone():
            return jsonify({"error": "Trend already saved"}), 400
            
        cur.execute(
            "INSERT INTO saved_trends (user_id, keyword, volume, velocity) VALUES (%s, %s, %s, %s) RETURNING id",
            (request.user_id, keyword, volume, velocity)
        )
        saved_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"message": "Trend saved successfully", "id": saved_id}), 201
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

@bookmarks_bp.route('/', methods=['GET'])
@token_required
def get_saved_trends():
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get all saved trends with their notes
        cur.execute("""
            SELECT s.id, s.keyword, s.volume, s.velocity, s.created_at,
                   n.id as note_id, n.note_text, n.updated_at
            FROM saved_trends s
            LEFT JOIN trend_notes n ON s.id = n.saved_trend_id
            WHERE s.user_id = %s
            ORDER BY s.created_at DESC
        """, (request.user_id,))
        
        results = cur.fetchall()
        
        # Organize data (group notes into the trend)
        trends = {}
        for row in results:
            trend_id = row[0]
            if trend_id not in trends:
                trends[trend_id] = {
                    "id": row[0],
                    "keyword": row[1],
                    "volume": row[2],
                    "velocity": row[3],
                    "created_at": row[4].isoformat() if row[4] else None,
                    "notes": []
                }
            
            # If there's a note, add it
            if row[5]:
                trends[trend_id]["notes"].append({
                    "id": row[5],
                    "note_text": row[6],
                    "updated_at": row[7].isoformat() if row[7] else None,
                })
                
        # Convert dict back to list
        trends_list = list(trends.values())
        
        return jsonify({"trends": trends_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@bookmarks_bp.route('/<int:trend_id>', methods=['DELETE'])
@token_required
def delete_saved_trend(trend_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Ensure the user owns this trend
        cur.execute("DELETE FROM saved_trends WHERE id = %s AND user_id = %s RETURNING id", (trend_id, request.user_id))
        
        if not cur.fetchone():
            return jsonify({"error": "Trend not found or not authorized"}), 404
            
        conn.commit()
        return jsonify({"message": "Trend deleted successfully"}), 200
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()
