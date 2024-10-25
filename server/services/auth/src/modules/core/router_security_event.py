from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from src.models.users.models import User
from src.common.database import get_postgres
from src.modules.auth.service import AuthService

from . import crud_security_event, schemas
from .schemas import SecurityEventDto

router = APIRouter(
    prefix="/securityevents",
    tags=["Security Events"]
)

# Get All SecurityEvents
@router.get("/")
async def read_security_events(db: AsyncSession = Depends(get_postgres)):
    security_events = await crud_security_event.get_security_events(db)
    return security_events

# Create a SecurityEvent
@router.post("/")
async def create_security_event(
    security_event: schemas.SecurityEventCreate,
    db: AsyncSession = Depends(get_postgres),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    created_event = await crud_security_event.create_security_event(db, security_event)
    return created_event

# Get a SecurityEvent by ID
@router.get("/{security_event_id}")
async def read_security_event(
    security_event_id: UUID,
    db: AsyncSession = Depends(get_postgres)
):
    security_event = await crud_security_event.get_security_event_by_id(db, security_event_id)
    if not security_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SecurityEvent not found")
    return security_event

# Update a SecurityEvent
@router.put("/{security_event_id}")
async def update_security_event(
    security_event_id: UUID,
    security_event_update: schemas.SecurityEventUpdate,
    db: AsyncSession = Depends(get_postgres),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    updated_event = await crud_security_event.update_security_event(db, security_event_id, security_event_update)
    if not updated_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SecurityEvent not found")
    return updated_event

# Delete a SecurityEvent
@router.delete("/{security_event_id}")
async def delete_security_event(
    security_event_id: UUID,
    db: AsyncSession = Depends(get_postgres),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    deleted_event = await crud_security_event.delete_security_event(db, security_event_id)
    if not deleted_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SecurityEvent not found")
    return deleted_event