from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_session
from app.models import Reminder, ReminderCreate, Task
from app.services.reminders import process_due_reminders
from app.routes.auth import verify_token

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


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
async def get_reminders(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get all reminders for current user"""
    
    query = select(Reminder).where(Reminder.user_id == user_id)
    
    if status:
        query = query.where(Reminder.status == status)
    
    reminders = session.exec(query.order_by(Reminder.scheduled_time)).all()
    return reminders


@router.post("/", response_model=Reminder)
async def create_reminder(
    reminder: ReminderCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Create a new reminder"""
    
    # Verify task belongs to user
    task = session.get(Task, reminder.task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_reminder = Reminder(
        user_id=user_id,
        task_id=reminder.task_id,
        reminder_type=reminder.reminder_type,
        scheduled_time=reminder.scheduled_time
    )
    session.add(db_reminder)
    session.commit()
    session.refresh(db_reminder)
    return db_reminder


@router.post("/auto-create/{task_id}")
async def auto_create_reminders(
    task_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Auto-create reminders for a task (1 day before due date)"""
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not task.due_date:
        raise HTTPException(status_code=400, detail="Task has no due date")
    
    # Create reminder 1 day before due date
    reminder_time = task.due_date - timedelta(days=1)
    
    # Check if reminder already exists
    existing = session.exec(
        select(Reminder).where(
            Reminder.task_id == task_id,
            Reminder.user_id == user_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Reminder already exists for this task")
    
    reminder = Reminder(
        user_id=user_id,
        task_id=task_id,
        reminder_type="email",
        scheduled_time=reminder_time
    )
    session.add(reminder)
    session.commit()
    session.refresh(reminder)
    
    return {"message": "Reminder created", "reminder": reminder}


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Delete a reminder"""
    
    reminder = session.get(Reminder, reminder_id)
    if not reminder or reminder.user_id != user_id:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    session.delete(reminder)
    session.commit()
    return {"message": "Reminder deleted"}


@router.post("/process-due")
async def process_due(session: Session = Depends(get_session)):
    """Process all due reminders (called by scheduler)"""
    process_due_reminders()
    return {"message": "Processed due reminders"}
