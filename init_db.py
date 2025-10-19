import psycopg2
from db_connection import create_connection as get_db_connection

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Example: create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS colleges (
        id SERIAL PRIMARY KEY,
        college_code VARCHAR(10) UNIQUE NOT NULL,
        college_name VARCHAR(100) NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        program_code VARCHAR(10) UNIQUE NOT NULL,
        program_name VARCHAR(100) NOT NULL,
        college_id INT REFERENCES colleges(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        program_id INT REFERENCES programs(id) ON DELETE SET NULL
    );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database initialized successfully!")

if __name__ == "__main__":
    init_db()
