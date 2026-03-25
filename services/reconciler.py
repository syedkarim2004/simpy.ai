# ═══════════════════════════════════════════════════════════════
# RECONCILIATION ENGINE v2.0
# Fixes: normalize-before-match, ICD hierarchy, procedure matching
# ═══════════════════════════════════════════════════════════════

# Revenue mapping for financial impact estimation
REVENUE_MAPPING = {
    "I50.9": 2000,
    "I50.3": 2000,
    "I34.0": 1500,
    "I36.1": 1200,
    "D64.9": 800,
    "D50.9": 1000,
    "D53.9": 900,
    "D72.829": 600,
    "D72.819": 600,
    "D69.6": 700,
    "D75.1": 600,
    "D70.9": 800,
    "D72.810": 600,
    "D61.9": 1500,
    "D68.9": 900,
    "R79.1": 500,
    "A15.9": 3000,
    "ECHOCARDIOGRAPHY": 5000,
    "2D ECHOCARDIOGRAPHY": 5000,
    "CBNAAT (GENEXPERT)": 2500,
    "ZN STAIN (ACID FAST)": 800,
    "COMPLETE BLOOD COUNT": 500,
    "CBC/HEMOGRAM WITH DIFFERENTIAL": 500,
    "PROTHROMBIN TIME (PT-INR)": 400,
    "APTT (ACTIVATED PARTIAL THROMBOPLASTIN TIME)": 400,
    "PERIPHERAL BLOOD SMEAR": 350,
}

# ═══ ICD EQUIVALENCE GROUPS ═══
# Codes within the same group are considered clinically equivalent
ICD_EQUIVALENCE = {
    "heart_failure": ["I50.9", "I50.3", "I50.1", "I50.2", "I50.4", "I50.30", "I50.31", "I50.32", "I50.33"],
    "mitral_valve": ["I34.0", "I34.1", "I34.2"],
    "tricuspid_valve": ["I36.1", "I36.0", "I36.2"],
    "anemia": ["D64.9", "D50.9", "D50.0", "D63.1", "D53.9"],
    "leukocytosis": ["D72.829", "D72.82", "D72.1"],
    "leukopenia": ["D72.819", "D72.81"],
    "thrombocytopenia": ["D69.6", "D69.5", "D69.59"],
    "thrombocytosis": ["D75.1", "D75.0"],
    "neutropenia": ["D70.9", "D70.1", "D70.8"],
    "lymphopenia": ["D72.810", "D72.81"],
    "coagulation": ["D68.9", "D68.8", "D68.4", "R79.1"],
    "bone_marrow": ["D61.9", "D61.1", "D61.3"],
    "tuberculosis": ["A15.0", "A15.9", "A15.6", "A17.0", "A18.2"],
}


def normalize_icd(icd: str) -> str:
    """Normalize an ICD code for comparison."""
    if not icd:
        return ""
    return icd.strip().upper().replace(" ", "")


def normalize_proc(proc: str) -> str:
    """Normalize a procedure name for comparison."""
    if not proc:
        return ""
    return proc.strip().lower().replace(" ", "").replace("-", "").replace("_", "")


def icd_match(code1: str, code2: str) -> bool:
    """Check if two ICD codes match — exact or prefix match."""
    c1 = normalize_icd(code1)
    c2 = normalize_icd(code2)
    
    if not c1 or not c2:
        return False
    
    # Exact match
    if c1 == c2:
        return True
    
    # Prefix match (I50.3 matches I50.30, I50.31 etc.)
    if c1.startswith(c2) or c2.startswith(c1):
        return True
    
    return False


def is_equivalent(code1: str, code2: str) -> bool:
    """Check if two ICD codes are clinically equivalent (same disease group)."""
    c1 = normalize_icd(code1)
    c2 = normalize_icd(code2)
    
    for group_name, codes in ICD_EQUIVALENCE.items():
        normalized_group = [normalize_icd(c) for c in codes]
        if c1 in normalized_group and c2 in normalized_group:
            return True
    
    return False


def is_match(clinical_code: str, billing_code: str) -> bool:
    """Full match check: exact + prefix + equivalence."""
    if icd_match(clinical_code, billing_code):
        return True
    if is_equivalent(clinical_code, billing_code):
        return True
    return False


def procedure_match(p1: str, p2: str) -> bool:
    """Normalized procedure name matching."""
    return normalize_proc(p1) == normalize_proc(p2)


def reconcile(fhir_bundle: dict, billed_data: dict) -> dict:
    """
    Compares extracted FHIR data against billed claims.
    FLOW: normalize → match → flag mismatches → score → explain
    """
    
    extracted_diagnoses = []
    extracted_procedures = []
    
    # 1. Extract from FHIR bundle
    entries = fhir_bundle.get("entry", [])
    for entry in entries:
        resource = entry.get("resource", {})
        resource_type = resource.get("resourceType")
        
        if resource_type == "Condition":
            coding = resource.get("code", {}).get("coding", [])
            for c in coding:
                diag_code = c.get("code")
                if diag_code and str(diag_code).upper() != "UNKNOWN":
                    extracted_diagnoses.append(normalize_icd(str(diag_code)))
                    
        elif resource_type == "Procedure":
            coding = resource.get("code", {}).get("coding", [])
            for c in coding:
                proc = c.get("display")
                if proc:
                    extracted_procedures.append(str(proc).strip().upper())
    
    # 2. Normalize billed data FIRST (FIX 2: normalize → then compare)
    billed_diagnoses = [normalize_icd(str(c)) for c in billed_data.get("diagnoses", [])]
    billed_procedures = [str(c).strip().upper() for c in billed_data.get("procedures", [])]
    
    # Fallback for old format
    if not billed_diagnoses and "billed_diagnoses" in billed_data:
        billed_diagnoses = [normalize_icd(str(c.get("code", c)) if isinstance(c, dict) else str(c)) for c in billed_data.get("billed_diagnoses", [])]
    if not billed_procedures and "billed_procedures" in billed_data:
        billed_procedures = [str(c.get("code", c) if isinstance(c, dict) else c).strip().upper() for c in billed_data.get("billed_procedures", [])]
    
    # If no billing data, skip reconciliation
    if not billed_diagnoses and not billed_procedures:
        return {
            "reconciliation_score": 100,
            "status": "approved",
            "mismatches": [],
            "total_billed": billed_data.get("total_amount", 0.0),
            "summary": "No billing reference provided"
        }
    
    # 3. RECONCILE with hierarchy + equivalence matching (FIX 3)
    mismatches = []
    estimated_loss = 0
    score = 100
    
    # Check billed diagnoses against clinical
    for b_code in billed_diagnoses:
        if not any(is_match(e_code, b_code) for e_code in extracted_diagnoses):
            mismatches.append({
                "type": "missing_diagnosis",
                "detail": f"ICD code {b_code} in billing but not supported by clinical data",
                "code": b_code,
                "explanation": f"Code {b_code} appears in billing but no equivalent found in clinical documentation.",
                "impact": "High risk of claim rejection or audit flag.",
                "confidence": 75
            })
            score -= 10
    
    # Check clinical diagnoses against billing (unbilled)
    for e_code in extracted_diagnoses:
        if not any(is_match(e_code, b_code) for b_code in billed_diagnoses):
            loss = REVENUE_MAPPING.get(e_code, 0)
            estimated_loss += loss
            mismatches.append({
                "type": "unbilled_diagnosis",
                "detail": f"ICD code {e_code} in clinical data but missing in billing",
                "code": e_code,
                "explanation": f"Diagnosis {e_code} is present in clinical records but not billed.",
                "impact": f"Potential revenue loss: ₹{loss}" if loss else "Potential revenue loss due to undercoding.",
                "confidence": 80
            })
            score -= 10
    
    # Check billed procedures against clinical (BONUS FIX: normalized matching)
    for b_proc in billed_procedures:
        if not any(procedure_match(b_proc, e_proc) for e_proc in extracted_procedures):
            # Also try fuzzy match before flagging
            from rapidfuzz import process as rfprocess
            match = rfprocess.extractOne(b_proc, extracted_procedures) if extracted_procedures else None
            if match and match[1] >= 85:
                continue  # Close enough, skip
            
            mismatches.append({
                "type": "missing_procedure",
                "detail": f"Procedure {b_proc} in billing but not in clinical data",
                "code": b_proc,
                "explanation": f"Procedure {b_proc} appears in billing but not found in clinical documentation.",
                "impact": "High risk of claim rejection.",
                "confidence": 70
            })
            score -= 10
    
    # Check clinical procedures against billing (unbilled)
    for e_proc in extracted_procedures:
        if not any(procedure_match(e_proc, b_proc) for b_proc in billed_procedures):
            from rapidfuzz import process as rfprocess
            match = rfprocess.extractOne(e_proc, billed_procedures) if billed_procedures else None
            if match and match[1] >= 85:
                continue
            
            loss = REVENUE_MAPPING.get(e_proc, 0)
            estimated_loss += loss
            mismatches.append({
                "type": "unbilled_procedure",
                "detail": f"Procedure {e_proc} performed but not billed",
                "code": e_proc,
                "explanation": f"Procedure {e_proc} was performed but not included in billing.",
                "impact": f"Direct financial loss: ₹{loss}" if loss else "Direct financial loss due to unbilled service.",
                "confidence": 80
            })
            score -= 10
    
    # Floor the score at 0
    score = max(0, score)
    
    # Determine status
    if score >= 80:
        status = "approved"
    elif score >= 50:
        status = "review_required"
    else:
        status = "rejected"
    
    print(f"⚖️ Reconciliation done — score: {score} | status: {status} | mismatches: {len(mismatches)}")
    
    return {
        "reconciliation_score": score,
        "status": status,
        "mismatches": mismatches,
        "total_billed": billed_data.get("total_amount", 0.0),
        "estimated_loss": estimated_loss,
        "summary": f"{len(mismatches)} mismatches found" if mismatches else "All codes reconciled successfully"
    }
