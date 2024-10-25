from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.users import User
from uuid import uuid4
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_users(db: AsyncSession):
        pass