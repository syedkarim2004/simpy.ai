import requests
import pymongo
import uuid

# connect to mongo and seed an empty extraction
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client.simpy_ai

extraction_id = str(uuid.uuid4())
db.extractions.insert_one({
    "extraction_id": extraction_id,
    "document_id": "dummy_doc",
    "entities": {
        "diagnoses": [],
        "procedures": []
    }
})

print(f"Inserted empty extraction with id {extraction_id}")

# call the API
resp = requests.post("http://localhost:8080/fhir", json={"extraction_id": extraction_id})
print(f"Status Code: {resp.status_code}")
print(f"Response: {resp.text}")

