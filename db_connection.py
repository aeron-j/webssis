import psycopg2
from psycopg2 import Error

def get_db_connection():
    try:
        # Connect to your PostgreSQL database
        connection = psycopg2.connect(
            host="localhost",
            database="student_system",   # your database name
            user="postgres",             # your PostgreSQL user
            password="dale2259863",    # replace with your PostgreSQL password
            port="5432"
        )

        print("✅ PostgreSQL connection successful!")
        return connection

    except (Exception, Error) as error:
        print("❌ Error while connecting to PostgreSQL:", error)
        return None
