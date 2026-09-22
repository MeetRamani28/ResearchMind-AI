import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.db.database import get_db
from app.models.models import ChatSession, ChatMessage
from app.schemas.schemas import ChatCreate, ChatTitleUpdate
from app.core.security import get_current_user
from typing import Dict, Any, List

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("")
@router.post("/")
async def create_chat(
    data: ChatCreate = ChatCreate(),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    chat = ChatSession(user_clerk_id=clerk_id, title=data.title or "New Research Chat")
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return {"_id": chat.id, "title": chat.title, "messages": []}

@router.get("/history")
async def get_chat_history(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    stmt = select(ChatSession).where(ChatSession.user_clerk_id == clerk_id).order_by(ChatSession.updated_at.desc())
    result = await db.execute(stmt)
    chats = result.scalars().all()
    
    out = []
    for c in chats:
        out.append({
            "_id": c.id,
            "title": c.title,
            "createdAt": c.created_at,
            "updatedAt": c.updated_at
        })
    return out

@router.get("/{chat_id}")
async def get_chat_details(
    chat_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    stmt = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_clerk_id == clerk_id)
    result = await db.execute(stmt)
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    msg_stmt = select(ChatMessage).where(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at.asc())
    msg_result = await db.execute(msg_stmt)
    messages = msg_result.scalars().all()

    formatted_messages = []
    for m in messages:
        formatted_messages.append({
            "role": m.role,
            "content": m.content
        })

    return {
        "_id": chat.id,
        "title": chat.title,
        "messages": formatted_messages
    }

@router.patch("/{chat_id}")
async def update_chat_title(
    chat_id: str,
    data: ChatTitleUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    stmt = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_clerk_id == clerk_id)
    result = await db.execute(stmt)
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat.title = data.title
    await db.commit()
    await db.refresh(chat)
    return {"_id": chat.id, "title": chat.title}

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    stmt = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_clerk_id == clerk_id)
    result = await db.execute(stmt)
    chat = result.scalars().first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await db.delete(chat)
    await db.commit()
    return {"success": True, "message": "Chat deleted"}
