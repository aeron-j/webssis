from flask import Blueprint, jsonify, request
from auth_utils import token_required
from services.college_service import CollegeService

college_bp = Blueprint("college_bp", __name__)


@college_bp.route("/colleges", methods=["GET"])
@token_required
def get_colleges(current_user, current_role):
    colleges, error = CollegeService.get_all_colleges()
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify(colleges)


@college_bp.route("/colleges", methods=["POST"])
@token_required
def add_college(current_user, current_role):
    data = request.get_json()
    college_code = data.get("college_code")
    college_name = data.get("college_name")
    
    college, error = CollegeService.create_college(college_code, college_name)
    
    if error:
        status_code = 400 if "already exists" in error or "required" in error else 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": "College added successfully", "college": college}), 201


@college_bp.route("/colleges/<college_code>", methods=["PUT"])
@token_required
def update_college(current_user, current_role, college_code):
    data = request.get_json()
    new_code = data.get("college_code")
    college_name = data.get("college_name")
    
    college, error = CollegeService.update_college(college_code, new_code, college_name)
    
    if error:
        if "not found" in error:
            status_code = 404
        elif "already" in error or "required" in error:
            status_code = 400
        else:
            status_code = 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": f"College '{college_code}' updated successfully", "college": college})


@college_bp.route("/colleges/<college_code>", methods=["DELETE"])
@token_required
def delete_college(current_user, current_role, college_code):
    success, error = CollegeService.delete_college(college_code)
    
    if not success:
        status_code = 404 if "not found" in error else 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": f"College '{college_code}' deleted successfully"})