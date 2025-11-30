from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
import hashlib
import secrets

user_bp = Blueprint("user", __name__)

# Generate a token when server starts (changes every restart)
SERVER_TOKEN = secrets.token_hex(16)

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "⚠️ Please enter both username and password."}), 400

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
        # Return a token that client must save
        return jsonify({
            "message": "✅ Login successful!", 
            "role": user[0],
            "username": username,
            "token": SERVER_TOKEN  # Send token to client
        })
    else:
        return jsonify({"message": "❌ Invalid username or password."}), 401


@user_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "✅ Logged out successfully!"})


@user_bp.route("/check-auth", methods=["GET"])
def check_auth():
    # Check if client sends the correct token
    client_token = request.headers.get("Authorization")
    
    if client_token == f"Bearer {SERVER_TOKEN}":
        return jsonify({"authenticated": True})
    
    return jsonify({"authenticated": False}), 401


# Existing routes
@user_bp.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, role FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()

    user_list = [{"id": u[0], "username": u[1], "role": u[2]} for u in users]
    return jsonify(user_list)


@user_bp.route("/users", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "staff")

    if not username or not password:
        return jsonify({"message": "⚠️ Username and password are required."}), 400

    hashed_pw = hashlib.sha256(password.encode()).hexdigest()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        return jsonify({"message": "❌ Username already exists."}), 400

    cur.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, hashed_pw, role),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✅ User added successfully!"})