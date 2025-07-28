from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# Enums
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    PM = "PM"
    DPD = "DPD"
    ENGINEER = "ENGINEER"

class ActivityType(str, Enum):
    FPGA = "FPGA"
    PROCESSOR = "PROCESSOR"

class AssociatedWith(str, Enum):
    PROJECT = "PROJECT"
    SUBSYSTEM = "SUBSYSTEM"

class ProgressStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

# Base schemas
class UserBase(BaseModel):
    username: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class User(UserBase):
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    project_name: str
    program_type: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    program_type: Optional[str] = None
    description: Optional[str] = None

class Project(ProjectBase):
    project_id: str
    created_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SubsystemBase(BaseModel):
    subsystem_name: str
    description: Optional[str] = None

class SubsystemCreate(SubsystemBase):
    pass

class SubsystemUpdate(BaseModel):
    subsystem_name: Optional[str] = None
    description: Optional[str] = None

class Subsystem(SubsystemBase):
    subsystem_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    activity_name: str
    activity_type: ActivityType
    associated_with: AssociatedWith
    description: Optional[str] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    activity_name: Optional[str] = None
    activity_type: Optional[ActivityType] = None
    associated_with: Optional[AssociatedWith] = None
    description: Optional[str] = None

class Activity(ActivityBase):
    activity_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectSubsystemMappingBase(BaseModel):
    project_id: str
    subsystem_id: str

class ProjectSubsystemMappingCreate(ProjectSubsystemMappingBase):
    pass

class ProjectSubsystemMapping(ProjectSubsystemMappingBase):
    mapping_id: str
    assigned_by: str
    assigned_at: datetime
    
    class Config:
        from_attributes = True

class ProjectProgressBase(BaseModel):
    project_id: str
    subsystem_id: str
    activity_id: str
    status: ProgressStatus
    notes: Optional[str] = None

class ProjectProgressCreate(ProjectProgressBase):
    pass

class ProjectProgressUpdate(BaseModel):
    status: Optional[ProgressStatus] = None
    notes: Optional[str] = None

class ProjectProgress(ProjectProgressBase):
    progress_id: str
    user_id: str
    start_date: Optional[date] = None
    completion_date: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Login schemas
class LoginRequest(BaseModel):
    username: str
    password: str
    role: UserRole

class LoginResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"

# Report schemas
class ReportFilter(BaseModel):
    project_ids: Optional[List[str]] = None
    subsystem_ids: Optional[List[str]] = None
    activity_ids: Optional[List[str]] = None

class ChartData(BaseModel):
    labels: List[str]
    data: List[float]
    chart_type: str
    title: str

class GanttData(BaseModel):
    activity_name: str
    project_name: str
    subsystem_name: str
    start_date: date
    completion_date: date
    duration_days: int
    status: str