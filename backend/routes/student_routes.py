from flask import Blueprint, jsonify, request
from db_connection import get_db_connection, get_supabase_client
from werkzeug.utils import secure_filename
import uuid
import os
from datetime import datetime
from auth_utils import token_required

student_bp = Blueprint("student", __name__)

# File upload configurations
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes


def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_file(file):
    """Validate file type and size"""
    if not file or not file.filename:
        return None, None
    
    # Check file extension
    if not allowed_file(file.filename):
        return None, "Only PNG, JPG, JPEG, GIF, and WEBP images are allowed"
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    
    if file_size > MAX_FILE_SIZE:
        return None, f"File size exceeds maximum limit of {MAX_FILE_SIZE // (1024*1024)}MB"
    
    return file, None


def generate_unique_filename(student_id, original_filename):
    """Generate a unique filename for the uploaded image"""
    ext = original_filename.rsplit('.', 1)[1].lower()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = uuid.uuid4().hex[:8]
    return f"student_{student_id}_{timestamp}_{unique_id}.{ext}"


def upload_to_supabase(file, filename):
    """Upload file to Supabase storage"""
    try:
        supabase = get_supabase_client()
        if not supabase:
            return None, "Storage service unavailable"
        
        file_bytes = file.read()
        file.seek(0)  # Reset file pointer
        
        # Upload to Supabase
        supabase.storage.from_("student-avatars").upload(
            filename,
            file_bytes,
            {"content-type": file.content_type, "upsert": "false"}
        )
        
        # Get public URL
        avatar_url = supabase.storage.from_("student-avatars").get_public_url(filename)
        return avatar_url, None
        
    except Exception as e:
        print(f"Error uploading to Supabase: {str(e)}")
        return None, f"Failed to upload image: {str(e)}"


def delete_from_supabase(avatar_url):
    """Delete file from Supabase storage"""
    if not avatar_url:
        return
    
    try:
        supabase = get_supabase_client()
        if not supabase:
            return
        
        # Extract filename from URL
        filename = avatar_url.split('/')[-1]
        supabase.storage.from_("student-avatars").remove([filename])
        print(f"Deleted old avatar: {filename}")
        
    except Exception as e:
        print(f"Error deleting from Supabase: {str(e)}")


@student_bp.route("/students", methods=["GET"])
@token_required
def get_students(current_user, current_role):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
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
@token_required
def add_student(current_user, current_role):
    data = request.form
    student_id = data.get("student_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    year_level = data.get("year_level")
    course = data.get("course")
    
    # Validate required fields
    if not all([student_id, first_name, last_name, gender, year_level, course]):
        return jsonify({"error": "All fields are required"}), 400
    
    avatar_url = None
    
    # Handle image upload if present
    if 'avatar' in request.files:
        file = request.files['avatar']
        
        # Validate file
        validated_file, error = validate_file(file)
        if error:
            return jsonify({"error": error}), 400
        
        if validated_file:
            # Generate unique filename
            filename = generate_unique_filename(student_id, file.filename)
            
            # Upload to Supabase
            avatar_url, error = upload_to_supabase(file, filename)
            if error:
                return jsonify({"error": error}), 500

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()

    # Check for duplicate student ID
    cur.execute("SELECT id FROM students WHERE student_id = %s;", (student_id,))
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        return jsonify({"error": f"Student ID '{student_id}' already exists"}), 400

    try:
        cur.execute("""
            INSERT INTO students (student_id, first_name, last_name, gender, year_level, course, avatar_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (student_id, first_name, last_name, gender, year_level, course, avatar_url))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "message": "Student added successfully", 
            "id": new_id,
            "student_id": student_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        # If database insert fails, clean up uploaded image
        if avatar_url:
            delete_from_supabase(avatar_url)
        return jsonify({"error": f"Failed to add student: {str(e)}"}), 500


@student_bp.route("/students/<int:id>", methods=["PUT"])
@token_required
def update_student(current_user, current_role, id):
    data = request.form
    student_id = data.get("student_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    year_level = data.get("year_level")
    course = data.get("course")

    # Validate required fields
    if not all([student_id, first_name, last_name, gender, year_level, course]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()

    # Get current student data
    cur.execute("SELECT student_id, avatar_url FROM students WHERE id = %s;", (id,))
    current_student = cur.fetchone()
    
    if not current_student:
        cur.close()
        conn.close()
        return jsonify({"error": "Student not found"}), 404
    
    old_avatar_url = current_student[1]
    avatar_url = old_avatar_url  # Keep existing avatar by default

    # Handle new image upload
    if 'avatar' in request.files:
        file = request.files['avatar']
        
        # Validate file
        validated_file, error = validate_file(file)
        if error:
            cur.close()
            conn.close()
            return jsonify({"error": error}), 400
        
        if validated_file:
            # Generate unique filename
            filename = generate_unique_filename(student_id, file.filename)
            
            # Upload new image
            new_avatar_url, error = upload_to_supabase(file, filename)
            if error:
                cur.close()
                conn.close()
                return jsonify({"error": error}), 500
            
            avatar_url = new_avatar_url
            
            # Delete old image after successful upload
            if old_avatar_url:
                delete_from_supabase(old_avatar_url)

    # Check for duplicate student ID (excluding current student)
    cur.execute("SELECT id FROM students WHERE student_id = %s AND id != %s;", (student_id, id))
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        return jsonify({"error": f"Student ID '{student_id}' already exists"}), 400

    try:
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

        return jsonify({
            "message": f"Student '{student_id}' updated successfully",
            "id": id
        })
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to update student: {str(e)}"}), 500


@student_bp.route("/students/<int:id>", methods=["DELETE"])
@token_required
def delete_student(current_user, current_role, id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    # Get student info before deleting
    cur.execute("SELECT student_id, avatar_url FROM students WHERE id = %s;", (id,))
    student = cur.fetchone()
    
    if not student:
        cur.close()
        conn.close()
        return jsonify({"error": "Student not found"}), 404
    
    student_id = student[0]
    avatar_url = student[1]
    
    try:
        # Delete from database
        cur.execute("DELETE FROM students WHERE id = %s;", (id,))
        conn.commit()
        cur.close()
        conn.close()
        
        # Delete avatar from Supabase if exists
        if avatar_url:
            delete_from_supabase(avatar_url)
        
        return jsonify({
            "message": f"Student '{student_id}' deleted successfully",
            "id": id
        })
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to delete student: {str(e)}"}), 500


@student_bp.route("/students/<int:id>/remove-avatar", methods=["DELETE"])
@token_required
def remove_avatar(current_user, current_role, id):
    """Remove student's avatar"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    # Get current avatar URL
    cur.execute("SELECT student_id, avatar_url FROM students WHERE id = %s;", (id,))
    student = cur.fetchone()
    
    if not student:
        cur.close()
        conn.close()
        return jsonify({"error": "Student not found"}), 404
    
    student_id = student[0]
    avatar_url = student[1]
    
    if not avatar_url:
        cur.close()
        conn.close()
        return jsonify({"message": "No avatar to remove"}), 200
    
    try:
        # Remove avatar URL from database
        cur.execute("UPDATE students SET avatar_url = NULL WHERE id = %s;", (id,))
        conn.commit()
        cur.close()
        conn.close()
        
        # Delete from Supabase
        delete_from_supabase(avatar_url)
        
        return jsonify({
            "message": f"Avatar removed for student '{student_id}'",
            "id": id
        })
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": f"Failed to remove avatar: {str(e)}"}), 500