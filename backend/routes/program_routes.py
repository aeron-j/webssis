from flask import Blueprint, jsonify, request
from db_connection import get_db_connection

program_bp = Blueprint("program", __name__)

# 🔹 Get all programs
@program_bp.route("/programs", methods=["GET"])
def get_programs():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT program_code, program_name, college FROM programs;")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    programs = [{"code": r[0], "name": r[1], "college": r[2]} for r in rows]
    return jsonify(programs)

# 🔹 Add a new program
@program_bp.route("/programs", methods=["POST"])
def add_program():
    data = request.get_json()
    program_code = data.get("program_code")
    program_name = data.get("program_name")
    college = data.get("college")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO programs (program_code, program_name, college) VALUES (%s, %s, %s)",
        (program_code, program_name, college),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✅ Program added successfully"})

# 🔹 Update program (including editable program_code)
@program_bp.route("/programs/<program_code>", methods=["PUT"])
def update_program(program_code):
    data = request.get_json()
    new_code = data.get("program_code")
    program_name = data.get("program_name")
    college = data.get("college")

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Update the program
        cur.execute(
            "UPDATE programs SET program_code = %s, program_name = %s, college = %s WHERE program_code = %s",
            (new_code, program_name, college, program_code),
        )

        # Update all students who had this program_code
        cur.execute(
            "UPDATE students SET course = %s WHERE course = %s",
            (new_code, program_code),
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"message": f"❌ Failed to update program: {str(e)}"}), 400

    cur.close()
    conn.close()
    return jsonify({"message": f"✏ Program '{program_code}' updated successfully"})

# 🔹 Delete program
@program_bp.route("/programs/<program_code>", methods=["DELETE"])
def delete_program(program_code):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Delete the program
        cur.execute("DELETE FROM programs WHERE program_code = %s", (program_code,))
        
        # Optional: clear students’ courses if you want
        cur.execute("UPDATE students SET course = NULL WHERE course = %s", (program_code,))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"message": f"❌ Failed to delete program: {str(e)}"}), 400

    cur.close()
    conn.close()
    return jsonify({"message": f"🗑 Program '{program_code}' deleted successfully"})
