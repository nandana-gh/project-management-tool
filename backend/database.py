import sqlite3
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, Enum, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

# SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./project_management.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Enums
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PM = "PM"
    DPD = "DPD"
    ENGINEER = "ENGINEER"

class ActivityType(str, enum.Enum):
    FPGA = "FPGA"
    PROCESSOR = "PROCESSOR"

class AssociatedWith(str, enum.Enum):
    PROJECT = "PROJECT"
    SUBSYSTEM = "SUBSYSTEM"

class ProgressStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

# Database Models
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"
    
    project_id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    program_type = Column(String, nullable=False)
    description = Column(String)
    created_by = Column(String, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    creator = relationship("User", back_populates="created_projects")

class Subsystem(Base):
    __tablename__ = "subsystems"
    
    subsystem_id = Column(String, primary_key=True, index=True)
    subsystem_name = Column(String, unique=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    
    activity_id = Column(String, primary_key=True, index=True)
    activity_name = Column(String, nullable=False)
    activity_type = Column(Enum(ActivityType), nullable=False)
    associated_with = Column(Enum(AssociatedWith), nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProjectSubsystemMapping(Base):
    __tablename__ = "project_subsystem_mappings"
    
    mapping_id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, unique=True)
    subsystem_id = Column(String, ForeignKey("subsystems.subsystem_id"), nullable=False)
    assigned_by = Column(String, ForeignKey("users.user_id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("Project")
    subsystem = relationship("Subsystem")
    assigner = relationship("User")

class ProjectProgress(Base):
    __tablename__ = "project_progress"
    
    progress_id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False)
    subsystem_id = Column(String, ForeignKey("subsystems.subsystem_id"), nullable=False)
    activity_id = Column(String, ForeignKey("activities.activity_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    status = Column(Enum(ProgressStatus), default=ProgressStatus.NOT_STARTED)
    start_date = Column(Date)
    completion_date = Column(Date)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("Project")
    subsystem = relationship("Subsystem")
    activity = relationship("Activity")
    user = relationship("User")

# Add relationships
User.created_projects = relationship("Project", back_populates="creator")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()