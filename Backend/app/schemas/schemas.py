from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ChatCreate(BaseModel):
    title: Optional[str] = "New Research Chat"

class ChatTitleUpdate(BaseModel):
    title: str

class MessageSchema(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionSchema(BaseModel):
    id: str
    user_clerk_id: str
    title: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: List[MessageSchema] = []

    class Config:
        from_attributes = True

class ResearchRequest(BaseModel):
    topic: str
    chat_id: Optional[str] = None

class ResearchStepEvent(BaseModel):
    step: str # "search" | "read" | "vectorize" | "write" | "critic" | "complete" | "error"
    status: str # "running" | "done" | "error"
    message: str
    data: Optional[Dict[str, Any]] = None
