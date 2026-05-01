from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db
from typing import List

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)

@router.post("/", response_model=schemas.ProjectDetail)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Only admins can create projects
    db_project = models.Project(**project.model_dump())
    # Add creator to the project members
    db_project.members.append(current_user)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=schemas.ProjectDetail)
def update_project(project_id: int, project_update: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project.name = project_update.name
    project.description = project_update.description
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db.delete(project)
    db.commit()
    return {"detail": "Project deleted successfully"}

@router.get("/", response_model=list[schemas.Project])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Admins see all projects, members see projects they are part of
    if current_user.role == models.RoleEnum.admin:
        projects = db.query(models.Project).all()
    else:
        projects = current_user.projects
    return projects

@router.get("/invitations/me", response_model=List[schemas.ProjectInvitation])
def get_my_invitations(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    invitations = db.query(models.ProjectInvitation).filter(
        models.ProjectInvitation.user_id == current_user.id,
        models.ProjectInvitation.status == "pending"
    ).all()
    return invitations

@router.post("/invitations/{invitation_id}/accept")
def accept_invitation(invitation_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    invitation = db.query(models.ProjectInvitation).filter(models.ProjectInvitation.id == invitation_id).first()
    if not invitation or invitation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation is no longer pending")
        
    invitation.status = "accepted"
    if current_user not in invitation.project.members:
        invitation.project.members.append(current_user)
        
    db.commit()
    return {"detail": "Invitation accepted"}

@router.post("/invitations/{invitation_id}/decline")
def decline_invitation(invitation_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    invitation = db.query(models.ProjectInvitation).filter(models.ProjectInvitation.id == invitation_id).first()
    if not invitation or invitation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation is no longer pending")
        
    invitation.status = "declined"
    db.commit()
    return {"detail": "Invitation declined"}

@router.get("/{project_id}", response_model=schemas.ProjectDetail)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if member has access
    if current_user.role != models.RoleEnum.admin and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not a member of this project")
    
    return project

@router.post("/{project_id}/members/{user_id}")
def invite_project_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user in project.members:
        raise HTTPException(status_code=400, detail="User is already a member")
        
    existing_invite = db.query(models.ProjectInvitation).filter(
        models.ProjectInvitation.project_id == project_id,
        models.ProjectInvitation.user_id == user_id,
        models.ProjectInvitation.status == "pending"
    ).first()
    
    if existing_invite:
        raise HTTPException(status_code=400, detail="User already has a pending invitation")
        
    invitation = models.ProjectInvitation(project_id=project_id, user_id=user_id)
    db.add(invitation)
    db.commit()
    
    return {"detail": "Invitation sent successfully"}

@router.delete("/{project_id}/members/{user_id}", response_model=schemas.ProjectDetail)
def remove_project_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user in project.members:
        project.members.remove(user)
        db.commit()
        db.refresh(project)
        
    return project
