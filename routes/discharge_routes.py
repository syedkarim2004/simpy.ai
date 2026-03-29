from fastapi import APIRouter, HTTPException, Response
from services.discharge_service import run_discharge_audit, settlement_analysis
from services.final_report_generator import generate_final_report
import json
import os
import time

router = APIRouter()

DEMO_CASES_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "demo_cases.json")

@router.get("/discharge/cases")
def get_demo_cases():
    try:
        if os.path.exists(DEMO_CASES_PATH):
            with open(DEMO_CASES_PATH, "r") as f:
                return json.load(f)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/discharge/audit")
def run_discharge_audit_route(data: dict):
    try:
        # Simulate AI thinking
        time.sleep(1.2)
        
        extracted = data.get("extraction", {})
        discharge_overrides = data.get("discharge", {})
        case = data.get("case", {})
        
        # Merge overrides into extracted data for the audit logic
        if discharge_overrides:
            if discharge_overrides.get("admission_date"):
                extracted["admission_date"] = discharge_overrides["admission_date"]
            if discharge_overrides.get("discharge_date"):
                extracted["discharge_date"] = discharge_overrides["discharge_date"]
            if discharge_overrides.get("bill_items"):
                # Map frontend bill_items back to bill_breakdown
                extracted["bill_breakdown"] = [
                    {"category": item["name"], "bill_amount": item["cost"], "reason": "Self-corrected"}
                    for item in discharge_overrides["bill_items"]
                ]
                extracted["total_claimed"] = sum(item["cost"] for item in discharge_overrides["bill_items"])

        audit_results = run_discharge_audit(case, extracted)
        insights = settlement_analysis(extracted, audit_results)
        
        return {
            "success": True,
            "data": {
                "extraction": extracted,
                "audit": audit_results,
                "insights": insights
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/discharge/dispute")
def transmit_dispute(data: dict):
    try:
        # Log the dispute for admin review
        print(f"🚨 DISPUTE TRANSMITTED: {json.dumps(data, indent=2)}")
        return {"success": True, "message": "Dispute transmitted to payor portal."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/discharge/report")
async def get_settlement_report(data: dict):
    try:
        pdf_bytes = generate_final_report(data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=Simpy_Settlement_Report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
