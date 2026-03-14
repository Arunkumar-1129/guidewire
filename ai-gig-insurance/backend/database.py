from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DATABASE_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        db = client[DATABASE_NAME]
        print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        print("   Using in-memory fallback for demo.")
        db = None


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_db():
    return db
