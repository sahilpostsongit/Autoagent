import json
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy import select
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.models.task import Task, TaskStatus
from app.agent.orchestrator import run_agent

router = APIRouter(tags=["websocket"])
settings = get_settings()
ALGORITHM = "HS256"


async def _authenticate_ws(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except (JWTError, ValueError):
        return None


@router.websocket("/ws/agent/{task_id}")
async def agent_websocket(websocket: WebSocket, task_id: int, token: str = Query(...)):
    await websocket.accept()

    user_id = await _authenticate_ws(token)
    if not user_id:
        await websocket.send_json({"type": "error", "content": "Authentication failed."})
        await websocket.close(code=4001)
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Task).where(Task.id == task_id, Task.user_id == user_id)
        )
        task = result.scalar_one_or_none()

    if not task:
        await websocket.send_json({"type": "error", "content": "Task not found."})
        await websocket.close(code=4004)
        return

    await websocket.send_json({
        "type": "connected",
        "content": f"Running task: \"{task.goal}\"",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Task).where(Task.id == task_id))
        t = result.scalar_one_or_none()
        if t:
            t.status = TaskStatus.RUNNING
            t.started_at = datetime.now(timezone.utc)
            await db.commit()

    async def stream_callback(step: dict):
        try:
            await websocket.send_json(step)
        except Exception:
            pass

    try:
        agent_result = await run_agent(task.goal, stream_callback=stream_callback)

        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Task).where(Task.id == task_id))
            t = result.scalar_one_or_none()
            if t:
                if agent_result["success"]:
                    t.status = TaskStatus.COMPLETED
                    t.result = {"answer": agent_result["answer"]}
                else:
                    t.status = TaskStatus.FAILED
                    t.error_message = agent_result["error"]
                t.steps = agent_result["steps"]
                t.completed_at = datetime.now(timezone.utc)
                await db.commit()

        await websocket.send_json({
            "type": "done",
            "content": "Task completed.",
            "answer": agent_result.get("answer", ""),
            "success": agent_result["success"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "content": f"Agent error: {str(e)}"})
    finally:
        try:
            await websocket.close()
        except Exception:
            pass