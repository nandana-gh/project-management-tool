from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import models, schemas
from datetime import datetime, date
import uuid
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# User CRUD
def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        user_id=str(uuid.uuid4()),
        username=user.username,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: str, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["password"] = get_password_hash(update_data["password"])
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: str):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Project CRUD
def get_project(db: Session, project_id: str):
    return db.query(models.Project).filter(models.Project.project_id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

def create_project(db: Session, project: schemas.ProjectCreate, created_by: str):
    db_project = models.Project(
        project_id=str(uuid.uuid4()),
        project_name=project.project_name,
        program_type=project.program_type,
        description=project.description,
        created_by=created_by
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_update: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
    if db_project:
        update_data = project_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: str):
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project

# Subsystem CRUD
def get_subsystem(db: Session, subsystem_id: str):
    return db.query(models.Subsystem).filter(models.Subsystem.subsystem_id == subsystem_id).first()

def get_subsystems(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Subsystem).offset(skip).limit(limit).all()

def create_subsystem(db: Session, subsystem: schemas.SubsystemCreate):
    db_subsystem = models.Subsystem(
        subsystem_id=str(uuid.uuid4()),
        subsystem_name=subsystem.subsystem_name,
        description=subsystem.description
    )
    db.add(db_subsystem)
    db.commit()
    db.refresh(db_subsystem)
    return db_subsystem

def update_subsystem(db: Session, subsystem_id: str, subsystem_update: schemas.SubsystemUpdate):
    db_subsystem = get_subsystem(db, subsystem_id)
    if db_subsystem:
        update_data = subsystem_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_subsystem, field, value)
        db.commit()
        db.refresh(db_subsystem)
    return db_subsystem

def delete_subsystem(db: Session, subsystem_id: str):
    db_subsystem = get_subsystem(db, subsystem_id)
    if db_subsystem:
        db.delete(db_subsystem)
        db.commit()
    return db_subsystem

# Activity CRUD
def get_activity(db: Session, activity_id: str):
    return db.query(models.Activity).filter(models.Activity.activity_id == activity_id).first()

def get_activities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Activity).offset(skip).limit(limit).all()

def get_activities_by_type_and_association(db: Session, activity_type: str, associated_with: str):
    return db.query(models.Activity).filter(
        and_(
            models.Activity.activity_type == activity_type,
            models.Activity.associated_with == associated_with
        )
    ).all()

def create_activity(db: Session, activity: schemas.ActivityCreate):
    db_activity = models.Activity(
        activity_id=str(uuid.uuid4()),
        activity_name=activity.activity_name,
        activity_type=activity.activity_type,
        associated_with=activity.associated_with,
        description=activity.description
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def update_activity(db: Session, activity_id: str, activity_update: schemas.ActivityUpdate):
    db_activity = get_activity(db, activity_id)
    if db_activity:
        update_data = activity_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_activity, field, value)
        db.commit()
        db.refresh(db_activity)
    return db_activity

def delete_activity(db: Session, activity_id: str):
    db_activity = get_activity(db, activity_id)
    if db_activity:
        db.delete(db_activity)
        db.commit()
    return db_activity

# Project Subsystem Mapping CRUD
def get_project_subsystem_mapping(db: Session, project_id: str):
    return db.query(models.ProjectSubsystemMapping).filter(
        models.ProjectSubsystemMapping.project_id == project_id
    ).first()

def get_project_subsystem_mappings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ProjectSubsystemMapping).offset(skip).limit(limit).all()

def create_project_subsystem_mapping(db: Session, mapping: schemas.ProjectSubsystemMappingCreate, assigned_by: str):
    # Delete existing mapping if exists
    existing = get_project_subsystem_mapping(db, mapping.project_id)
    if existing:
        db.delete(existing)
    
    db_mapping = models.ProjectSubsystemMapping(
        mapping_id=str(uuid.uuid4()),
        project_id=mapping.project_id,
        subsystem_id=mapping.subsystem_id,
        assigned_by=assigned_by
    )
    db.add(db_mapping)
    db.commit()
    db.refresh(db_mapping)
    return db_mapping

# Project Progress CRUD
def get_project_progress(db: Session, project_id: str, subsystem_id: str, activity_id: str, user_id: str):
    return db.query(models.ProjectProgress).filter(
        and_(
            models.ProjectProgress.project_id == project_id,
            models.ProjectProgress.subsystem_id == subsystem_id,
            models.ProjectProgress.activity_id == activity_id,
            models.ProjectProgress.user_id == user_id
        )
    ).first()

def get_project_progress_by_user(db: Session, user_id: str):
    return db.query(models.ProjectProgress).filter(models.ProjectProgress.user_id == user_id).all()

def get_all_project_progress(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.ProjectProgress).offset(skip).limit(limit).all()

def create_or_update_project_progress(db: Session, progress: schemas.ProjectProgressCreate, user_id: str):
    existing = get_project_progress(db, progress.project_id, progress.subsystem_id, progress.activity_id, user_id)
    
    if existing:
        # Update existing progress
        existing.status = progress.status
        existing.notes = progress.notes
        
        # Auto-set dates based on status
        if progress.status == models.ProgressStatus.IN_PROGRESS and not existing.start_date:
            existing.start_date = date.today()
        elif progress.status == models.ProgressStatus.COMPLETED and not existing.completion_date:
            existing.completion_date = date.today()
        
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new progress
        db_progress = models.ProjectProgress(
            progress_id=str(uuid.uuid4()),
            project_id=progress.project_id,
            subsystem_id=progress.subsystem_id,
            activity_id=progress.activity_id,
            user_id=user_id,
            status=progress.status,
            notes=progress.notes
        )
        
        # Auto-set dates based on status
        if progress.status == models.ProgressStatus.IN_PROGRESS:
            db_progress.start_date = date.today()
        elif progress.status == models.ProgressStatus.COMPLETED:
            db_progress.completion_date = date.today()
        
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress

# Authentication
def authenticate_user(db: Session, username: str, password: str, role: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    if user.role != role:
        return False
    return user