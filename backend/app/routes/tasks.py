from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime
from app.database import get_session
from app.models import Task, TaskCreate, TaskUpdate, User, ParseTaskRequest, ParseTaskResponse, ParsingHistory
from app.services.ai_parser import parse_natural_language_task
from app.routes.auth import verify_token
import json

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid scheme")
        return verify_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")


@router.get("/")
async def get_tasks(
    status: Optional[str] = None,
    category: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get all tasks for current user"""
    
    query = select(Task).where(Task.user_id == user_id)
    
    if status:
        query = query.where(Task.status == status)
    if category:
        query = query.where(Task.category == category)
    
    tasks = session.exec(query.order_by(Task.due_date)).all()
    return tasks


@router.post("/", response_model=Task)
async def create_task(
    task: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Create a new task"""
    
    db_task = Task(
        user_id=user_id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        category=task.category
    )
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get a specific task"""
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Update a task"""
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = task_update.dict(exclude_unset=True)
    for key, value in task_data.items():
        setattr(task, key, value)
    
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Delete a task"""
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    session.delete(task)
    session.commit()
    return {"message": "Task deleted"}


@router.post("/parse", response_model=ParseTaskResponse)
async def parse_task(
    request: ParseTaskRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Parse natural language into tasks using AI"""
    
    # Parse using OpenAI
    parsed_tasks, confidence = parse_natural_language_task(request.text)
    
    # Save to parsing history
    history = ParsingHistory(
        user_id=user_id,
        raw_input=request.text,
        parsed_tasks=json.dumps([t.dict() for t in parsed_tasks]),
        confidence_score=confidence
    )
    session.add(history)
    session.commit()
    
    return ParseTaskResponse(
        tasks=parsed_tasks,
        confidence=confidence,
        raw_input=request.text
    )


@router.post("/parse-and-save")
async def parse_and_save_tasks(
    request: ParseTaskRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Parse natural language and immediately save tasks"""
    
    # Parse using AI
    parsed_tasks, confidence = parse_natural_language_task(request.text)
    
    # Save all parsed tasks to database
    created_tasks = []
    for task_data in parsed_tasks:
        db_task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            due_date=task_data.due_date,
            priority=task_data.priority,
            category=task_data.category,
            parsed_from=request.text
        )
        session.add(db_task)
        created_tasks.append(db_task)
    
    session.commit()
    
    # Save to parsing history
    history = ParsingHistory(
        user_id=user_id,
        raw_input=request.text,
        parsed_tasks=json.dumps([t.dict(exclude={"id"}) for t in created_tasks]),
        confidence_score=confidence
    )
    session.add(history)
    session.commit()
    
    return {
        "message": f"Created {len(created_tasks)} tasks",
        "tasks": created_tasks,
        "confidence": confidence
    }
