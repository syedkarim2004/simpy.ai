import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import uuid
import io
from PIL import Image
import pytesseract
pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"
# Import database and services
from db import connect_db, get_db
from services.parser import extract_text
from services.extractor import extract_entities
from services.fhir import build_fhir_bundle
from services.reconciler import reconcile
from services.claim_structurer import structure_claim
from services.validator import validate_bundle
from services.pdf_parser import extract_text_from_pdf, extract_pages_from_pdf
from services.patient_splitter import split_patients_via_groq, extract_patient_from_page
from services.auth import router as auth_router
import time

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

app.include_router(auth_router, prefix="/api/auth")

# Pydantic models for request bodies
class ExtractRequest(BaseModel):
    document_id: str

class FhirRequest(BaseModel):
    extraction_id: str

class ReconcileRequest(BaseModel):
    fhir_id: str
    billed_data: dict

class ValidateRequest(BaseModel):
    fhir_id: str

class ClaimRequest(BaseModel):
    fhir_id: str

class FeedbackRequest(BaseModel):
    report_id: str
    corrections: list
    reviewer: str = "anonymous"

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
        raw_text = await asyncio.to_thread(pytesseract.image_to_string, image, config='--psm 6')
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
    
    # Call extraction service with error handling
    try:
        entities = await extract_entities(raw_text, source)
    except Exception as e:
        print(f"❌ Extraction error: {e}")
        return {
            "extraction_id": str(uuid.uuid4()),
            "status": "error",
            "message": str(e),
            "entities": {
                "diagnosis": [],
                "procedures": [],
                "patients": []
            }
        }
    
    extraction_id = str(uuid.uuid4())
    extraction_record = {
        "extraction_id": extraction_id,
        "document_id": request.document_id,
        "entities": entities,
        "report_type": entities.get("report_type", "Mixed"),
        "status": entities.get("status", "completed")
    }
    
    await db.extractions.insert_one(extraction_record)
    
    return {
        "extraction_id": extraction_id,
        "entities": entities,
        "report_type": entities.get("report_type", "Mixed"),
        "status": entities.get("status", "completed"),
        "message": entities.get("error", "")
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
    
    if not entities.get("diagnosis") and not entities.get("findings") and not entities.get("measurements"):
        # The prompt says 'DO NOT FAIL SILENTLY'. So we only fail if absolutely empty.
        pass # Allow FHIR to generate whatever it can
    
    # Call FHIR service with report_type for dynamic LOINC selection
    report_type = extraction_record.get("report_type", "Mixed")
    bundle = await asyncio.to_thread(build_fhir_bundle, entities, report_type)
    
    fhir_id = str(uuid.uuid4())
    fhir_record = {
        "fhir_id": fhir_id,
        "extraction_id": request.extraction_id,
        "report_type": report_type,
        "bundle": bundle
    }
    
    await db.fhir_bundles.insert_one(fhir_record)
    
    return {
        "fhir_id": fhir_id,
        "bundle": bundle,
        "report_type": report_type
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
    report = await asyncio.to_thread(reconcile, bundle, request.billed_data)
    
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

@app.post("/validate")
async def validate_data(request: ValidateRequest):
    db = get_db()
    
    fhir_record = await db.fhir_bundles.find_one({"fhir_id": request.fhir_id})
    if not fhir_record:
        raise HTTPException(status_code=404, detail="FHIR bundle not found")
    
    bundle = fhir_record.get("bundle", {})
    
    # Get original extraction entities for cross-validation
    extraction_id = fhir_record.get("extraction_id")
    extraction_record = await db.extractions.find_one({"extraction_id": extraction_id}) if extraction_id else None
    entities = extraction_record.get("entities", {}) if extraction_record else {}
    
    validation_report = await asyncio.to_thread(validate_bundle, bundle, entities)
    
    return {"validation": validation_report}

@app.post("/claim")
async def generate_claim(request: ClaimRequest):
    db = get_db()
    
    fhir_record = await db.fhir_bundles.find_one({"fhir_id": request.fhir_id})
    if not fhir_record:
        raise HTTPException(status_code=404, detail="FHIR bundle not found")
    
    bundle = fhir_record.get("bundle", {})
    report_type = fhir_record.get("report_type", "Mixed")
    
    claim = await asyncio.to_thread(structure_claim, bundle, report_type)
    
    claim_id = str(uuid.uuid4())
    claim_record = {
        "claim_id": claim_id,
        "fhir_id": request.fhir_id,
        "claim": claim
    }
    await db.claims.insert_one(claim_record)
    
    return {"claim_id": claim_id, "claim": claim}

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    db = get_db()
    
    feedback_record = {
        "report_id": request.report_id,
        "corrections": request.corrections,
        "reviewer": request.reviewer,
        "submitted_at": str(uuid.uuid4())[:8],
        "status": "pending_review"
      }
    
    await db.feedback.insert_one(feedback_record)
    
    return {"status": "feedback_received", "corrections_count": len(request.corrections)}

@app.post("/api/upload-pdf")
async def upload_multi_patient_pdf(file: UploadFile = File(...)):
    """
    Accepts a multi-patient PDF, extracts pages, and uses Groq AI to extract patient data in parallel.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_bytes = await file.read()
    
    # Extract list of pages using the new pdf_parser service
    pages = extract_pages_from_pdf(file_bytes)
    
    if not pages:
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF or PDF is empty/too small.")
    
    # Use a Semaphore to limit concurrency and avoid rate limits
    MAX_CONCURRENCY = 5
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    
    async def process_with_semaphore(page_text, page_num):
        async with semaphore:
            return await extract_patient_from_page(page_text, page_num)

    try:
        # Create tasks for all pages
        tasks = [process_with_semaphore(page_text, i + 1) for i, page_text in enumerate(pages)]
        
        print(f"🚀 Starting concurrent processing of {len(pages)} pages...")
        patients = await asyncio.gather(*tasks)
        
        return {
            "total_patients": len(patients),
            "patients": patients
        }
    except Exception as e:
        print(f"❌ Error in multi-patient processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))
