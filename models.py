from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    jobs = relationship("Job", back_populates="owner")

class JobStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    DONE = "DONE"
    ERROR = "ERROR"

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(JobStatus), default=JobStatus.QUEUED)
    zip_s3_key = Column(String, nullable=False)
    violations_s3_key = Column(String)
    fix_s3_key = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    error_msg = Column(String, nullable=True)
    cpu_minutes = Column(Integer, default=0)
    s3_gb = Column(Integer, default=0)
    owner = relationship("User", back_populates="jobs")