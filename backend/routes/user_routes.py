from flask import Blueprint, jsonify, request
from auth_utils import token_required, admin_required, generate_token, JWT_EXPIRATION_HOURS
from services.user_service import UserService

user_bp = Blueprint("user", __name__)


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    user, error = UserService.authenticate_user(username, password)
    
    if error:
        status_code = 400 if "required" in error else 401
        return jsonify({"error": error}), status_code
    
    # Generate JWT token
    token = generate_token(user["username"], user["role"])
    
    return jsonify({
        "message": "Login successful", 
        "role": user["role"],
        "username": user["username"],
        "token": token,
        "expiresIn": JWT_EXPIRATION_HOURS * 3600  # seconds
    })


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
    users, error = UserService.get_all_users()
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify(users)


@user_bp.route("/users", methods=["POST"])
@admin_required
def add_user(current_user, current_role):
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "staff")
    
    user, error = UserService.create_user(username, password, role)
    
    if error:
        status_code = 400 if "already exists" in error or "required" in error else 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": "User added successfully", "user": user})