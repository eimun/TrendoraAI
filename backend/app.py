from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Prevent DB connection failures from crashing the entire app on startup
try:
    # Auto-create tables on startup
    from database import init_db
    init_db()

    # Run migrations
    from migrations.add_virality_score import migrate as add_virality
    from migrations.add_ojt_features import migrate as add_ojt_features
    add_virality()
    add_ojt_features()
except Exception as e:
    print(f"⚠️ Database initialization failed on startup: {e}")

# Register blueprints
from auth import auth_bp
from routes.trends import trends_bp
from routes.virality import virality_bp
from routes.bookmarks import bookmarks_bp
from routes.notes import notes_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(trends_bp, url_prefix='/api/trends')
app.register_blueprint(virality_bp, url_prefix='/api/virality')
app.register_blueprint(bookmarks_bp, url_prefix='/api/bookmarks')
app.register_blueprint(notes_bp, url_prefix='/api/notes')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "Trendora API is running"})

from error_handlers import register_error_handlers
register_error_handlers(app)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
