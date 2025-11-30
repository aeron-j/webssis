from flask import Flask, send_from_directory, request
from flask_cors import CORS
from routes.college_routes import college_bp
from routes.program_routes import program_bp
from routes.student_routes import student_bp
from routes.user_routes import user_bp
import os

# Create Flask app with static folder for React build
app = Flask(__name__, static_folder='static', static_url_path='')

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register API blueprints
app.register_blueprint(college_bp, url_prefix="/api")
app.register_blueprint(program_bp, url_prefix="/api")
app.register_blueprint(student_bp, url_prefix="/api")
app.register_blueprint(user_bp, url_prefix="/api")

# API health check
@app.route("/api/health")
def health_check():
    return {"status": "healthy", "message": "Flask backend is running"}

# Serve React index.html at root
@app.route('/')
def serve_root():
    if not os.path.exists(app.static_folder):
        return {
            "message": "React build not found. Run 'npm run build' in frontend directory.",
            "tip": "In development, run React dev server separately with 'npm start'"
        }, 200
    return send_from_directory(app.static_folder, 'index.html')

# Serve static files
@app.route('/<path:filename>')
def serve_static_files(filename):
    # Check if file exists in static folder
    file_path = os.path.join(app.static_folder, filename)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, filename)
    
    # If file doesn't exist and it's not an API call, serve index.html (React Router)
    if not filename.startswith('api/'):
        return send_from_directory(app.static_folder, 'index.html')
    
    # API endpoint not found
    return {"error": "API endpoint not found"}, 404

# Error handler for 404 - serve React app for any unmatched routes
@app.errorhandler(404)
def not_found(e):
    # If it's an API request that failed, return JSON error
    if request.path.startswith('/api/'):
        return {"error": "API endpoint not found"}, 404
    
    # Otherwise serve index.html for React Router
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    
    return {"message": "React build not found"}, 404

if __name__ == "__main__":
    # Check if we're in development or production
    is_development = os.environ.get('FLASK_ENV') == 'development'
    
    if is_development:
        print("\n" + "="*60)
        print("🚀 DEVELOPMENT MODE")
        print("="*60)
        print("Backend API: http://127.0.0.1:5000")
        print("Frontend: Run 'npm start' in frontend directory")
        print("="*60 + "\n")
        app.run(debug=True, port=5000)
    else:
        print("\n" + "="*60)
        print("🌐 PRODUCTION MODE")
        print("="*60)
        print("Application: http://127.0.0.1:5000")
        print("Make sure to run 'npm run build' first!")
        print("="*60 + "\n")
        app.run(debug=False, host='0.0.0.0', port=5000)