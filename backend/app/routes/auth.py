import os
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from app.database import get_session
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"


class TokenRequest(BaseModel):
    user_id: str
    email: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """Verify JWT token and extract user info"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(token: str, session: Session = Depends(get_session)) -> User:
    """Dependency to get current user from token"""
    user_id = verify_token(token)
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=TokenResponse)
async def register(
    request: TokenRequest,
    session: Session = Depends(get_session)
):
    """Register new user (called after Better Auth sign-up in frontend)"""
    
    # Check if user already exists
    statement = select(User).where(User.email == request.email)
    existing = session.exec(statement).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user = User(id=request.user_id, email=request.email, name=request.name)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create token
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token)


@router.post("/token", response_model=TokenResponse)
async def get_token(request: TokenRequest):
    """Get JWT token (called after Better Auth sign-in)"""
    token = create_access_token({"sub": request.user_id})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    token: str = None,
    session: Session = Depends(get_session)
):
    """Get current user info"""
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    user = get_current_user(token, session)
    return UserResponse(id=user.id, email=user.email, name=user.name)
