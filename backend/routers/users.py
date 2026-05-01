from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import os
import shutil
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter((models.User.email == user.email) | (models.User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    # converting ORM model to Pydantic schema for response
    return {"access_token": access_token, "token_type": "bearer", "user": schemas.User.model_validate(user)}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.get("/me/stats")
def get_user_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    assigned_tasks = current_user.assigned_tasks
    total_tasks = len(assigned_tasks)
    completed_tasks = sum(1 for t in assigned_tasks if t.status == "Done")
    pending_tasks = total_tasks - completed_tasks
    total_projects = len(current_user.projects)
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "total_projects": total_projects,
        "completion_rate": round(completion_rate, 1)
    }

@router.put("/me", response_model=schemas.User)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = auth.get_password_hash(update_data.pop("password"))
        
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/photo", response_model=schemas.User)
def upload_profile_photo(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"user_{current_user.id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    photo_url = f"/uploads/{new_filename}"
    current_user.profile_photo = photo_url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=list[schemas.User])
def read_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Only admins can list all users
    users = db.query(models.User).all()
    return users
