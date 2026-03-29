from fastapi import APIRouter, UploadFile, File
from services.pdf_extractor import extract_pdf_data
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/pdf/extract")
async def extract_pdf(file: UploadFile = File(...)):
    print(f"📂 Received PDF for extraction: {file.filename}")
    try:
        data = extract_pdf_data(file.file)
        print(f"✅ Extraction successful for {file.filename}")
        return {"success": True, "data": data}
    except Exception as e:
        print(f"❌ Error extracting {file.filename}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e), "message": "Extraction failed"}
        )
