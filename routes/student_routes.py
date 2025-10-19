from flask import Blueprint, jsonify, request
from db_connection import get_db_connection

student_bp = Blueprint("student", __name__)

# 🔹 Get all students
@student_bp.route("/students", methods=["GET"])
def get_students():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, student_id, name, program_id
        FROM students
        ORDER BY id ASC;
    """)
    students = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for s in students:
        result.append({
            "id": s[0],
            "student_id": s[1],
            "name": s[2],
            "program_id": s[3]
        })
    return jsonify(result)

# 🔹 Add new student
@student_bp.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()
    student_id = data.get("student_id")
    name = data.get("name")
    program_id = data.get("program_id")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO students (student_id, name, program_id)
        VALUES (%s, %s, %s)
        RETURNING id;
        """,
        (student_id, name, program_id),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✅ Student added successfully", "id": new_id}), 201

# 🔹 Update existing student
@student_bp.route("/students/<int:id>", methods=["PUT"])
def update_student(id):
    data = request.get_json()
    student_id = data.get("student_id")
    name = data.get("name")
    program_id = data.get("program_id")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE students
        SET student_id = %s, name = %s, program_id = %s
        WHERE id = %s;
        """,
        (student_id, name, program_id, id),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": f"✏ Student ID {id} updated successfully"})

# 🔹 Delete student
@student_bp.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE id = %s;", (id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": f"🗑 Student ID {id} deleted successfully"})
