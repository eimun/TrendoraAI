from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Auto-create tables on startup
from database import init_db
init_db()

# Run migrations
from migrations.add_virality_score import migrate as add_virality
add_virality()

# Register blueprints
from auth import auth_bp
from routes.trends import trends_bp
from routes.virality import virality_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(trends_bp, url_prefix='/api/trends')
app.register_blueprint(virality_bp, url_prefix='/api/virality')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "Trendora API is running"})

from error_handlers import register_error_handlers
register_error_handlers(app)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
