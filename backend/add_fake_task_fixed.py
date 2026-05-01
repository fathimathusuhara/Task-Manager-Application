from sqlalchemy.orm import Session
from database import SessionLocal
import models

db = SessionLocal()

# find first project
project = db.query(models.Project).first()
if project:
    # insert a task
    new_task = models.Task(
        title="Implement Secure Authentication",
        description="We need to build a secure JWT-based authentication system. This is a highly complex task requiring extensive testing and security audits. " * 5,
        status="In Progress",
        project_id=project.id,
    )
    db.add(new_task)
    
    new_task2 = models.Task(
        title="Design Landing Page",
        description="Design the marketing landing page using glassmorphism.",
        status="To Do",
        project_id=project.id,
    )
    db.add(new_task2)
    
    db.commit()
    print("Created fake tasks in project:", project.name)
else:
    print("No projects found. Please create a project first.")
    
db.close()
