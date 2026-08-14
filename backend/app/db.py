from pymongo import AsyncMongoClient

from .config import settings


client = AsyncMongoClient(settings.mongodb_uri)

db = client[settings.database_name]


async def ping_db() -> None:
    await client.admin.command("ping")


async def close_db() -> None:
    await client.close()