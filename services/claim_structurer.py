# ═══════════════════════════════════════════════════════════════
# CLAIM STRUCTURING ENGINE v1.0
# Converts FHIR Bundle → Payer-Ready Structured Claim
# ═══════════════════════════════════════════════════════════════

from datetime import datetime

# Revenue/charge mapping for line items (INR)
CHARGE_MAP = {
    # ICD-10 based charges
    "I50.9": 2000, "I50.3": 2000, "I34.0": 1500, "I36.1": 1200,
    "D64.9": 800, "D50.9": 1000, "D53.9": 900, "D72.829": 600,
    "D72.819": 600, "D69.6": 700, "D75.1": 600, "D70.9": 800,
    "D68.9": 900, "A15.9": 3000, "R82.81": 300, "R80.9": 400,
    "R31.9": 500, "N39.0": 600, "R81": 300,
    # CPT based charges
    "85025": 500, "85610": 400, "85730": 400, "93306": 5000,
    "87798": 2500, "81001": 300, "80061": 600, "80076": 800,
    "80069": 700, "84443": 500, "82947": 200, "83036": 400,
    "85007": 350, "85652": 200, "71046": 800, "74177": 5000,
    "70553": 8000, "76700": 1500,
}


def structure_claim(fhir_bundle: dict, report_type: str = "Mixed") -> dict:
    """
    Builds a structured claim from a FHIR R4 Bundle.
    Output includes patient demographics, diagnosis lines, procedure lines,
    and total estimated charges for payer submission.
    """
    entries = fhir_bundle.get("entry", [])
    
    # ── Extract Patient Info ─────────────────────────────────
    patient_info = {"name": "Unknown", "gender": "unknown", "id": "unknown"}
    for entry in entries:
        res = entry.get("resource", {})
        if res.get("resourceType") == "Patient":
            name_list = res.get("name", [])
            patient_info = {
                "name": name_list[0].get("text", "Unknown") if name_list else "Unknown",
                "gender": res.get("gender", "unknown"),
                "id": res.get("id", "unknown"),
            }
            break
    
    # ── Extract Diagnosis Lines ──────────────────────────────
    diagnosis_lines = []
    for entry in entries:
        res = entry.get("resource", {})
        if res.get("resourceType") == "Condition":
            coding = res.get("code", {}).get("coding", [])
            diag_text = res.get("code", {}).get("text", "Unknown Diagnosis")
            icd_code = coding[0].get("code", "UNKNOWN") if coding else "UNKNOWN"
            
            charge = CHARGE_MAP.get(icd_code, 0)
            
            diagnosis_lines.append({
                "description": diag_text,
                "icd_code": icd_code,
                "system": "ICD-10-CM",
                "charge": charge,
                "status": "confirmed"
            })
    
    # ── Extract Procedure Lines ──────────────────────────────
    procedure_lines = []
    for entry in entries:
        res = entry.get("resource", {})
        if res.get("resourceType") == "Procedure":
            coding = res.get("code", {}).get("coding", [])
            proc_text = res.get("code", {}).get("text", "Unknown Procedure")
            cpt_code = None
            
            for c in coding:
                if c.get("system") == "http://www.ama-assn.org/go/cpt":
                    cpt_code = c.get("code")
                    break
            
            if not cpt_code and coding:
                cpt_code = coding[0].get("code")
            
            charge = CHARGE_MAP.get(cpt_code, 0) if cpt_code else 0
            
            procedure_lines.append({
                "description": proc_text,
                "cpt_code": cpt_code or "UNKNOWN",
                "system": "CPT",
                "charge": charge,
                "status": "completed"
            })
    
    # ── Observation Count ────────────────────────────────────
    obs_count = sum(1 for e in entries if e.get("resource", {}).get("resourceType") == "Observation")
    
    # ── Calculate Totals ─────────────────────────────────────
    total_diag_charges = sum(d["charge"] for d in diagnosis_lines)
    total_proc_charges = sum(p["charge"] for p in procedure_lines)
    total_charges = total_diag_charges + total_proc_charges
    
    claim = {
        "claim_id": f"CLM-{patient_info['id'][:8].upper()}",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "report_type": report_type,
        "patient": patient_info,
        "diagnosis_lines": diagnosis_lines,
        "procedure_lines": procedure_lines,
        "observation_count": obs_count,
        "financials": {
            "diagnosis_charges": total_diag_charges,
            "procedure_charges": total_proc_charges,
            "total_estimated_charges": total_charges,
            "currency": "INR"
        },
        "coding_completeness": {
            "total_diagnoses": len(diagnosis_lines),
            "icd_coded": sum(1 for d in diagnosis_lines if d["icd_code"] != "UNKNOWN"),
            "total_procedures": len(procedure_lines),
            "cpt_coded": sum(1 for p in procedure_lines if p["cpt_code"] != "UNKNOWN"),
        },
        "status": "structured"
    }
    
    print(f"📋 Claim structured: {len(diagnosis_lines)} diagnoses, {len(procedure_lines)} procedures, ₹{total_charges} total")
    return claim
