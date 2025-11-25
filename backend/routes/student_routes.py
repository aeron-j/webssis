from flask import Blueprint, jsonify, request
from db_connection import get_db_connection, get_supabase_client
from werkzeug.utils import secure_filename
import uuid
import os

student_bp = Blueprint("student", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@student_bp.route("/students", methods=["GET"])
def get_students():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            s.id,
            s.student_id,
            s.first_name,
            s.last_name,
            s.gender,
            s.year_level,
            s.course, 
            p.college,
            s.avatar_url
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
            "course": s[6],      
            "college": s[7],
            "avatar_url": s[8],
        })
    return jsonify(result)


@student_bp.route("/students", methods=["POST"])
def add_student():
    data = request.form
    student_id = data.get("student_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    year_level = data.get("year_level")
    course = data.get("course")
    
    avatar_url = None
    
    # Handle image upload
    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename and allowed_file(file.filename):
            try:
                supabase = get_supabase_client()
                
                # Generate unique filename
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{student_id}_{uuid.uuid4().hex}.{ext}"
                
                # Upload to Supabase
                file_bytes = file.read()
                supabase.storage.from_("student-avatars").upload(
                    filename,
                    file_bytes,
                    {"content-type": file.content_type}
                )
                
                # Get public URL
                avatar_url = supabase.storage.from_("student-avatars").get_public_url(filename)
                
            except Exception as e:
                print(f"Error uploading image: {e}")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check for duplicate student ID
    cur.execute("SELECT id FROM students WHERE student_id = %s;", (student_id,))
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        return jsonify({"error": "❌ Student ID already exists!"}), 400

    cur.execute("""
        INSERT INTO students (student_id, first_name, last_name, gender, year_level, course, avatar_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (student_id, first_name, last_name, gender, year_level, course, avatar_url))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✅ Student added successfully", "id": new_id}), 201


@student_bp.route("/students/<int:id>", methods=["PUT"])
def update_student(id):
    data = request.form
    student_id = data.get("student_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    year_level = data.get("year_level")
    course = data.get("course")

    conn = get_db_connection()
    cur = conn.cursor()

    # Get current student data
    cur.execute("SELECT avatar_url FROM students WHERE id = %s;", (id,))
    current_student = cur.fetchone()
    avatar_url = current_student[0] if current_student else None

    # Handle new image upload
    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename and allowed_file(file.filename):
            try:
                supabase = get_supabase_client()
                
                # Delete old image if exists
                if avatar_url:
                    old_filename = avatar_url.split('/')[-1]
                    try:
                        supabase.storage.from_("student-avatars").remove([old_filename])
                    except:
                        pass
                
                # Upload new image
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{student_id}_{uuid.uuid4().hex}.{ext}"
                
                file_bytes = file.read()
                supabase.storage.from_("student-avatars").upload(
                    filename,
                    file_bytes,
                    {"content-type": file.content_type}
                )
                
                avatar_url = supabase.storage.from_("student-avatars").get_public_url(filename)
                
            except Exception as e:
                print(f"Error uploading image: {e}")

    # Check for duplicate student ID
    cur.execute("SELECT id FROM students WHERE student_id = %s AND id != %s;", (student_id, id))
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        return jsonify({"error": "❌ Student ID already exists!"}), 400

    cur.execute("""
        UPDATE students
        SET student_id = %s,
            first_name = %s,
            last_name = %s,
            gender = %s,
            year_level = %s,
            course = %s,
            avatar_url = %s
        WHERE id = %s;
    """, (student_id, first_name, last_name, gender, year_level, course, avatar_url, id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": f"✏ Student ID {id} updated successfully"})


@student_bp.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get avatar URL before deleting
    cur.execute("SELECT avatar_url FROM students WHERE id = %s;", (id,))
    student = cur.fetchone()
    
    if student and student[0]:
        try:
            supabase = get_supabase_client()
            filename = student[0].split('/')[-1]
            supabase.storage.from_("student-avatars").remove([filename])
        except Exception as e:
            print(f"Error deleting image: {e}")
    
    cur.execute("DELETE FROM students WHERE id = %s;", (id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": f"🗑 Student ID {id} deleted successfully"})