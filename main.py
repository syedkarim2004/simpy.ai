import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import uuid
import io
from PIL import Image
import pytesseract
# Import database and services
from db import connect_db, get_db
from services.parser import extract_text
from services.extractor import extract_entities
from services.fhir import build_fhir_bundle
from services.reconciler import reconcile

# Load .env file on startup
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the MongoDB instance
    await connect_db()
    yield
    # Shutdown logic can go here

app = FastAPI(
    title="Simpy.ai",
    description="AI-powered clinical & administrative data normalization",
    lifespan=lifespan
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class ExtractRequest(BaseModel):
    document_id: str

class FhirRequest(BaseModel):
    extraction_id: str

class ReconcileRequest(BaseModel):
    fhir_id: str
    billed_data: dict

@app.get("/")
async def health_check():
    return {"service": "Simpy.ai", "status": "live"}

@app.post("/ingest")
async def ingest_file(file: UploadFile = File(...)):
    # Read the file bytes
    file_bytes = await file.read()
    
    filename_lower = file.filename.lower()
    
    if filename_lower.endswith(('.jpg', '.jpeg', '.png')):
        print("🖼️ Image OCR used")
        image = Image.open(io.BytesIO(file_bytes))
        raw_text = pytesseract.image_to_string(image, config='--psm 6')
        source = "ocr"
    else:
        # Extract text using parser service
        raw_text = await extract_text(file_bytes)
        
        # Detect the source from how much text was extracted
        # The parser currently prints '📄 Digital PDF extracted' or '🔍 OCR fallback used', 
        if len(raw_text.strip()) > 0:
            source = "digital"
        else:
            source = "ocr" # This is a placeholder since extract_text doesn't return the method
            
        source = "ocr" if "ocr" in str(raw_text).lower() else "digital" # Temporary placeholder logic

    document_id = str(uuid.uuid4())
    doc = {
        "document_id": document_id,
        "filename": file.filename,
        "raw_text": raw_text,
        "source": source,
        "status": "ingested"
    }
    
    db = get_db()
    await db.documents.insert_one(doc)
    
    return {
        "document_id": document_id,
        "status": "ingested",
        "preview": raw_text[:200]
    }

@app.post("/extract")
async def extract_data(request: ExtractRequest):
    db = get_db()
    
    # Fetch document from db
    doc = await db.documents.find_one({"document_id": request.document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    raw_text = doc.get("raw_text", "")
    source = doc.get("source", "digital")
    
    # Call extraction service
    entities = await extract_entities(raw_text, source)
    
    extraction_id = str(uuid.uuid4())
    extraction_record = {
        "extraction_id": extraction_id,
        "document_id": request.document_id,
        "entities": entities
    }
    
    await db.extractions.insert_one(extraction_record)
    
    return {
        "extraction_id": extraction_id,
        "entities": entities
    }

@app.post("/fhir")
async def generate_fhir(request: FhirRequest):
    db = get_db()
    
    # Fetch extraction from db
    print(f"Searching for extraction_id: {request.extraction_id}")
    extraction_record = await db.extractions.find_one({"extraction_id": request.extraction_id})
    if not extraction_record:
        raise HTTPException(status_code=404, detail="Extraction not found")
        
    entities = extraction_record.get("entities", {})
    
    # Call FHIR service
    bundle = build_fhir_bundle(entities)
    
    fhir_id = str(uuid.uuid4())
    fhir_record = {
        "fhir_id": fhir_id,
        "extraction_id": request.extraction_id,
        "bundle": bundle
    }
    
    await db.fhir_bundles.insert_one(fhir_record)
    
    return {
        "fhir_id": fhir_id,
        "bundle": bundle
    }

@app.post("/reconcile")
async def reconcile_data(request: ReconcileRequest):
    db = get_db()
    
    # Fetch fhir bundle from db
    print(f"Searching for fhir_id: {request.fhir_id}")
    fhir_record = await db.fhir_bundles.find_one({"fhir_id": request.fhir_id})
    if not fhir_record:
        raise HTTPException(status_code=404, detail="FHIR bundle not found")
        
    bundle = fhir_record.get("bundle", {})
    
    # Call reconciler service
    report = reconcile(bundle, request.billed_data)
    
    report_id = str(uuid.uuid4())
    report_record = {
        "report_id": report_id,
        "fhir_id": request.fhir_id,
        "report": report
    }
    
    await db.reports.insert_one(report_record)
    
    return {
        "report_id": report_id,
        "report": report
    }
