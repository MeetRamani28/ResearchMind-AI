import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import get_ws_current_user
from app.graph.workflow import research_graph
from app.graph.intent_router import classify_prompt_intent, generate_direct_conversational_response
from app.db.database import AsyncSessionLocal
from app.models.models import ChatSession, ChatMessage
from sqlalchemy.future import select
from typing import Dict, List, Optional

router = APIRouter(tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, chat_id: str, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)
        print(f"[WEBSOCKET CONNECTED] Client connected to chat session {chat_id}")

    def disconnect(self, chat_id: str, websocket: WebSocket):
        if chat_id in self.active_connections:
            if websocket in self.active_connections[chat_id]:
                self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast(self, chat_id: str, event_type: str, data: Dict):
        if chat_id in self.active_connections:
            payload = json.dumps({"event": event_type, "data": data})
            for connection in self.active_connections[chat_id]:
                try:
                    await connection.send_text(payload)
                except Exception as e:
                    print(f"[WS BROADCAST ERROR] {e}")

manager = ConnectionManager()

@router.websocket("/ws/research/{chat_id}")
async def websocket_research_endpoint(
    websocket: WebSocket,
    chat_id: str,
    token: Optional[str] = Query(None)
):
    await manager.connect(chat_id, websocket)
    user = await get_ws_current_user(websocket, token)

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                if msg.get("action") == "start_research":
                    topic = msg.get("topic")
                    if topic:
                        # Classify intent: GREETING vs RESEARCH
                        intent = classify_prompt_intent(topic)
                        print(f"[INTENT CLASSIFIED] Topic: '{topic}' -> Intent: {intent}")

                        if intent == "GREETING":
                            await manager.broadcast(chat_id, "research-status", {"message": "Answering query..."})
                            direct_resp = await asyncio.to_thread(generate_direct_conversational_response, topic)
                            
                            result_payload = {
                                "is_direct_chat": True,
                                "response": direct_resp
                            }

                            if user and user.get("sub"):
                                clerk_id = user.get("sub")
                                async with AsyncSessionLocal() as db:
                                    stmt = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_clerk_id == clerk_id)
                                    res = await db.execute(stmt)
                                    chat = res.scalars().first()
                                    if chat:
                                        if chat.title == "New Research Chat":
                                            chat.title = topic[:40] + ("..." if len(topic) > 40 else "")
                                        user_msg = ChatMessage(chat_id=chat_id, role="user", content=topic)
                                        ai_msg = ChatMessage(chat_id=chat_id, role="ai", content=json.dumps(result_payload))
                                        db.add(user_msg)
                                        db.add(ai_msg)
                                        await db.commit()

                            await manager.broadcast(chat_id, "research-complete", {"data": result_payload})

                        else:
                            # Run full 4-agent LangGraph pipeline
                            await manager.broadcast(chat_id, "research-status", {"message": "[STATUS] [STEP-1] Search Agent is working..."})
                            await asyncio.sleep(0.3)

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

                            await manager.broadcast(chat_id, "research-status", {"message": "[STATUS] [STEP-2] Reader Agent is scraping top resources..."})
                            
                            final_state = await asyncio.to_thread(research_graph.invoke, initial_state)
                            
                            await manager.broadcast(chat_id, "research-status", {"message": "[STATUS] [STEP-3] Writer Chain is drafting the report..."})
                            await asyncio.sleep(0.2)
                            await manager.broadcast(chat_id, "research-status", {"message": "[STATUS] [STEP-4] Critic Chain is reviewing the report..."})
                            await asyncio.sleep(0.2)

                            result_payload = {
                                "is_direct_chat": False,
                                "search_results": final_state.get("search_results", ""),
                                "scraped_content": final_state.get("scraped_content", ""),
                                "vector_context": final_state.get("vector_context", ""),
                                "report": final_state.get("report", ""),
                                "feedback": final_state.get("feedback", ""),
                                "score": final_state.get("score", 9)
                            }

                            if user and user.get("sub"):
                                clerk_id = user.get("sub")
                                async with AsyncSessionLocal() as db:
                                    stmt = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_clerk_id == clerk_id)
                                    res = await db.execute(stmt)
                                    chat = res.scalars().first()
                                    if chat:
                                        if chat.title == "New Research Chat":
                                            chat.title = topic[:40] + ("..." if len(topic) > 40 else "")
                                        user_msg = ChatMessage(chat_id=chat_id, role="user", content=topic)
                                        ai_msg = ChatMessage(chat_id=chat_id, role="ai", content=json.dumps(result_payload))
                                        db.add(user_msg)
                                        db.add(ai_msg)
                                        await db.commit()

                            await manager.broadcast(chat_id, "research-complete", {"data": result_payload})
            except Exception as inner_e:
                print(f"[WS PROCESS ERROR] {inner_e}")
                await manager.broadcast(chat_id, "research-error", {"message": str(inner_e)})

    except WebSocketDisconnect:
        manager.disconnect(chat_id, websocket)
        print(f"[WEBSOCKET DISCONNECTED] Client left chat session {chat_id}")
