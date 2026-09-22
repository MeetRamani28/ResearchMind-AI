from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.models import User
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/me")
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    if not clerk_id:
        return {"success": False, "user": None}

    stmt = select(User).where(User.clerk_id == clerk_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        user = User(
            clerk_id=clerk_id,
            email=current_user.get("email") or current_user.get("email_address"),
            full_name=current_user.get("name") or current_user.get("full_name") or "ResearchMind User",
            avatar_url=current_user.get("picture") or current_user.get("image_url")
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return {
        "success": True,
        "user": {
            "_id": user.id,
            "clerkId": user.clerk_id,
            "email": user.email,
            "fullName": user.full_name,
            "avatar": user.avatar_url
        }
    }

@router.patch("/profile")
async def update_profile(
    data: ProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clerk_id = current_user.get("sub")
    stmt = select(User).where(User.clerk_id == clerk_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "user": {
            "_id": user.id,
            "clerkId": user.clerk_id,
            "email": user.email,
            "fullName": user.full_name,
            "avatar": user.avatar_url
        }
    }
