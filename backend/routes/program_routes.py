from flask import Blueprint, jsonify, request
from auth_utils import token_required
from services.program_service import ProgramService

program_bp = Blueprint("program", __name__)


@program_bp.route("/programs", methods=["GET"])
@token_required
def get_programs(current_user, current_role):
    programs, error = ProgramService.get_all_programs()
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify(programs)


@program_bp.route("/programs", methods=["POST"])
@token_required
def add_program(current_user, current_role):
    data = request.get_json()
    program_code = data.get("program_code")
    program_name = data.get("program_name")
    college = data.get("college")
    
    program, error = ProgramService.create_program(program_code, program_name, college)
    
    if error:
        status_code = 400 if "already exists" in error or "required" in error else 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": "Program added successfully", "program": program}), 201


@program_bp.route("/programs/<program_code>", methods=["PUT"])
@token_required
def update_program(current_user, current_role, program_code):
    data = request.get_json()
    new_code = data.get("program_code")
    program_name = data.get("program_name")
    college = data.get("college")
    
    program, error = ProgramService.update_program(program_code, new_code, program_name, college)
    
    if error:
        if "not found" in error:
            status_code = 404
        elif "already" in error or "required" in error:
            status_code = 400
        else:
            status_code = 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": f"Program '{program_code}' updated successfully", "program": program})


@program_bp.route("/programs/<program_code>", methods=["DELETE"])
@token_required
def delete_program(current_user, current_role, program_code):
    success, error = ProgramService.delete_program(program_code)
    
    if not success:
        status_code = 404 if "not found" in error else 500
        return jsonify({"error": error}), status_code
    
    return jsonify({"message": f"Program '{program_code}' deleted successfully"})