import json
import os
import uuid
from typing import List, Dict

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import aiofiles 

from database import engine, Base, get_db
import models, schemas, auth
import asyncio

project_locks: Dict[str, asyncio.Lock] = {}

def get_project_lock(project_id: str) -> asyncio.Lock:
    if project_id not in project_locks:
        project_locks[project_id] = asyncio.Lock()
    return project_locks[project_id]

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
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

@app.get("/users/me", response_model=schemas.UserDisplay)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/google-login")
async def google_login(login_data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    try:
        import requests
        
        # Verify the token via Google UserInfo endpoint (since frontend sends access_token)
        response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {login_data.token}"}
        )
        
        if response.status_code != 200:
             raise HTTPException(status_code=400, detail="Invalid Google token")
             
        user_info = response.json()
        email = user_info.get("email")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain email")

        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Create new user
            nickname = email.split("@")[0]
            # Ensure unique nickname by appending uuid if needed
            if db.query(models.User).filter(models.User.nickname == nickname).first():
                nickname = f"{nickname}_{uuid.uuid4().hex[:4]}"
                
            # Create a random password since they use Google
            random_password = uuid.uuid4().hex
            hashed_password = auth.get_password_hash(random_password)
            
            user = models.User(email=email, nickname=nickname, hashed_password=hashed_password)
            db.add(user)
            db.commit()
            db.refresh(user)

        access_token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "nickname": user.nickname}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Google Login Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during Google Login")

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
    json_filename = f"{uuid.uuid4()}.json"
    filepath = os.path.join(STORAGE_DIR, json_filename)
    
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
    project_id: str, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    is_owner = current_user.id == project.owner_id
    is_allowed = any(u.id == current_user.id for u in project.allowed_users)
    
    if not is_owner and not is_allowed:
         raise HTTPException(status_code=403, detail="Access denied")

    clean_filename = os.path.basename(project.json_path)
    filepath = os.path.join(STORAGE_DIR, clean_filename)
    
    if not os.path.exists(filepath):
        return {"cards": []}

    try:
        lock = get_project_lock(project_id)
        async with lock:
            async with aiofiles.open(filepath, mode='r', encoding='utf-8') as f:
                content = await f.read()
                
                if not content:
                    return {"cards": []}
                return json.loads(content)
    except Exception as e:
        return {"cards": []}

@app.post("/projects/{project_id}/invite")
def invite_to_project(
    project_id: str, 
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
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: str):
        if project_id in self.active_connections:
            if websocket in self.active_connections[project_id]:
                self.active_connections[project_id].remove(websocket)

    async def broadcast(self, message: dict, project_id: str, sender: WebSocket):
        if project_id in self.active_connections:
            for connection in self.active_connections[project_id]:
                if connection != sender:
                    await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{project_id}/{user_nickname}")
async def websocket_endpoint(
    websocket: WebSocket, 
    project_id: str, 
    user_nickname: str,
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    
    if not project:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, project_id)
    
    try:
        filename = os.path.basename(project.json_path)
        filepath = os.path.join(STORAGE_DIR, filename)
        
        lock = get_project_lock(project_id)
        async with lock:
            if os.path.exists(filepath):
                async with aiofiles.open(filepath, mode='r', encoding='utf-8') as f:
                    content = await f.read()
                    data = json.loads(content)
                    cards = data.get("cards", [])
                    
                    await websocket.send_json({
                        "type": "update_cards",
                        "data": cards
                    })
            else:
                 await websocket.send_json({
                        "type": "update_cards",
                        "data": []
                    })
    except Exception as e:
        print(f"WS Load Error: {e}")
        pass

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
                
                if cards is not None:
                    filename = os.path.basename(project.json_path)
                    filepath = os.path.join(STORAGE_DIR, filename)
                    
                    try:
                        lock = get_project_lock(project_id)
                        async with lock:
                            async with aiofiles.open(filepath, mode='w', encoding='utf-8') as f:
                                await f.write(json.dumps({"cards": cards}))
                    except Exception as e:
                         print(f"WS Save Error: {e}")
                         pass
                
                await manager.broadcast({
                    "user": user_nickname,
                    "type": "update_cards",
                    "data": cards
                }, project_id, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)
        await manager.broadcast({"user": user_nickname, "type": "disconnect"}, project_id, websocket)