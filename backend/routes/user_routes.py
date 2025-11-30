from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
import hashlib
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

user_bp = Blueprint("user", __name__)

# Secret key for JWT - should be in .env
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Invalid token format", "authenticated": False}), 401
        
        if not token:
            return jsonify({"error": "Token is missing", "authenticated": False}), 401
        
        try:
            # Decode and verify token
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = data['username']
            current_role = data['role']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired", "authenticated": False}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token", "authenticated": False}), 401
        
        return f(current_user, current_role, *args, **kwargs)
    
    return decorated


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Please enter both username and password"}), 400

    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT role FROM users WHERE username = %s AND password = %s",
        (username, hashed_pw),
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:
        # Generate JWT token with 24hr expiration
        expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
        
        token = jwt.encode({
            'username': username,
            'role': user[0],
            'exp': expiration
        }, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            "message": "Login successful", 
            "role": user[0],
            "username": username,
            "token": token,
            "expiresIn": JWT_EXPIRATION_HOURS * 3600  # seconds
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@user_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user, current_role):
    return jsonify({"message": "Logged out successfully"})


@user_bp.route("/check-auth", methods=["GET"])
@token_required
def check_auth(current_user, current_role):
    return jsonify({
        "authenticated": True,
        "username": current_user,
        "role": current_role
    })


@user_bp.route("/users", methods=["GET"])
@token_required
def get_users(current_user, current_role):
    # Only admin can view users
    if current_role != "admin":
        return jsonify({"error": "Unauthorized access"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, role FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()

    user_list = [{"id": u[0], "username": u[1], "role": u[2]} for u in users]
    return jsonify(user_list)


@user_bp.route("/users", methods=["POST"])
@token_required
def add_user(current_user, current_role):
    # Only admin can add users
    if current_role != "admin":
        return jsonify({"error": "Unauthorized access"}), 403
    
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "staff")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    hashed_pw = hashlib.sha256(password.encode()).hexdigest()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        return jsonify({"error": "Username already exists"}), 400

    cur.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, hashed_pw, role),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "User added successfully"})