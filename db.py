import os
from motor.motor_asyncio import AsyncIOMotorClient

# Global database client and instance
client = None
db = None

async def connect_db():
    global client, db
    try:
        mongo_uri = os.getenv("MONGO_URI")
        client = AsyncIOMotorClient(mongo_uri)
        db = client.simpy_ai
        
        # Collections mapping based on requirements
        # These will be created lazily by MongoDB upon first insertion
        # db.documents
        # db.extractions
        # db.fhir_bundles
        # db.reports
        
        # Ping the database to verify the connection is successful
        await client.admin.command('ping')
        print("✅ Simpy.ai DB connected")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

def get_db():
    return db
