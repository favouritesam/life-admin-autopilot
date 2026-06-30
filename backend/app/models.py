from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = Field(default="medium")  # low, medium, high
    status: str = Field(default="pending")  # pending, in_progress, completed
    category: Optional[str] = None
    parsed_from: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Reminder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    task_id: int
    reminder_type: str = Field(default="email")  # email, push, sms
    scheduled_time: datetime
    sent_at: Optional[datetime] = None
    status: str = Field(default="pending")  # pending, sent, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ParsingHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    raw_input: str
    parsed_tasks: Optional[str] = None  # JSON string
    confidence_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Request/Response schemas
class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"
    category: Optional[str] = None


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None


class ReminderCreate(SQLModel):
    task_id: int
    reminder_type: str = "email"
    scheduled_time: datetime


class ParseTaskRequest(SQLModel):
    text: str


class ParseTaskResponse(SQLModel):
    tasks: list[TaskCreate]
    confidence: float
    raw_input: str
