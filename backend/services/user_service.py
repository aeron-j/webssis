"""
User Service Layer
Handles all database operations for users and authentication
"""

from db_connection import get_db_connection
import hashlib


class UserService:
    
    @staticmethod
    def authenticate_user(username, password):
        """Authenticate user with username and password"""
        if not username or not password:
            return None, "Username and password are required"
        
        hashed_pw = hashlib.sha256(password.encode()).hexdigest()
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT role FROM users WHERE username = %s AND password = %s",
                (username, hashed_pw),
            )
            user = cur.fetchone()
            cur.close()
            conn.close()
            
            if user:
                return {"username": username, "role": user[0]}, None
            else:
                return None, "Invalid username or password"
                
        except Exception as e:
            if conn:
                conn.close()
            return None, f"Authentication failed: {str(e)}"
    
    
    @staticmethod
    def get_all_users():
        """Retrieve all users (admin only)"""
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, username, role FROM users ORDER BY id")
            users = cur.fetchall()
            cur.close()
            conn.close()
            
            user_list = [{"id": u[0], "username": u[1], "role": u[2]} for u in users]
            return user_list, None
            
        except Exception as e:
            if conn:
                conn.close()
            return None, f"Failed to fetch users: {str(e)}"
    
    
    @staticmethod
    def create_user(username, password, role="staff"):
        """Create a new user (admin only)"""
        if not username or not password:
            return None, "Username and password are required"
        
        hashed_pw = hashlib.sha256(password.encode()).hexdigest()
        
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        try:
            # Check if username already exists
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                cur.close()
                conn.close()
                return None, "Username already exists"
            
            # Insert new user
            cur.execute(
                "INSERT INTO users (username, password, role) VALUES (%s, %s, %s) RETURNING id",
                (username, hashed_pw, role),
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {"id": new_id, "username": username, "role": role}, None
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return None, f"Failed to create user: {str(e)}"