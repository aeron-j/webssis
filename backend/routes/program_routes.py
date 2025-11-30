from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from auth_utils import token_required

program_bp = Blueprint("program", __name__)


@program_bp.route("/programs", methods=["GET"])
@token_required
def get_programs(current_user, current_role):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    cur.execute("SELECT program_code, program_name, college FROM programs ORDER BY program_code;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    programs = [{"code": r[0], "name": r[1], "college": r[2]} for r in rows]
    return jsonify(programs)


@program_bp.route("/programs", methods=["POST"])
@token_required
def add_program(current_user, current_role):
    data = request.get_json()
    program_code = data.get("program_code")
    program_name = data.get("program_name")
    college = data.get("college")

    if not program_code or not program_name or not college:
        return jsonify({"error": "Program code, name, and college are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    # Check for duplicates (case-insensitive)
    cur.execute(
        """
        SELECT 1 FROM programs
        WHERE LOWER(program_code) = LOWER(%s)
        OR LOWER(program_name) = LOWER(%s)
        """,
        (program_code, program_name),
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Program code or name already exists"}), 400

    try:
        cur.execute(
            "INSERT INTO programs (program_code, program_name, college) VALUES (%s, %s, %s)",
            (program_code, program_name, college),
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Program added successfully"}), 201
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to add program: {str(e)}"}), 500


@program_bp.route("/programs/<program_code>", methods=["PUT"])
@token_required
def update_program(current_user, current_role, program_code):
    data = request.get_json()
    new_code = data.get("program_code")
    program_name = data.get("program_name")
    college = data.get("college")

    if not new_code or not program_name or not college:
        return jsonify({"error": "Program code, name, and college are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()

    # Check if another program has the same code or name
    cur.execute(
        """
        SELECT 1 FROM programs
        WHERE (LOWER(program_code) = LOWER(%s) OR LOWER(program_name) = LOWER(%s))
        AND LOWER(program_code) != LOWER(%s)
        """,
        (new_code, program_name, program_code),
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Another program already has that code or name"}), 400

    try:
        cur.execute(
            "UPDATE programs SET program_code = %s, program_name = %s, college = %s WHERE program_code = %s",
            (new_code, program_name, college, program_code),
        )
        
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": "Program not found"}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"Program '{program_code}' updated successfully"})
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to update program: {str(e)}"}), 500


@program_bp.route("/programs/<program_code>", methods=["DELETE"])
@token_required
def delete_program(current_user, current_role, program_code):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        cur.execute("DELETE FROM programs WHERE program_code = %s", (program_code,))
        
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": "Program not found"}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"Program '{program_code}' deleted successfully"})
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to delete program: {str(e)}"}), 500