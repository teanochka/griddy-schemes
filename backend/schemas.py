from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Any, Dict

class UserBase(BaseModel):
    email: EmailStr
    nickname: str

class UserCreate(UserBase):
    password: str

class UserDisplay(UserBase):
    id: int
    nickname: str
    email: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class ProjectBase(BaseModel):
    title: str

class ProjectCreate(ProjectBase):
    initial_data: Optional[Dict[str, Any]] = None 

class ProjectDisplay(ProjectBase):
    id: int
    created_at: datetime
    owner: UserDisplay
    allowed_users: List[UserDisplay] = []

    class Config:
        from_attributes = True

class AddUserToProject(BaseModel):
    email_or_nickname: str