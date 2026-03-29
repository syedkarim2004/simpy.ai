import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response, JSONResponse
from services.preauth_service import (
    run_preauth_audit, generate_excel, 
    cases_store, run_enhancement_audit, enhancement_store,
    auto_fill_preauth_form
)
from services.insurance_rules import check_rules_against_case, INSURANCE_RULES
from services.pdf_generator import generate_preauth_pdf

from typing import Optional

router = APIRouter()

@router.post("/generate-form")
async def generate_preauth_form(patient_data: dict):
    try:
        pdf_bytes = generate_preauth_pdf(patient_data)
        admission_id = patient_data.get('admission_id', 'PREAUTH')
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 
                f"attachment; filename=PreAuth-Form-{admission_id}.pdf"
            }
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)}, 
            status_code=500
        )

@router.post("/audit")
async def audit_preauth(
    file: UploadFile = File(None),
    patient_name: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    insurance_provider: Optional[str] = Form(None),
    policy_number: Optional[str] = Form(None),
    tpa_name: Optional[str] = Form(None),
    is_demo: Optional[str] = Form(None)
):
    print(f"DEBUG: Audit Request - Name: {patient_name}, Age: {age}, Gender: {gender}, Insurance: {insurance_provider}, Policy: {policy_number}, TPA: {tpa_name}, IsDemo: {is_demo}")
    
    # Manual validation for better error reporting
    required = {
        "Patient Name": patient_name,
        "Age": age,
        "Gender": gender,
        "Insurance Provider": insurance_provider,
        "Policy Number": policy_number,
        "TPA Name": tpa_name
    }
    
    if is_demo != "true":
        missing = [k for k, v in required.items() if not v]
        if missing:
            return JSONResponse(
                content={"success": False, "error": f"Missing required fields: {', '.join(missing)}"},
                status_code=400
            )

    try:
        pdf_path = ""
        if is_demo == "true":
            # Use local sample PDF for demo
            pdf_path = "sample_preauth.pdf"
            if not os.path.exists(pdf_path):
                # Fallback if specific demo file missing
                raise Exception("Demo PDF not found on server")
        elif file:
            # Save uploaded PDF temporarily
            upload_dir = "temp_uploads"
            os.makedirs(upload_dir, exist_ok=True)
            pdf_path = f"{upload_dir}/{file.filename}"
            
            with open(pdf_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
        else:
            return JSONResponse(
                content={"success": False, "error": "No file uploaded and not in demo mode"}, 
                status_code=400
            )
        
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
        
        # Cleanup temp file if it was an uploaded one
        if file and os.path.exists(pdf_path) and is_demo != "true":
            os.remove(pdf_path)
        
        return JSONResponse(content={"success": True, "data": report})
    
    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)}, 
            status_code=500
        )

@router.post("/enhancement")
async def raise_enhancement(
    file: UploadFile = File(...),
    admission_id: str = Form(...),
    patient_name: str = Form(...),
    age: str = Form(...),
    gender: str = Form(...),
    insurance_provider: str = Form(...),
    tpa_name: str = Form(...),
    original_approved_amt: str = Form(...),
    enhancement_amt: str = Form(...),
    reason: str = Form(...)
):
    try:
        upload_dir = "temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        pdf_path = f"{upload_dir}/enh_{file.filename}"
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        report = run_enhancement_audit(
            admission_id, patient_name, age, gender,
            insurance_provider, tpa_name,
            original_approved_amt, enhancement_amt,
            reason, pdf_path
        )
        os.remove(pdf_path)
        return JSONResponse(content={"success": True, "data": report})
    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)}, 
            status_code=500
        )

@router.post("/autofill")
async def autofill_form(file: UploadFile = File(...)):
    try:
        upload_dir = "temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        pdf_path = f"{upload_dir}/autofill_{file.filename}"
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        extracted = auto_fill_preauth_form(pdf_path)
        os.remove(pdf_path)
        return JSONResponse(content={"success": True, "data": extracted})
    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)},
            status_code=500
        )

@router.get("/rules")
async def get_all_rules():
    return JSONResponse(content={
        "success": True, 
        "total": len(INSURANCE_RULES),
        "rules": INSURANCE_RULES
    })

@router.post("/rules/check/{admission_id}")
async def check_rules(admission_id: str):
    case = next(
        (c for c in cases_store if c["admission_id"] == admission_id),
        None
    )
    if not case:
        return JSONResponse(
            content={"error": "Case not found"}, 
            status_code=404
        )
    result = check_rules_against_case(case)
    return JSONResponse(content={"success": True, "data": result})

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
