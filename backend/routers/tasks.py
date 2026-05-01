from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db
from typing import List, Optional
import ml_model

router = APIRouter(
    prefix="/api/tasks",
    tags=["tasks"]
)

@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Verify project exists
    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Verify assignee if provided
    if task.assignee_id:
        assignee = db.query(models.User).filter(models.User.id == task.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")
            
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.TaskDetail])
def get_tasks(
    project_id: Optional[int] = None, 
    status: Optional[models.TaskStatus] = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Task)
    
    if current_user.role != models.RoleEnum.admin:
        # Members only see tasks in projects they belong to
        project_ids = [p.id for p in current_user.projects]
        query = query.filter(models.Task.project_id.in_(project_ids))
        
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
        
    if status:
        query = query.filter(models.Task.status == status)
        
    return query.all()

@router.get("/{task_id}", response_model=schemas.TaskDetail)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if current_user.role != models.RoleEnum.admin:
        if current_user not in task.project.members:
            raise HTTPException(status_code=403, detail="Not a member of this project")
            
    return task

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if current_user.role != models.RoleEnum.admin:
        # Members can only update status of tasks in their projects. They cannot change assignment, title, etc.
        if current_user not in task.project.members:
            raise HTTPException(status_code=403, detail="Not a member of this project")
        
        # Only allow status update for members
        update_data = task_update.model_dump(exclude_unset=True)
        allowed_keys = {"status"}
        for key in update_data:
            if key not in allowed_keys:
                raise HTTPException(status_code=403, detail=f"Members are not allowed to update '{key}'")
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}

@router.post("/{task_id}/comments", response_model=schemas.Comment)
def create_comment(task_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if current_user.role != models.RoleEnum.admin and current_user not in task.project.members:
        raise HTTPException(status_code=403, detail="Not a member of this project")
        
    db_comment = models.Comment(**comment.model_dump(), task_id=task_id, user_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/{task_id}/predict-delay")
def predict_delay(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    desc_len = len(task.description) if task.description else 0
    
    # Calculate user stats
    concurrent_tasks = 0
    completion_rate = 1.0
    
    if task.assignee_id:
        assignee_tasks = db.query(models.Task).filter(models.Task.assignee_id == task.assignee_id).all()
        concurrent_tasks = sum(1 for t in assignee_tasks if t.status != "Done" and t.id != task.id)
        
        total_assigned = len(assignee_tasks)
        if total_assigned > 0:
            completed = sum(1 for t in assignee_tasks if t.status == "Done")
            completion_rate = completed / total_assigned
            
    prob = ml_model.predict_delay_probability(desc_len, concurrent_tasks, completion_rate)
    return {"probability_of_delay": prob}
