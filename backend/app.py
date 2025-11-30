from flask import Flask
from flask_cors import CORS
from routes.college_routes import college_bp
from routes.program_routes import program_bp
from routes.student_routes import student_bp
from routes.user_routes import user_bp

app = Flask(__name__)

# Simple CORS - no sessions needed
CORS(app)

app.register_blueprint(college_bp, url_prefix="/api")
app.register_blueprint(program_bp, url_prefix="/api")
app.register_blueprint(student_bp, url_prefix="/api")
app.register_blueprint(user_bp, url_prefix="/api")

@app.route("/")
def home():
    return "✅ Flask backend connected successfully!"

if __name__ == "__main__":
    app.run(debug=True)