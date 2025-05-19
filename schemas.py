from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str
    role: str
    id: int

class JobCreate(BaseModel):
    pass  # No fields; handled by upload

class JobStatusResp(BaseModel):
    status: Literal["QUEUED", "RUNNING", "DONE", "ERROR"]
    violations_url: Optional[str] = None
    fix_url: Optional[str] = None
    error_msg: Optional[str] = None

class JobOut(BaseModel):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        orm_mode = True