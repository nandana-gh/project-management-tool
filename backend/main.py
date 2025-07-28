from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, date
import jwt
from jwt import PyJWTError

from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT settings
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception
    
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user

# Initialize database with default data
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        # Create default users if they don't exist
        default_users = [
            {"username": "admin", "password": "admin123", "role": "ADMIN"},
            {"username": "pm1", "password": "pm123", "role": "PM"},
            {"username": "dpd1", "password": "dpd123", "role": "DPD"},
            {"username": "eng1", "password": "eng123", "role": "ENGINEER"},
        ]
        
        for user_data in default_users:
            existing_user = crud.get_user_by_username(db, user_data["username"])
            if not existing_user:
                user_create = schemas.UserCreate(**user_data)
                crud.create_user(db, user_create)
        
        # Create default subsystems
        default_subsystems = [
            {"subsystem_name": "POWER", "description": "Power Management and Distribution Subsystem"},
            {"subsystem_name": "TM", "description": "Telemetry Subsystem for Data Transmission"},
            {"subsystem_name": "TC", "description": "Telecommand Subsystem for Command Reception"},
            {"subsystem_name": "AOCE", "description": "Attitude and Orbit Control Electronics"},
            {"subsystem_name": "OBC", "description": "On-Board Computer Subsystem"},
        ]
        
        for subsystem_data in default_subsystems:
            existing = db.query(models.Subsystem).filter(
                models.Subsystem.subsystem_name == subsystem_data["subsystem_name"]
            ).first()
            if not existing:
                subsystem_create = schemas.SubsystemCreate(**subsystem_data)
                crud.create_subsystem(db, subsystem_create)
        
        # Create default activities
        default_activities = [
            # FPGA Project Activities
            {"activity_name": "PDR", "activity_type": "FPGA", "associated_with": "PROJECT", "description": "Preliminary Design Review for FPGA"},
            {"activity_name": "CDR", "activity_type": "FPGA", "associated_with": "PROJECT", "description": "Critical Design Review for FPGA"},
            
            # FPGA Subsystem Activities
            {"activity_name": "FRR", "activity_type": "FPGA", "associated_with": "SUBSYSTEM", "description": "Flight Readiness Review"},
            {"activity_name": "SRR", "activity_type": "FPGA", "associated_with": "SUBSYSTEM", "description": "System Requirements Review"},
            {"activity_name": "SDR", "activity_type": "FPGA", "associated_with": "SUBSYSTEM", "description": "System Design Review"},
            {"activity_name": "CI", "activity_type": "FPGA", "associated_with": "SUBSYSTEM", "description": "Configuration Item"},
            {"activity_name": "DB", "activity_type": "FPGA", "associated_with": "SUBSYSTEM", "description": "Database"},
            {"activity_name": "SILS", "activity_type": "FPGA", "associated_with": "SUBSYSTEM", "description": "Software-in-the-Loop Simulation"},
            {"activity_name": "Designer Level Test Case Audit", "activity_type": "FPGA", "associated_with": "SUBSYSTEM"},
            {"activity_name": "Configuration Review Board", "activity_type": "FPGA", "associated_with": "SUBSYSTEM"},
            {"activity_name": "Clearance for PROM fusing", "activity_type": "FPGA", "associated_with": "SUBSYSTEM"},
            
            # Processor Project Activities
            {"activity_name": "PDR", "activity_type": "PROCESSOR", "associated_with": "PROJECT", "description": "Preliminary Design Review for Processor"},
            {"activity_name": "CDR", "activity_type": "PROCESSOR", "associated_with": "PROJECT", "description": "Critical Design Review for Processor"},
            {"activity_name": "Standing Review Committee", "activity_type": "PROCESSOR", "associated_with": "PROJECT"},
            {"activity_name": "IPAB Review", "activity_type": "PROCESSOR", "associated_with": "PROJECT"},
            {"activity_name": "PSR", "activity_type": "PROCESSOR", "associated_with": "PROJECT", "description": "Preliminary System Review"},
            
            # Processor Subsystem Activities
            {"activity_name": "FRS", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM", "description": "Functional Requirements Specification"},
            {"activity_name": "FDR", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM", "description": "Final Design Review"},
            {"activity_name": "CI", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM", "description": "Configuration Item"},
            {"activity_name": "DB", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM", "description": "Database"},
            {"activity_name": "Simulation Result Audit", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM"},
            {"activity_name": "Synthesis Log Check", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM"},
            {"activity_name": "Static Timing Analysis", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM"},
            {"activity_name": "Place and Roots Log Check", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM"},
            {"activity_name": "Post Layout Simulation Audit", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM"},
            {"activity_name": "CMRB", "activity_type": "PROCESSOR", "associated_with": "SUBSYSTEM", "description": "Configuration Management Review Board"},
        ]
        
        for activity_data in default_activities:
            existing = db.query(models.Activity).filter(
                models.Activity.activity_name == activity_data["activity_name"],
                models.Activity.activity_type == activity_data["activity_type"],
                models.Activity.associated_with == activity_data["associated_with"]
            ).first()
            if not existing:
                activity_create = schemas.ActivityCreate(**activity_data)
                crud.create_activity(db, activity_create)
        
        db.commit()
    finally:
        db.close()

# Authentication endpoints
@app.post("/api/auth/login", response_model=schemas.LoginResponse)
def login(login_request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, login_request.username, login_request.password, login_request.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username, password, or role",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_id}, expires_delta=access_token_expires
    )
    return {
        "user": user,
        "access_token": access_token,
        "token_type": "bearer"
    }

# User endpoints
@app.get("/api/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(user_id: str, user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_user = crud.update_user(db, user_id, user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_user = crud.delete_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Project endpoints
@app.get("/api/projects", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    projects = crud.get_projects(db, skip=skip, limit=limit)
    return projects

@app.post("/api/projects", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["PM", "DPD"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_project(db=db, project=project, created_by=current_user.user_id)

@app.put("/api/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: str, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["PM", "DPD"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_project = crud.update_project(db, project_id, project_update)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_project = crud.delete_project(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# Subsystem endpoints
@app.get("/api/subsystems", response_model=List[schemas.Subsystem])
def read_subsystems(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    subsystems = crud.get_subsystems(db, skip=skip, limit=limit)
    return subsystems

@app.post("/api/subsystems", response_model=schemas.Subsystem)
def create_subsystem(subsystem: schemas.SubsystemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["PM", "DPD"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_subsystem(db=db, subsystem=subsystem)

@app.put("/api/subsystems/{subsystem_id}", response_model=schemas.Subsystem)
def update_subsystem(subsystem_id: str, subsystem_update: schemas.SubsystemUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["PM", "DPD"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_subsystem = crud.update_subsystem(db, subsystem_id, subsystem_update)
    if db_subsystem is None:
        raise HTTPException(status_code=404, detail="Subsystem not found")
    return db_subsystem

@app.delete("/api/subsystems/{subsystem_id}")
def delete_subsystem(subsystem_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_subsystem = crud.delete_subsystem(db, subsystem_id)
    if db_subsystem is None:
        raise HTTPException(status_code=404, detail="Subsystem not found")
    return {"message": "Subsystem deleted successfully"}

# Activity endpoints
@app.get("/api/activities", response_model=List[schemas.Activity])
def read_activities(activity_type: Optional[str] = None, associated_with: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if activity_type and associated_with:
        activities = crud.get_activities_by_type_and_association(db, activity_type, associated_with)
    else:
        activities = crud.get_activities(db)
    return activities

@app.post("/api/activities", response_model=schemas.Activity)
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["PM", "ENGINEER"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_activity(db=db, activity=activity)

@app.put("/api/activities/{activity_id}", response_model=schemas.Activity)
def update_activity(activity_id: str, activity_update: schemas.ActivityUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["ADMIN", "PM", "ENGINEER"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_activity = crud.update_activity(db, activity_id, activity_update)
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    return db_activity

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_activity = crud.delete_activity(db, activity_id)
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted successfully"}

# Project Subsystem Mapping endpoints
@app.get("/api/project-subsystem-mappings", response_model=List[schemas.ProjectSubsystemMapping])
def read_project_subsystem_mappings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    mappings = crud.get_project_subsystem_mappings(db)
    return mappings

@app.post("/api/project-subsystem-mappings", response_model=schemas.ProjectSubsystemMapping)
def create_project_subsystem_mapping(mapping: schemas.ProjectSubsystemMappingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["PM", "DPD"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_project_subsystem_mapping(db=db, mapping=mapping, assigned_by=current_user.user_id)

# Project Progress endpoints
@app.get("/api/project-progress", response_model=List[schemas.ProjectProgress])
def read_project_progress(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == "ENGINEER":
        progress = crud.get_project_progress_by_user(db, current_user.user_id)
    else:
        progress = crud.get_all_project_progress(db)
    return progress

@app.post("/api/project-progress", response_model=schemas.ProjectProgress)
def create_or_update_project_progress(progress: schemas.ProjectProgressCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_or_update_project_progress(db=db, progress=progress, user_id=current_user.user_id)

# Report endpoints
@app.post("/api/reports/project-activity", response_model=schemas.ChartData)
def get_project_activity_report(filters: schemas.ReportFilter, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Implementation for project vs activity report
    projects = crud.get_projects(db)
    activities = crud.get_activities(db)
    progress = crud.get_all_project_progress(db)
    
    # Filter data based on filters
    if filters.project_ids:
        projects = [p for p in projects if p.project_id in filters.project_ids]
    if filters.activity_ids:
        activities = [a for a in activities if a.activity_id in filters.activity_ids]
    
    # Generate chart data
    if len(filters.project_ids or []) == 1 and len(filters.activity_ids or []) > 1:
        # Pie chart: One project, multiple activities
        labels = [a.activity_name for a in activities if a.activity_id in (filters.activity_ids or [])]
        data = []
        for activity_id in (filters.activity_ids or []):
            completed_count = len([p for p in progress if p.project_id == filters.project_ids[0] and p.activity_id == activity_id and p.status == "COMPLETED"])
            data.append(completed_count)
        
        return schemas.ChartData(
            labels=labels,
            data=data,
            chart_type="pie",
            title="Activity Progress for Selected Project"
        )
    else:
        # Bar chart: Multiple projects
        labels = [p.project_name for p in projects]
        data = []
        for project in projects:
            total_activities = len(filters.activity_ids or [a.activity_id for a in activities])
            completed_activities = len([p for p in progress if p.project_id == project.project_id and p.status == "COMPLETED" and (not filters.activity_ids or p.activity_id in filters.activity_ids)])
            percentage = (completed_activities / total_activities * 100) if total_activities > 0 else 0
            data.append(percentage)
        
        return schemas.ChartData(
            labels=labels,
            data=data,
            chart_type="bar",
            title="Project Progress Overview"
        )

@app.post("/api/reports/subsystem-activity", response_model=schemas.ChartData)
def get_subsystem_activity_report(filters: schemas.ReportFilter, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Similar implementation for subsystem vs activity report
    subsystems = crud.get_subsystems(db)
    activities = crud.get_activities(db)
    progress = crud.get_all_project_progress(db)
    
    # Filter data
    if filters.subsystem_ids:
        subsystems = [s for s in subsystems if s.subsystem_id in filters.subsystem_ids]
    if filters.activity_ids:
        activities = [a for a in activities if a.activity_id in filters.activity_ids]
    
    labels = [s.subsystem_name for s in subsystems]
    data = []
    for subsystem in subsystems:
        total_activities = len(filters.activity_ids or [a.activity_id for a in activities])
        completed_activities = len([p for p in progress if p.subsystem_id == subsystem.subsystem_id and p.status == "COMPLETED" and (not filters.activity_ids or p.activity_id in filters.activity_ids)])
        percentage = (completed_activities / total_activities * 100) if total_activities > 0 else 0
        data.append(percentage)
    
    return schemas.ChartData(
        labels=labels,
        data=data,
        chart_type="bar",
        title="Subsystem Progress Overview"
    )

@app.post("/api/reports/gantt", response_model=List[schemas.GanttData])
def get_gantt_report(filters: schemas.ReportFilter, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    progress = crud.get_all_project_progress(db)
    projects = crud.get_projects(db)
    subsystems = crud.get_subsystems(db)
    activities = crud.get_activities(db)
    
    # Filter completed activities with dates
    completed_progress = [p for p in progress if p.status == "COMPLETED" and p.completion_date and p.start_date]
    
    if filters.project_ids:
        completed_progress = [p for p in completed_progress if p.project_id in filters.project_ids]
    
    gantt_data = []
    for p in completed_progress:
        project = next((proj for proj in projects if proj.project_id == p.project_id), None)
        subsystem = next((sub for sub in subsystems if sub.subsystem_id == p.subsystem_id), None)
        activity = next((act for act in activities if act.activity_id == p.activity_id), None)
        
        if project and subsystem and activity:
            duration = (p.completion_date - p.start_date).days + 1
            gantt_data.append(schemas.GanttData(
                activity_name=activity.activity_name,
                project_name=project.project_name,
                subsystem_name=subsystem.subsystem_name,
                start_date=p.start_date,
                completion_date=p.completion_date,
                duration_days=duration,
                status=p.status
            ))
    
    # Sort by completion date
    gantt_data.sort(key=lambda x: x.completion_date)
    return gantt_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)