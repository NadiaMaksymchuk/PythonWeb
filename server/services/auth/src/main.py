from contextlib import asynccontextmanager

from sqlalchemy import select

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.common import constants, logger, seeders, database

from src.modules.customers.router import router as customer_router
from src.modules.auth.router import router as auth_router
from src.modules.core.router_storage_room import router as storageroom_router
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from . import models, schemas, crud, auth
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from src. import create_access_token, authenticate_user, decode_access_token


@asynccontextmanager
async def lifespan(app):
    logger.init_logger()
    await database.create_tables_postgres()
    await seeders.run_seeders()

    yield

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency для отримання поточного користувача
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(database.get_postgres)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не вдалося автентифікувати",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_exception
    # Переконайтесь, що user_id у token_data є UUID
    try:
        user_uuid = UUID(token_data.user_id)
    except ValueError:
        raise credentials_exception
    result = await db.execute(select(models.User).where(models.User.id == user_uuid))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

# Dependency для перевірки ролі користувача
async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    return current_user


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