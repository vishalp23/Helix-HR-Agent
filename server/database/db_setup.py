import psycopg2
from psycopg2 import sql

def ensure_db_exists(host, port, user, password, db_name):
    """
    Connect to the default 'postgres' database, check if db_name exists.
    If not, create it.
    """
    try:
        # Connect to the default 'postgres' DB
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database="postgres"  # default DB
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Check if the target database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (db_name,))
        exists = cur.fetchone()
        if not exists:
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
            print(f"✅ Database '{db_name}' created successfully.")
        else:
            print(f"✅ Database '{db_name}' already exists.")

        cur.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"❌ Error ensuring database exists: {e}")

def connect_and_create_table(host, port, user, password, db_name):
    """
    Connect to the specified db_name and create necessary tables.
    """
    try:
        # Connect to the target database
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=db_name
        )
        cur = conn.cursor()
        print(f"🔗 Connected to PostgreSQL database '{db_name}'")

        # Create a table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                task_id INT NOT NULL,
                description TEXT NOT NULL,
                execution_status VARCHAR(20) DEFAULT 'pending',
                result TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        print("✅ Tables created successfully (if they didn't exist).")

        # Close
        cur.close()
        conn.close()
        print("🔌 PostgreSQL connection closed.")

    except psycopg2.Error as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")

# Functions for inserting data
def insert_message(sender: str, content: str):
    """Insert a message into the messages table."""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="mydatabase",
            user="postgres",
            password="mysecretpassword"
        )
        cur = conn.cursor()
        cur.execute("INSERT INTO messages (sender, content) VALUES (%s, %s);", (sender, content))
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Message inserted successfully.")
    except psycopg2.Error as e:
        print(f"❌ Error inserting message: {e}")

def insert_task(task_id: int, description: str, execution_status: str = "pending", result: str = None):
    """Insert a task into the tasks table."""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="mydatabase",
            user="postgres",
            password="mysecretpassword"
        )
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO tasks (task_id, description, execution_status, result) VALUES (%s, %s, %s, %s);",
            (task_id, description, execution_status, result)
        )
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Task inserted successfully.")
    except psycopg2.Error as e:
        print(f"❌ Error inserting task: {e}")
