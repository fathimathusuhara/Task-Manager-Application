import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from database import engine, Base, SQLALCHEMY_DATABASE_URL
import models, auth

# Create tables
print("Creating tables if they don't exist...")
Base.metadata.create_all(bind=engine)

# Check for missing columns (simple migration helper)
inspector = inspect(engine)
columns = [col['name'] for col in inspector.get_columns('users')]
expected_columns = ["profile_photo", "department", "position", "bio", "phone", "location"]

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Add missing columns
    for col in expected_columns:
        if col not in columns:
            print(f"Adding column {col} to users table...")
            # Use text() for raw SQL
            alter_query = text(f"ALTER TABLE users ADD COLUMN {col} TEXT")
            db.execute(alter_query)
            db.commit()

    # Check if admin exists, if not create one
    admin_user = db.query(models.User).filter(models.User.role == models.RoleEnum.admin).first()
    if not admin_user:
        print("No admin user found. Creating default admin...")
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        
        hashed_password = auth.get_password_hash(admin_password)
        new_admin = models.User(
            username=admin_username,
            email=admin_email,
            hashed_password=hashed_password,
            role=models.RoleEnum.admin,
            department="Management",
            position="System Administrator",
            bio="Default administrator account."
        )
        db.add(new_admin)
        db.commit()
        print(f"Admin user '{admin_username}' created successfully.")
    else:
        print(f"Admin user '{admin_user.username}' already exists.")

except Exception as e:
    print(f"Error during initialization: {e}")
    db.rollback()
finally:
    db.close()

print("Database initialization complete.")
