from flask import Blueprint, jsonify, request
from auth_utils import token_required
from services.student_service import StudentService

student_bp = Blueprint("student", __name__)


@student_bp.route("/students", methods=["GET"])
@token_required
def get_students(current_user, current_role):
    students, error = StudentService.get_all_students()
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify(students)


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
    
    avatar_url = None
    
    # Handle image upload if present
    if 'avatar' in request.files:
        file = request.files['avatar']
        
        # Validate file
        validated_file, error = StudentService.validate_file(file)
        if error:
            return jsonify({"error": error}), 400
        
        if validated_file:
            # Generate unique filename
            filename = StudentService.generate_unique_filename(student_id, file.filename)
            
            # Upload to Supabase
            avatar_url, error = StudentService.upload_image(file, filename)
            if error:
                return jsonify({"error": error}), 500
    
    # Create student
    student, error = StudentService.create_student(
        student_id, first_name, last_name, gender, year_level, course, avatar_url
    )
    
    if error:
        # Clean up uploaded image if student creation fails
        if avatar_url:
            StudentService.delete_image(avatar_url)
        
        status_code = 400 if "already exists" in error or "required" in error else 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": "Student added successfully", "student": student}), 201


@student_bp.route("/students/<int:id>", methods=["PUT"])
@token_required
def update_student(current_user, current_role, id):
    data = request.form
    student_data = {
        "student_id": data.get("student_id"),
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "gender": data.get("gender"),
        "year_level": data.get("year_level"),
        "course": data.get("course")
    }
    
    # Get current student info
    current_student, error = StudentService.get_student_by_id(id)
    if error:
        status_code = 404 if "not found" in error else 500
        return jsonify({"error": error}), status_code
    
    old_avatar_url = current_student.get("avatar_url")
    new_avatar_url = None
    
    # Handle new image upload
    if 'avatar' in request.files:
        file = request.files['avatar']
        
        # Validate file
        validated_file, error = StudentService.validate_file(file)
        if error:
            return jsonify({"error": error}), 400
        
        if validated_file:
            # Generate unique filename
            filename = StudentService.generate_unique_filename(student_data["student_id"], file.filename)
            
            # Upload new image
            new_avatar_url, error = StudentService.upload_image(file, filename)
            if error:
                return jsonify({"error": error}), 500
    
    # Update student
    student, error = StudentService.update_student(id, student_data, new_avatar_url)
    
    if error:
        status_code = 400 if "already exists" in error or "required" in error else 500
        return jsonify({"error": error}), status_code
    
    # Delete old image if new one was uploaded successfully
    if new_avatar_url and old_avatar_url:
        StudentService.delete_image(old_avatar_url)
    
    return jsonify({"message": f"Student '{student_data['student_id']}' updated successfully", "student": student})


@student_bp.route("/students/<int:id>", methods=["DELETE"])
@token_required
def delete_student(current_user, current_role, id):
    student, error = StudentService.delete_student(id)
    
    if error:
        status_code = 404 if "not found" in error else 500
        return jsonify({"error": error}), status_code
    
    # Delete avatar if exists
    if student.get("avatar_url"):
        StudentService.delete_image(student["avatar_url"])
    
    return jsonify({"message": f"Student '{student['student_id']}' deleted successfully"})


@student_bp.route("/students/<int:id>/remove-avatar", methods=["DELETE"])
@token_required
def remove_avatar(current_user, current_role, id):
    result, error = StudentService.remove_avatar(id)
    
    if error:
        status_code = 404 if "not found" in error else 500
        return jsonify({"error": error}), status_code
    
    # Delete from Supabase if avatar existed
    if result.get("had_avatar") and result.get("avatar_url"):
        StudentService.delete_image(result["avatar_url"])
    
    message = f"Avatar removed for student '{result['student_id']}'" if result.get("had_avatar") else "No avatar to remove"
    return jsonify({"message": message})