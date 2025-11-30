from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
import jwt
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

college_bp = Blueprint("college_bp", __name__)

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"


def token_required(f):
    """Decorator to protect routes that require authentication"""
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
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired. Please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token"}), 401
        
        return f(current_user, current_role, *args, **kwargs)
    
    return decorated


@college_bp.route("/colleges", methods=["GET"])
@token_required
def get_colleges(current_user, current_role):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    cur.execute("SELECT college_code, college_name FROM colleges ORDER BY college_code;")
    colleges = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify([{"college_code": row[0], "college_name": row[1]} for row in colleges])


@college_bp.route("/colleges", methods=["POST"])
@token_required
def add_college(current_user, current_role):
    data = request.get_json()
    college_code = data.get("college_code")
    college_name = data.get("college_name")

    if not college_code or not college_name:
        return jsonify({"error": "College code and name are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()

    # Check for duplicates (case-insensitive)
    cur.execute(
        "SELECT 1 FROM colleges WHERE LOWER(college_code) = LOWER(%s) OR LOWER(college_name) = LOWER(%s)",
        (college_code, college_name)
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "College code or name already exists"}), 400

    try:
        cur.execute(
            "INSERT INTO colleges (college_code, college_name) VALUES (%s, %s)",
            (college_code, college_name)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "College added successfully"}), 201
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to add college: {str(e)}"}), 500


@college_bp.route("/colleges/<college_code>", methods=["PUT"])
@token_required
def update_college(current_user, current_role, college_code):
    data = request.get_json()
    new_code = data.get("college_code")
    college_name = data.get("college_name")

    if not new_code or not college_name:
        return jsonify({"error": "College code and name are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()

    # Check if another college has the same code or name
    cur.execute(
        """
        SELECT 1 FROM colleges 
        WHERE (LOWER(college_code) = LOWER(%s) OR LOWER(college_name) = LOWER(%s))
        AND LOWER(college_code) != LOWER(%s)
        """,
        (new_code, college_name, college_code)
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Another college already has that code or name"}), 400

    try:
        cur.execute(
            "UPDATE colleges SET college_code = %s, college_name = %s WHERE college_code = %s",
            (new_code, college_name, college_code)
        )
        
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": "College not found"}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"College '{college_code}' updated successfully"})
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to update college: {str(e)}"}), 500


@college_bp.route("/colleges/<college_code>", methods=["DELETE"])
@token_required
def delete_college(current_user, current_role, college_code):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        cur.execute("DELETE FROM colleges WHERE college_code = %s", (college_code,))
        
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": "College not found"}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"College '{college_code}' deleted successfully"})
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to delete college: {str(e)}"}), 500