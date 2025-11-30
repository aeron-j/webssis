from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
import hashlib
from auth_utils import token_required, admin_required, generate_token, JWT_EXPIRATION_HOURS

user_bp = Blueprint("user", __name__)


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
        # Generate JWT token using centralized function
        token = generate_token(username, user[0])
        
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
@admin_required
def get_users(current_user, current_role):
    """Only admin can view users"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, role FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()

    user_list = [{"id": u[0], "username": u[1], "role": u[2]} for u in users]
    return jsonify(user_list)


@user_bp.route("/users", methods=["POST"])
@admin_required
def add_user(current_user, current_role):
    """Only admin can add users"""
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