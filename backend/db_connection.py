import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "student_system"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", ""),
            port=os.getenv("DB_PORT", "5432")  
        )

        print("PostgreSQL connection successful!")
        return connection

    except (Exception, Error) as error:
        print("Error while connecting to PostgreSQL:", error)
        return None


# Add this new function for Supabase
def get_supabase_client() -> Client:
    """Create and return a Supabase client instance"""
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")  # This will be service_role key
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        
        print(f"Connecting to Supabase with URL: {url}")
        return create_client(url, key)
    
    except Exception as error:
        print(f"Error connecting to Supabase: {error}")
        return None