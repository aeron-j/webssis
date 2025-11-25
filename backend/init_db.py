import psycopg2
from db_connection import get_db_connection

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create colleges table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS colleges (
        id SERIAL PRIMARY KEY,
        college_code VARCHAR(10) UNIQUE NOT NULL,
        college_name VARCHAR(100) NOT NULL
    );
    """)

    # Create programs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        program_code VARCHAR(10) UNIQUE NOT NULL,
        program_name VARCHAR(100) NOT NULL,
        college VARCHAR(10) REFERENCES colleges(college_code) ON DELETE CASCADE
    );
    """)

    # Create students table with all necessary columns
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        year_level VARCHAR(20) NOT NULL,
        course VARCHAR(10) REFERENCES programs(program_code) ON DELETE SET NULL,
        avatar_url TEXT
    );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database initialized successfully!")

if __name__ == "__main__":
    init_db()