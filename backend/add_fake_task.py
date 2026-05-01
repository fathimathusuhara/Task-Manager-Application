import requests

# Let's see if we can log in and create a task
# First we need a user. I will just create a quick task directly in the DB.
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime

db = SessionLocal()

# find first project
project = db.query(models.Project).first()
if project:
    # insert a task
    new_task = models.Task(
        title="Test Task for ML",
        description="This is a very long description to trigger the ML model. " * 20,
        status="To Do",
        project_id=project.id,
    )
    db.add(new_task)
    db.commit()
    print("Created fake task in project:", project.name)
else:
    print("No projects found.")
    
db.close()
