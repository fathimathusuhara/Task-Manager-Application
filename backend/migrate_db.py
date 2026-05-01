import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "sql_app.db")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    columns_to_add = [
        ("profile_photo", "TEXT"),
        ("department", "TEXT"),
        ("position", "TEXT"),
        ("bio", "TEXT"),
        ("phone", "TEXT"),
        ("location", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists")
            else:
                print(f"Error adding {col_name}: {e}")
                
    conn.commit()
    conn.close()
    print("Migration complete.")
else:
    print("Database does not exist yet. SQLAlchemy will create it with the new schema.")
