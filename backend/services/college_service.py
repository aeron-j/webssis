"""
College Service Layer
Handles all database operations for colleges
"""

from db_connection import get_db_connection


class CollegeService:
    
    @staticmethod
    def get_all_colleges():
        """Retrieve all colleges ordered by college code"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        try:
            cur = conn.cursor()
            cur.execute("SELECT college_code, college_name FROM colleges ORDER BY college_code;")
            colleges = cur.fetchall()
            cur.close()
            conn.close()
            
            return [{"college_code": row[0], "college_name": row[1]} for row in colleges], None
        except Exception as e:
            if conn:
                conn.close()
            return None, f"Failed to fetch colleges: {str(e)}"
    
    
    @staticmethod
    def create_college(college_code, college_name):
        """Create a new college"""
        if not college_code or not college_name:
            return None, "College code and name are required"
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check for duplicates (case-insensitive)
            cur.execute(
                "SELECT 1 FROM colleges WHERE LOWER(college_code) = LOWER(%s) OR LOWER(college_name) = LOWER(%s)",
                (college_code, college_name)
            )
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, "College code or name already exists"
            
            # Insert new college
            cur.execute(
                "INSERT INTO colleges (college_code, college_name) VALUES (%s, %s) RETURNING college_code",
                (college_code, college_name)
            )
            new_code = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {"college_code": new_code, "college_name": college_name}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to create college: {str(e)}"
    
    
    @staticmethod
    def update_college(college_code, new_code, college_name):
        """Update an existing college"""
        if not new_code or not college_name:
            return None, "College code and name are required"
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check if another college has the same code or name
            cur.execute(
                """
                SELECT 1 FROM colleges 
                WHERE (LOWER(college_code) = LOWER(%s) OR LOWER(college_name) = LOWER(%s))
                AND LOWER(college_code) != LOWER(%s)
                """,
                (new_code, college_name, college_code)
            )
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, "Another college already has that code or name"
            
            # Update college
            cur.execute(
                "UPDATE colleges SET college_code = %s, college_name = %s WHERE college_code = %s",
                (new_code, college_name, college_code)
            )
            
            if cur.rowcount == 0:
                conn.rollback()
                cur.close()
                conn.close()
                return None, "College not found"
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {"college_code": new_code, "college_name": college_name}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to update college: {str(e)}"
    
    
    @staticmethod
    def delete_college(college_code):
        """Delete a college"""
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            cur.execute("DELETE FROM colleges WHERE college_code = %s", (college_code,))
            
            if cur.rowcount == 0:
                conn.rollback()
                cur.close()
                conn.close()
                return False, "College not found"
            
            conn.commit()
            cur.close()
            conn.close()
            
            return True, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return False, f"Failed to delete college: {str(e)}"