from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from src.models.users.models import SecurityEvent

from .schemas import SecurityEventCreate, SecurityEventUpdate
from fastapi import HTTPException, status

# Get all SecurityEvents
async def get_security_events(db: AsyncSession) -> List[SecurityEvent]:
    stmt = select(SecurityEvent)
    result = await db.execute(stmt)
    security_events = result.scalars().all()
    return security_events

# Get SecurityEvent by ID
async def get_security_event_by_id(db: AsyncSession, security_event_id: UUID) -> Optional[SecurityEvent]:
    stmt = select(SecurityEvent).where(SecurityEvent.id == security_event_id)
    result = await db.execute(stmt)
    security_event = result.scalars().first()
    return security_event

# Create SecurityEvent
async def create_security_event(db: AsyncSession, security_event: SecurityEventCreate) -> SecurityEvent:
    db_security_event = SecurityEvent(**security_event.dict())
    db.add(db_security_event)
    await db.commit()
    await db.refresh(db_security_event)
    return db_security_event

# Update SecurityEvent
async def update_security_event(db: AsyncSession, security_event_id: UUID, security_event_update: SecurityEventUpdate) -> Optional[SecurityEvent]:
    stmt = (
        update(SecurityEvent)
        .where(SecurityEvent.id == security_event_id)
        .values(**security_event_update.dict(exclude_unset=True))
        .execution_options(synchronize_session="fetch")
    )
    await db.execute(stmt)
    await db.commit()
    return await get_security_event_by_id(db, security_event_id)

# Delete SecurityEvent
async def delete_security_event(db: AsyncSession, security_event_id: UUID) -> Optional[SecurityEvent]:
    stmt = select(SecurityEvent).where(SecurityEvent.id == security_event_id)
    result = await db.execute(stmt)
    security_event = result.scalars().first()

    if security_event is None:
        return None

    await db.delete(security_event)
    await db.commit()
    return security_event