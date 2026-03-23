from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import token_required

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/<int:saved_trend_id>', methods=['POST'])
@token_required
def add_note(saved_trend_id):
    data = request.json
    note_text = data.get('note_text')
    
    if not note_text:
        return jsonify({"error": "Note text is required"}), 400
        
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if saved_trend belongs to user
        cur.execute("SELECT id FROM saved_trends WHERE id = %s AND user_id = %s", (saved_trend_id, request.user_id))
        if not cur.fetchone():
            return jsonify({"error": "Saved trend not found or not authorized"}), 404
            
        cur.execute(
            "INSERT INTO trend_notes (saved_trend_id, note_text) VALUES (%s, %s) RETURNING id, updated_at",
            (saved_trend_id, note_text)
        )
        result = cur.fetchone()
        note_id = result[0]
        updated_at = result[1]
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "message": "Note added successfully", 
            "note": {
                "id": note_id,
                "note_text": note_text,
                "updated_at": updated_at.isoformat() if updated_at else None
            }
        }), 201
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

@notes_bp.route('/<int:note_id>', methods=['PUT', 'DELETE'])
@token_required
def update_or_delete_note(note_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Ensure the user owns the trend this note is attached to
        cur.execute("""
            SELECT n.id 
            FROM trend_notes n
            JOIN saved_trends s ON n.saved_trend_id = s.id
            WHERE n.id = %s AND s.user_id = %s
        """, (note_id, request.user_id))
        
        if not cur.fetchone():
            return jsonify({"error": "Note not found or not authorized"}), 404
            
        if request.method == 'DELETE':
            cur.execute("DELETE FROM trend_notes WHERE id = %s", (note_id,))
            conn.commit()
            return jsonify({"message": "Note deleted successfully"}), 200
            
        elif request.method == 'PUT':
            data = request.json
            note_text = data.get('note_text')
            
            if not note_text:
                return jsonify({"error": "Note text is required"}), 400
                
            cur.execute(
                "UPDATE trend_notes SET note_text = %s, updated_at = NOW() WHERE id = %s RETURNING id",
                (note_text, note_id)
            )
            conn.commit()
            return jsonify({"message": "Note updated successfully"}), 200
            
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()
