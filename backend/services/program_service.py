"""
Program Service Layer
Handles all database operations for programs
"""

from db_connection import get_db_connection


class ProgramService:
    
    @staticmethod
    def get_all_programs():
        """Retrieve all programs ordered by program code"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        try:
            cur = conn.cursor()
            cur.execute("SELECT program_code, program_name, college FROM programs ORDER BY program_code;")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            
            programs = [{"code": r[0], "name": r[1], "college": r[2]} for r in rows]
            return programs, None
        except Exception as e:
            if conn:
                conn.close()
            return None, f"Failed to fetch programs: {str(e)}"
    
    
    @staticmethod
    def create_program(program_code, program_name, college):
        """Create a new program"""
        if not program_code or not program_name or not college:
            return None, "Program code, name, and college are required"
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check for duplicates (case-insensitive)
            cur.execute(
                """
                SELECT 1 FROM programs
                WHERE LOWER(program_code) = LOWER(%s)
                OR LOWER(program_name) = LOWER(%s)
                """,
                (program_code, program_name),
            )
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, "Program code or name already exists"
            
            # Insert new program
            cur.execute(
                "INSERT INTO programs (program_code, program_name, college) VALUES (%s, %s, %s) RETURNING program_code",
                (program_code, program_name, college),
            )
            new_code = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {"code": new_code, "name": program_name, "college": college}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to create program: {str(e)}"
    
    
    @staticmethod
    def update_program(program_code, new_code, program_name, college):
        """Update an existing program"""
        if not new_code or not program_name or not college:
            return None, "Program code, name, and college are required"
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check if another program has the same code or name
            cur.execute(
                """
                SELECT 1 FROM programs
                WHERE (LOWER(program_code) = LOWER(%s) OR LOWER(program_name) = LOWER(%s))
                AND LOWER(program_code) != LOWER(%s)
                """,
                (new_code, program_name, program_code),
            )
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, "Another program already has that code or name"
            
            # Update program
            cur.execute(
                "UPDATE programs SET program_code = %s, program_name = %s, college = %s WHERE program_code = %s",
                (new_code, program_name, college, program_code),
            )
            
            if cur.rowcount == 0:
                conn.rollback()
                cur.close()
                conn.close()
                return None, "Program not found"
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"code": new_code, "name": program_name, "college": college}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to update program: {str(e)}"
    
    
    @staticmethod
    def delete_program(program_code):
        """Delete a program"""
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            cur.execute("DELETE FROM programs WHERE program_code = %s", (program_code,))
            
            if cur.rowcount == 0:
                conn.rollback()
                cur.close()
                conn.close()
                return False, "Program not found"
            
            conn.commit()
            cur.close()
            conn.close()
            
            return True, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return False, f"Failed to delete program: {str(e)}"