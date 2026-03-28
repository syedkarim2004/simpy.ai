import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response, JSONResponse
from services.preauth_service import run_preauth_audit, generate_excel, cases_store

router = APIRouter()

@router.post("/audit")
async def audit_preauth(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    age: str = Form(...),
    gender: str = Form(...),
    insurance_provider: str = Form(...),
    policy_number: str = Form(...),
    tpa_name: str = Form(...)
):
    try:
        # Save uploaded PDF temporarily
        upload_dir = "temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        pdf_path = f"{upload_dir}/{file.filename}"
        
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # Run audit
        report = run_preauth_audit(
            patient_name=patient_name,
            age=age,
            gender=gender,
            insurance_provider=insurance_provider,
            policy_number=policy_number,
            tpa_name=tpa_name,
            pdf_path=pdf_path
        )
        
        # Cleanup temp file
        os.remove(pdf_path)
        
        return JSONResponse(content={"success": True, "data": report})
    
    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)}, 
            status_code=500
        )

@router.get("/download/{admission_id}")
async def download_excel(admission_id: str):
    try:
        # Find case
        case = next(
            (c for c in cases_store if c["admission_id"] == admission_id), 
            None
        )
        
        if not case:
            return JSONResponse(
                content={"error": "Case not found"}, 
                status_code=404
            )
        
        excel_bytes = generate_excel(case)
        
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=audit-{admission_id}.xlsx"
            }
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)}, 
            status_code=500
        )

@router.get("/cases")
async def get_all_cases():
    return JSONResponse(content={"success": True, "data": cases_store})
