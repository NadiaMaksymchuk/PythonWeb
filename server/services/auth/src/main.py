from contextlib import asynccontextmanager

from sqlalchemy import select

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.common import constants, logger, seeders, database

from src.modules.customers.router import router as customer_router
from src.modules.auth.router import router as auth_router
from src.modules.core.router_storage_room import router as storageroom_router
from src.modules.core.router_stored_item import router as storageitem_router
from src.modules.core.router_security_event import router as events_router


from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID


@asynccontextmanager
async def lifespan(app):
    logger.init_logger()
    await database.create_tables_postgres()
    await seeders.run_seeders()

    yield

app = FastAPI(title="Auth Service", version="1", lifespan=lifespan, root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, tags=["Auth"])
app.include_router(customer_router, tags=["Customer"])
app.include_router(storageroom_router, tags=["Storageroom"])
app.include_router(storageitem_router, tags=["Storageitem"])
app.include_router(events_router, tags=["Storageitem"])
