"""
Student Service Layer
Handles all database operations and image management for students
"""

from db_connection import get_db_connection, get_supabase_client
import uuid
import os
from datetime import datetime


class StudentService:
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    
    @staticmethod
    def validate_file(file):
        """Validate file type and size"""
        if not file or not file.filename:
            return None, None
        
        # Check file extension
        if '.' not in file.filename:
            return None, "Invalid file format"
        
        ext = file.filename.rsplit('.', 1)[1].lower()
        if ext not in StudentService.ALLOWED_EXTENSIONS:
            return None, "Only PNG, JPG, JPEG, GIF, and WEBP images are allowed"
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        if file_size > StudentService.MAX_FILE_SIZE:
            return None, f"File size exceeds maximum limit of {StudentService.MAX_FILE_SIZE // (1024*1024)}MB"
        
        return file, None
    
    
    @staticmethod
    def generate_unique_filename(student_id, original_filename):
        """Generate a unique filename for the uploaded image"""
        ext = original_filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        return f"student_{student_id}_{timestamp}_{unique_id}.{ext}"
    
    
    @staticmethod
    def upload_image(file, filename):
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
    
    
    @staticmethod
    def delete_image(avatar_url):
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
            print(f"Deleted avatar: {filename}")
            
        except Exception as e:
            print(f"Error deleting from Supabase: {str(e)}")
    
    
    @staticmethod
    def get_all_students():
        """Retrieve all students with their college information"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        try:
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
            return result, None
            
        except Exception as e:
            if conn:
                conn.close()
            return None, f"Failed to fetch students: {str(e)}"
    
    
    @staticmethod
    def create_student(student_id, first_name, last_name, gender, year_level, course, avatar_url=None):
        """Create a new student"""
        if not all([student_id, first_name, last_name, gender, year_level, course]):
            return None, "All fields are required"
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check for duplicate student ID
            cur.execute("SELECT id FROM students WHERE student_id = %s;", (student_id,))
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, f"Student ID '{student_id}' already exists"
            
            # Insert new student
            cur.execute("""
                INSERT INTO students (student_id, first_name, last_name, gender, year_level, course, avatar_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (student_id, first_name, last_name, gender, year_level, course, avatar_url))
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {"id": new_id, "student_id": student_id}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to create student: {str(e)}"
    
    
    @staticmethod
    def get_student_by_id(student_id):
        """Get student information by ID"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        try:
            cur = conn.cursor()
            cur.execute("SELECT student_id, avatar_url FROM students WHERE id = %s;", (student_id,))
            student = cur.fetchone()
            cur.close()
            conn.close()
            
            if not student:
                return None, "Student not found"
            
            return {"student_id": student[0], "avatar_url": student[1]}, None
            
        except Exception as e:
            if conn:
                conn.close()
            return None, f"Failed to fetch student: {str(e)}"
    
    
    @staticmethod
    def update_student(student_id, data, new_avatar_url=None):
        """Update student information"""
        required_fields = ['student_id', 'first_name', 'last_name', 'gender', 'year_level', 'course']
        if not all(field in data for field in required_fields):
            return None, "All fields are required"
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check for duplicate student ID (excluding current student)
            cur.execute(
                "SELECT id FROM students WHERE student_id = %s AND id != %s;", 
                (data['student_id'], student_id)
            )
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, f"Student ID '{data['student_id']}' already exists"
            
            # Determine avatar URL to use
            avatar_url = new_avatar_url if new_avatar_url is not None else data.get('avatar_url')
            
            # Update student
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
            """, (
                data['student_id'], 
                data['first_name'], 
                data['last_name'], 
                data['gender'], 
                data['year_level'], 
                data['course'], 
                avatar_url, 
                student_id
            ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"id": student_id, "student_id": data['student_id']}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to update student: {str(e)}"
    
    
    @staticmethod
    def delete_student(student_id):
        """Delete a student"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Get student info before deleting
            cur.execute("SELECT student_id, avatar_url FROM students WHERE id = %s;", (student_id,))
            student = cur.fetchone()
            
            if not student:
                cur.close()
                conn.close()
                return None, "Student not found"
            
            student_code = student[0]
            avatar_url = student[1]
            
            # Delete from database
            cur.execute("DELETE FROM students WHERE id = %s;", (student_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {"student_id": student_code, "avatar_url": avatar_url}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to delete student: {str(e)}"
    
    
    @staticmethod
    def remove_avatar(student_id):
        """Remove student's avatar"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Get current avatar URL
            cur.execute("SELECT student_id, avatar_url FROM students WHERE id = %s;", (student_id,))
            student = cur.fetchone()
            
            if not student:
                cur.close()
                conn.close()
                return None, "Student not found"
            
            student_code = student[0]
            avatar_url = student[1]
            
            if not avatar_url:
                cur.close()
                conn.close()
                return {"student_id": student_code, "had_avatar": False}, None
            
            # Remove avatar URL from database
            cur.execute("UPDATE students SET avatar_url = NULL WHERE id = %s;", (student_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {"student_id": student_code, "avatar_url": avatar_url, "had_avatar": True}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to remove avatar: {str(e)}"