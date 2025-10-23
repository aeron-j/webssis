from flask import Blueprint, jsonify, request
from db_connection import get_db_connection

student_bp = Blueprint("student", __name__)

# 🔹 Get all students (with program + college info)
@student_bp.route("/students", methods=["GET"])
def get_students():
    conn = get_db_connection()
    cur = conn.cursor()

    # ✅ Join programs and colleges to include college info
    cur.execute("""
        SELECT 
            s.id,
            s.student_id,
            s.first_name,
            s.last_name,
            s.gender,
            s.year_level,
            s.course, 
            p.college  -- from programs table
        FROM students s
        LEFT JOIN programs p ON s.course = p.program_code
        ORDER BY s.id ASC;
    """)
    students = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for s in students:
        result.append({
            "id": s[0],
            "student_id": s[1],
            "first_name": s[2],
            "last_name": s[3],
            "gender": s[4],
            "year_level": s[5],
            "course": s[6],      # program code
            "college": s[7],     # ✅ added
        })
    return jsonify(result)


# 🔹 Add new student
@student_bp.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()
    student_id = data.get("student_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    year_level = data.get("year_level")
    course = data.get("course")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO students (student_id, first_name, last_name, gender, year_level, course)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (student_id, first_name, last_name, gender, year_level, course))
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
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    year_level = data.get("year_level")
    course = data.get("course")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE students
        SET student_id = %s,
            first_name = %s,
            last_name = %s,
            gender = %s,
            year_level = %s,
            course = %s
        WHERE id = %s;
    """, (student_id, first_name, last_name, gender, year_level, course, id))
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
