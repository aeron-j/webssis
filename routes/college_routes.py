from flask import Blueprint, jsonify, request
from db_connection import get_db_connection

college_bp = Blueprint("college_bp", __name__)

# ✅ Get all colleges
@college_bp.route("/colleges", methods=["GET"])
def get_colleges():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT college_code, college_name FROM colleges ORDER BY college_code;")
    colleges = cur.fetchall()
    cur.close()
    conn.close()

    # Match frontend keys: college_code, college_name
    return jsonify([
        {"college_code": row[0], "college_name": row[1]} for row in colleges
    ])

# ✅ Add a new college
@college_bp.route("/colleges", methods=["POST"])
def add_college():
    data = request.get_json()
    college_code = data.get("college_code")
    college_name = data.get("college_name")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO colleges (college_code, college_name) VALUES (%s, %s)",
        (college_code, college_name)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "College added successfully!"}), 201

# ✅ Update college
@college_bp.route("/colleges/<college_code>", methods=["PUT"])
def update_college(college_code):
    data = request.get_json()
    college_name = data.get("college_name")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE colleges SET college_name = %s WHERE college_code = %s",
        (college_name, college_code)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "College updated successfully!"})

# ✅ Delete college
@college_bp.route("/colleges/<college_code>", methods=["DELETE"])
def delete_college(college_code):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM colleges WHERE college_code = %s", (college_code,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "College deleted successfully!"})
