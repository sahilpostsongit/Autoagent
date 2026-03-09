from datetime import datetime, timezone
from typing import Optional, List
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import aiofiles

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.task import Task, TaskStatus, InputType
from app.agent.orchestrator import run_agent
from app.services.whisper_service import transcribe_audio

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

UPLOAD_DIR = Path.home() / "autoagent_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


class CreateTaskRequest(BaseModel):
    goal: str


class TaskResponse(BaseModel):
    id: int
    goal: str
    status: str
    input_type: str
    result: Optional[dict]
    steps: Optional[list]
    error_message: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


async def _run_task_background(task_id: int, goal: str, _unused):
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            return
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.now(timezone.utc)
        await db.commit()

    agent_result = await run_agent(goal)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if task:
            if agent_result["success"]:
                task.status = TaskStatus.COMPLETED
                task.result = {
                    "answer": agent_result["answer"],
                    "tools_used": list({s.get("tool") for s in agent_result["steps"] if s.get("tool")}),
                }
            else:
                task.status = TaskStatus.FAILED
                task.error_message = agent_result["error"]
            task.steps = agent_result["steps"]
            task.completed_at = datetime.now(timezone.utc)
            await db.commit()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: CreateTaskRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(user_id=current_user.id, goal=payload.goal, input_type=InputType.TEXT)
    db.add(task)
    await db.flush()
    await db.refresh(task)
    background_tasks.add_task(_run_task_background, task.id, payload.goal, None)
    return task


@router.post("/voice", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_voice_task(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audio_bytes = await audio.read()
    transcription = await transcribe_audio(audio_bytes, filename=audio.filename or "audio.wav")

    if not transcription["success"]:
        raise HTTPException(status_code=422, detail=f"Transcription failed: {transcription['error']}")

    goal = transcription["text"]
    if not goal.strip():
        raise HTTPException(status_code=422, detail="Transcription returned empty text.")

    task = Task(user_id=current_user.id, goal=goal, input_type=InputType.VOICE)
    db.add(task)
    await db.flush()
    await db.refresh(task)
    background_tasks.add_task(_run_task_background, task.id, goal, None)
    return task


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    skip: int = 0, limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.user_id == current_user.id)
        .order_by(desc(Task.created_at)).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    await db.delete(task)


@router.post("/upload-data")
async def upload_data_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed_exts = {".csv", ".json", ".xlsx", ".xls"}
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Only {', '.join(allowed_exts)} files supported.")

    dest = UPLOAD_DIR / (file.filename or "data.csv")
    content = await file.read()
    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)

    return {"message": f"File '{file.filename}' uploaded.", "filename": file.filename, "size_bytes": len(content)}