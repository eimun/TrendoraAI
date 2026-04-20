from flask import Blueprint, jsonify, request
from auth import token_required
from ai_service import generate_chat_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/message', methods=['POST'])
@token_required
def chat_message():
    try:
        data = request.json
        messages = data.get('messages', [])
        trend_context = data.get('trend_context', [])
        
        reply = generate_chat_response(messages, trend_context)
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"❌ Error in /api/chat/message: {e}")
        return jsonify({"error": str(e), "reply": "An error occurred on the server."}), 500
