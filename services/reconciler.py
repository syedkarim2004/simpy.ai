def reconcile(fhir_bundle: dict, billed_data: dict) -> dict:
    """
    Compares extracted FHIR data against billed claims to find mismatches.
    Calculates a score and returns a reconciliation report.
    """
    
    extracted_diagnoses = []
    extracted_procedures = []
    
    # 1 & 2. Extract diagnoses and procedure codes from the FHIR bundle
    entries = fhir_bundle.get("entry", [])
    for entry in entries:
        resource = entry.get("resource", {})
        resource_type = resource.get("resourceType")
        
        if resource_type == "Condition":
            # Extract display text / code
            coding = resource.get("code", {}).get("coding", [])
            for code in coding:
                diag = code.get("display")
                if diag:
                    extracted_diagnoses.append(diag)
                    
        elif resource_type == "Procedure":
            # Extract display text / code
            coding = resource.get("code", {}).get("coding", [])
            for code in coding:
                proc = code.get("display")
                if proc:
                    extracted_procedures.append(proc)
                    
    # 3. Get billed diagnoses and procedures
    billed_diagnoses = billed_data.get("billed_diagnoses", [])
    billed_procedures = billed_data.get("billed_procedures", [])
    
    mismatches = []
    
    # 4. Find mismatches for Diagnoses
    for code in billed_diagnoses:
        if code not in extracted_diagnoses:
            mismatches.append({
                "type": "missing_diagnosis",
                "detail": f"Code '{code}' in bill but not in records"
            })
            
    for code in extracted_diagnoses:
        if code not in billed_diagnoses:
            mismatches.append({
                "type": "unbilled_diagnosis",
                "detail": f"Diagnosis '{code}' in records but not billed"
            })
            
    # Find mismatches for Procedures
    for code in billed_procedures:
        if code not in extracted_procedures:
            mismatches.append({
                "type": "missing_procedure",
                "detail": f"Code '{code}' in bill but not in records"
            })
            
    for code in extracted_procedures:
        if code not in billed_procedures:
            mismatches.append({
                "type": "unbilled_procedure",
                "detail": f"Procedure '{code}' in records but not billed"
            })
            
    # 5. Calculate reconciliation score
    score = 100
    score -= (len(mismatches) * 10)
    
    # Floor the score at 0
    score = max(0, score)
    
    status = "approved" if score >= 80 else "flagged"
    
    print(f"⚖️ Reconciliation done — score: {score}")
    
    # 6. Return standard structure
    return {
        "reconciliation_score": score,
        "status": status,
        "mismatches": mismatches,
        "total_billed": billed_data.get("total_amount", 0.0),
        "summary": f"{len(mismatches)} mismatches found"
    }
