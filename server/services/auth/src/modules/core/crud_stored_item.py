from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, delete
from typing import List, Optional
from uuid import UUID

from src.modules.core.crud_storage_room import get_storageroom_by_id
from src.modules.core.schemas import StoredItemCreate, StoredItemUpdate
from fastapi import HTTPException, status
from src.models.users.models import StoredItem

async def get_storeditems(db: AsyncSession) -> List[StoredItem]:
    stmt = select(StoredItem)
    result = await db.execute(stmt)
    storeditems = result.scalars().all()
    return storeditems

async def get_storeditem_by_id(db: AsyncSession, storeditem_id: UUID) -> Optional[StoredItem]:
    stmt = select(StoredItem).where(StoredItem.id == storeditem_id)
    result = await db.execute(stmt)
    storeditem = result.scalars().first()
    return storeditem

async def create_storeditem(db: AsyncSession, storeditem: StoredItemCreate) -> StoredItem:

    storageroom = await get_storageroom_by_id(db, str(storeditem.storageroom_id))
    if not storageroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced StorageRoom not found."
        )

    db_storeditem = StoredItem(**storeditem.dict())
    db.add(db_storeditem)
    await db.commit()
    await db.refresh(db_storeditem)
    return db_storeditem

async def update_storeditem(db: AsyncSession, storeditem_id: UUID, storeditem_update: StoredItemUpdate) -> Optional[StoredItem]:
    stmt = (
        update(StoredItem)
        .where(StoredItem.id == storeditem_id)
        .values(**storeditem_update.dict(exclude_unset=True))
        .execution_options(synchronize_session="fetch")
    )
    result = await db.execute(stmt)
    await db.commit()

    # Fetch the updated StoredItem
    updated_storeditem = await get_storeditem_by_id(db, storeditem_id)
    return updated_storeditem

async def delete_storeditem(db: AsyncSession, storeditem_id: UUID) -> Optional[StoredItem]:
    stmt = delete(StoredItem).where(StoredItem.id == storeditem_id).returning(StoredItem)
    result = await db.execute(stmt)
    await db.commit()

    deleted_storeditem = result.scalar_one_or_none()
    return deleted_storeditem
