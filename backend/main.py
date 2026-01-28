import json
import os
import uuid
from typing import List
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import aiofiles 

from database import engine, Base, get_db
import models, schemas, auth

load_dotenv()

app = FastAPI()
Base.metadata.create_all(bind=engine)

# Parse CORS origins from environment variable
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
cors_origins = cors_origins_str.split(",") if cors_origins_str != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = "storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "nickname": user.nickname}

@app.post("/register", response_model=schemas.UserDisplay)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter((models.User.email == user.email) | (models.User.nickname == user.nickname)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or Nickname already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, nickname=user.nickname, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/projects", response_model=schemas.ProjectDisplay)
async def create_project(
    project: schemas.ProjectCreate, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    filename = f"{uuid.uuid4()}.json"
    filepath = os.path.join(STORAGE_DIR, filename)
    
    data_to_save = project.initial_data if project.initial_data else {"cards": []}
    
    async with aiofiles.open(filepath, mode='w', encoding='utf-8') as f:
        await f.write(json.dumps(data_to_save))
    
    db_project = models.Project(
        title=project.title,
        json_path=filepath,
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    db_project.allowed_users.append(current_user)
    db.commit()
    return db_project

@app.get("/projects", response_model=List[schemas.ProjectDisplay])
def get_my_projects(current_user: models.User = Depends(auth.get_current_user)):
    return current_user.projects_accessible

@app.get("/projects/{project_id}/content")
async def get_project_content(
    project_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.id != project.owner_id and current_user not in project.allowed_users:
         raise HTTPException(status_code=403, detail="Access denied")

    try:
        async with aiofiles.open(project.json_path, mode='r', encoding='utf-8') as f:
            content = await f.read()
            return json.loads(content)
    except FileNotFoundError:
        return {"cards": []}

@app.post("/projects/{project_id}/invite")
def invite_to_project(
    project_id: int, 
    invite_data: schemas.AddUserToProject,
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_to_add = db.query(models.User).filter(
        (models.User.email == invite_data.email_or_nickname) | 
        (models.User.nickname == invite_data.email_or_nickname)
    ).first()
    
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_add not in project.allowed_users:
        project.allowed_users.append(user_to_add)
        db.commit()
    
    return {"message": "User added"}

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: int):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: int):
        if project_id in self.active_connections:
            if websocket in self.active_connections[project_id]:
                self.active_connections[project_id].remove(websocket)

    async def broadcast(self, message: dict, project_id: int, sender: WebSocket):
        if project_id in self.active_connections:
            for connection in self.active_connections[project_id]:
                if connection != sender:
                    await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{project_id}/{user_nickname}")
async def websocket_endpoint(
    websocket: WebSocket, 
    project_id: int, 
    user_nickname: str,
    db: Session = Depends(get_db)
):
    await manager.connect(websocket, project_id)
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "cursor_move":
                await manager.broadcast({
                    "user": user_nickname,
                    "type": "cursor_move",
                    "data": data
                }, project_id, websocket)

            elif msg_type == "update_cards":
                cards = data.get("cards")
                if project and cards is not None:
                    async with aiofiles.open(project.json_path, mode='w', encoding='utf-8') as f:
                        await f.write(json.dumps({"cards": cards}))
                
                await manager.broadcast({
                    "user": user_nickname,
                    "type": "update_cards",
                    "data": cards
                }, project_id, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)
        await manager.broadcast({"user": user_nickname, "type": "disconnect"}, project_id, websocket)

@app.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token({"sub": user.email})

    response = JSONResponse({
        "user_id": user.id,
        "nickname": user.nickname,
        "email": user.email
    })

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 5
    )

    return response
