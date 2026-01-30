import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

project_access = Table(
    'project_access', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('project_id', String, ForeignKey('projects.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nickname = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    projects_owned = relationship("Project", back_populates="owner")
    projects_accessible = relationship("Project", secondary=project_access, back_populates="allowed_users")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    json_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects_owned")
    allowed_users = relationship("User", secondary=project_access, back_populates="projects_accessible")