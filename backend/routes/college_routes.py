from flask import Blueprint, jsonify, request
from db_connection import get_db_connection

college_bp = Blueprint("college_bp", __name__)


@college_bp.route("/colleges", methods=["GET"])
def get_colleges():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT college_code, college_name FROM colleges ORDER BY college_code;")
    colleges = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"college_code": row[0], "college_name": row[1]} for row in colleges])


@college_bp.route("/colleges", methods=["POST"])
def add_college():
    data = request.get_json()
    college_code = data.get("college_code")
    college_name = data.get("college_name")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT 1 FROM colleges WHERE LOWER(college_code) = LOWER(%s) OR LOWER(college_name) = LOWER(%s)",
        (college_code, college_name)
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "❌ College code or name already exists (case-insensitive check)."}), 400

    try:
        cur.execute(
            "INSERT INTO colleges (college_code, college_name) VALUES (%s, %s)",
            (college_code, college_name)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"message": f"❌ Failed to add college: {str(e)}"}), 400

    cur.close()
    conn.close()
    return jsonify({"message": "College added successfully!"}), 201


@college_bp.route("/colleges/<college_code>", methods=["PUT"])
def update_college(college_code):
    data = request.get_json()
    new_code = data.get("college_code")
    college_name = data.get("college_name")

    conn = get_db_connection()
    cur = conn.cursor()

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
        return jsonify({"message": "❌ Another college already has that code or name (case-insensitive)."}), 400

    try:
        cur.execute(
            "UPDATE colleges SET college_code = %s, college_name = %s WHERE college_code = %s",
            (new_code, college_name, college_code)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"message": f"❌ Failed to update college: {str(e)}"}), 400

    cur.close()
    conn.close()
    return jsonify({"message": f"✏ College '{college_code}' updated successfully"})


@college_bp.route("/colleges/<college_code>", methods=["DELETE"])
def delete_college(college_code):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM colleges WHERE college_code = %s", (college_code,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"message": f"❌ Failed to delete college: {str(e)}"}), 400

    cur.close()
    conn.close()
    return jsonify({"message": "College deleted successfully!"})
