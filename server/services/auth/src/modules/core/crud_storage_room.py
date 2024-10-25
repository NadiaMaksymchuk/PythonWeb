from http.client import HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session

from src.models.users.models import StorageRoom
from sqlalchemy.ext.asyncio import AsyncSession
from . import schemas
from typing import List
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from sqlalchemy.orm import selectinload

async def get_storageroom_by_id(db: AsyncSession, storageroom_id: str) -> Optional[StorageRoom]:
    stmt = select(StorageRoom).where(StorageRoom.id == UUID(storageroom_id))
    result = await db.execute(stmt)
    storageroom = result.scalars().first()
    return storageroom

async def get_storagerooms(db: AsyncSession) -> List[StorageRoom]:
    stmt = select(StorageRoom)
    result = await db.execute(stmt)
    storagerooms = result.scalars().all()
    return storagerooms

async def create_storageroom(db: AsyncSession, storageroom: schemas.StorageRoomCreate) -> StorageRoom:
    db_storageroom = StorageRoom(**storageroom.dict())
    db.add(db_storageroom)
    await db.commit()
    await db.refresh(db_storageroom)
    return db_storageroom

async def update_storageroom(db: AsyncSession, storageroom_id: int, storageroom_update: schemas.StorageRoomUpdate) -> Optional[StorageRoom]:
    stmt = (
        update(StorageRoom)
        .where(StorageRoom.id == UUID(storageroom_id))
        .values(**storageroom_update.dict(exclude_unset=True))
        .execution_options(synchronize_session="fetch")
    )
    await db.execute(stmt)
    await db.commit()
    return await get_storageroom_by_id(db, storageroom_id)

async def delete_storageroom(db: AsyncSession, storageroom_id: str) -> Optional[StorageRoom]:
    try:
        # Convert storageroom_id to UUID if your ID is a UUID. If it's an integer, adjust accordingly.
        storageroom_uuid = UUID(storageroom_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid StorageRoom ID format.")

    stmt = select(StorageRoom).where(StorageRoom.id == storageroom_uuid)
    result = await db.execute(stmt)
    storageroom = result.scalars().first()

    if storageroom is None:
        return None

    await db.delete(storageroom)
    await db.commit()
    return storageroom
