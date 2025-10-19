import psycopg2
from psycopg2 import Error
from dotenv import load_dotenv
import os

# ✅ Load environment variables from .env
load_dotenv()

def get_db_connection():
    try:
        # ✅ Fetch database credentials from .env
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "student_system"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", ""),
            port=os.getenv("DB_PORT", "5432")  # optional — defaults to 5432
        )

        print("✅ PostgreSQL connection successful!")
        return connection

    except (Exception, Error) as error:
        print("❌ Error while connecting to PostgreSQL:", error)
        return None
