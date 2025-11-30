"""
Authentication utilities for JWT token handling
Centralized to avoid code duplication across routes
"""

import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration - loaded once from environment
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def generate_token(username, role):
    """
    Generate a JWT token for a user
    
    Args:
        username (str): User's username
        role (str): User's role (admin, staff, etc.)
    
    Returns:
        str: JWT token
    """
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    
    token = jwt.encode({
        'username': username,
        'role': role,
        'exp': expiration
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return token


def token_required(f):
    """
    Decorator to protect routes that require authentication
    Usage: @token_required above your route function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        
        try:
            # Decode and verify token
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = data['username']
            current_role = data['role']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired. Please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token"}), 401
        
        # Pass user info to the route
        return f(current_user, current_role, *args, **kwargs)
    
    return decorated


def admin_required(f):
    """
    Decorator to protect routes that require admin role
    Usage: @admin_required above your route function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = data['username']
            current_role = data['role']
            
            # Check if user is admin
            if current_role != 'admin':
                return jsonify({"error": "Admin access required"}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired. Please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token"}), 401
        
        return f(current_user, current_role, *args, **kwargs)
    
    return decorated