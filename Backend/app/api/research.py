import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db, AsyncSessionLocal
from app.models.models import ChatSession, ChatMessage
from app.schemas.schemas import ResearchRequest
from app.graph.workflow import research_graph
from app.graph.intent_router import classify_prompt_intent, generate_direct_conversational_response
from app.core.security import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/research", tags=["Research"])

async def execute_graph_and_save(topic: str, chat_id: str, clerk_id: str):
    async with AsyncSessionLocal() as db:
        stmt = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_clerk_id == clerk_id)
        result = await db.execute(stmt)
        chat = result.scalars().first()
        if not chat:
            return

        if chat.title == "New Research Chat":
            chat.title = topic[:40] + ("..." if len(topic) > 40 else "")
            await db.commit()

        intent = classify_prompt_intent(topic)
        if intent == "GREETING":
            direct_resp = generate_direct_conversational_response(topic)
            payload = {
                "is_direct_chat": True,
                "response": direct_resp
            }
        else:
            initial_state = {
                "topic": topic,
                "session_id": chat_id,
                "search_results": "",
                "scraped_content": "",
                "vector_context": "",
                "report": "",
                "feedback": "",
                "score": 0,
                "revision_count": 0,
                "current_step": "START",
                "step_messages": []
            }
            final_state = await asyncio.to_thread(research_graph.invoke, initial_state)
            payload = {
                "is_direct_chat": False,
                "search_results": final_state.get("search_results", ""),
                "scraped_content": final_state.get("scraped_content", ""),
                "vector_context": final_state.get("vector_context", ""),
                "report": final_state.get("report", ""),
                "feedback": final_state.get("feedback", ""),
                "score": final_state.get("score", 9)
            }

        user_msg = ChatMessage(chat_id=chat_id, role="user", content=topic)
        ai_msg = ChatMessage(chat_id=chat_id, role="ai", content=json.dumps(payload))
        
        db.add(user_msg)
        db.add(ai_msg)
        await db.commit()

@router.post("/run")
async def run_research(
    req: ResearchRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.topic or not req.chat_id:
        raise HTTPException(status_code=400, detail="Topic and chatId are required")

    clerk_id = current_user.get("sub")
    background_tasks.add_task(execute_graph_and_save, req.topic, req.chat_id, clerk_id)
    return {"success": True, "message": "Research pipeline triggered"}
