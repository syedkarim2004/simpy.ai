import re

INSURANCE_RULES = [
  # DOCUMENTATION RULES (1-8)
  {"id": 1, "category": "Documentation", "rule": "Pre-auth form must have valid patient ID proof", "severity": "Critical"},
  {"id": 2, "category": "Documentation", "rule": "Referral letter from primary physician mandatory", "severity": "Critical"},
  {"id": 3, "category": "Documentation", "rule": "ICD-10 code must be present and valid format", "severity": "Critical"},
  {"id": 4, "category": "Documentation", "rule": "Diagnosis must match ICD-10 code description", "severity": "High"},
  {"id": 5, "category": "Documentation", "rule": "Proposed treatment must be clinically justified", "severity": "High"},
  {"id": 6, "category": "Documentation", "rule": "Estimated cost must be provided", "severity": "Medium"},
  {"id": 7, "category": "Documentation", "rule": "Doctor name and registration number required", "severity": "Medium"},
  {"id": 8, "category": "Documentation", "rule": "Hospital empanelment proof required", "severity": "High"},

  # INSURANCE RULES (9-16)
  {"id": 9, "category": "Insurance", "rule": "Policy must be active at time of admission", "severity": "Critical"},
  {"id": 10, "category": "Insurance", "rule": "Treatment must be covered under policy schedule", "severity": "Critical"},
  {"id": 11, "category": "Insurance", "rule": "Pre-existing conditions waiting period must be completed", "severity": "High"},
  {"id": 12, "category": "Insurance", "rule": "Sum insured must be sufficient for treatment cost", "severity": "High"},
  {"id": 13, "category": "Insurance", "rule": "TPA authorization code must be obtained before admission", "severity": "Critical"},
  {"id": 14, "category": "Insurance", "rule": "Room rent category must match policy entitlement", "severity": "Medium"},
  {"id": 15, "category": "Insurance", "rule": "Co-payment clause must be clearly documented", "severity": "Medium"},
  {"id": 16, "category": "Insurance", "rule": "Sub-limits for specific treatments must be verified", "severity": "High"},

  # CLINICAL RULES (17-24)
  {"id": 17, "category": "Clinical", "rule": "Minimum 24-hour hospitalization required for inpatient claim", "severity": "Critical"},
  {"id": 18, "category": "Clinical", "rule": "Day care procedures must be in approved list", "severity": "High"},
  {"id": 19, "category": "Clinical", "rule": "Surgery must be medically necessary, not elective without approval", "severity": "High"},
  {"id": 20, "category": "Clinical", "rule": "Investigation reports must support diagnosis", "severity": "High"},
  {"id": 21, "category": "Clinical", "rule": "Length of stay must be clinically justified", "severity": "Medium"},
  {"id": 22, "category": "Clinical", "rule": "Discharge summary must match admission diagnosis", "severity": "High"},
  {"id": 23, "category": "Clinical", "rule": "Post-operative complications must be documented separately", "severity": "Medium"},
  {"id": 24, "category": "Clinical", "rule": "Implant details and invoices required if applicable", "severity": "High"},

  # BILLING RULES (25-32)
  {"id": 25, "category": "Billing", "rule": "Final bill must itemize all charges", "severity": "Critical"},
  {"id": 26, "category": "Billing", "rule": "Medicine bills must have pharmacy stamps", "severity": "Medium"},
  {"id": 27, "category": "Billing", "rule": "OT charges must match surgical procedure performed", "severity": "High"},
  {"id": 28, "category": "Billing", "rule": "ICU charges require separate daily documentation", "severity": "High"},
  {"id": 29, "category": "Billing", "rule": "Consultation charges limited to policy sub-limit", "severity": "Medium"},
  {"id": 30, "category": "Billing", "rule": "Enhancement amount must have fresh clinical justification", "severity": "Critical"},
  {"id": 31, "category": "Billing", "rule": "Deductions applied must be communicated to hospital", "severity": "Medium"},
  {"id": 32, "category": "Billing", "rule": "Final settlement UTR must be recorded and shared", "severity": "High"},
]

def check_rules_against_case(case_data: dict) -> dict:
    """Check which rules pass/fail based on case data"""
    results = []
    pdf_text = case_data.get("pdf_text", "").lower()
    
    for rule in INSURANCE_RULES:
        status = "Pass"
        note = ""
        
    for rule in INSURANCE_RULES:
        status = "Pass"
        note = ""
        
        # 1. Identity Proof Check (ID 1)
        if rule["id"] == 1:
            id_keywords = ['identity', 'passport', 'aadhar', 'voter', 'id proof', 'pan card', 'license']
            if not any(k in pdf_text for k in id_keywords):
                status = "Fail"
                note = "No identity proof reference found in document"
                
        # 2. Referral Letter Check (ID 2)
        elif rule["id"] == 2:
            ref_keywords = ['referral', 'referred', 'consultation note', 'primary physician', 'opd note']
            if not any(k in pdf_text for k in ref_keywords):
                status = "Fail"
                note = "Referral letter reference missing"
                
        # 3. ICD-10 Code Format & Presence (ID 3)
        elif rule["id"] == 3:
            icd = case_data.get("icd_code", "")
            has_icd_in_form = icd and icd != "Unknown"
            has_icd_in_pdf = bool(re.search(r'[A-Z][0-9][0-9]', pdf_text))
            
            if not has_icd_in_form and not has_icd_in_pdf:
                status = "Fail"
                note = "MANDATORY: ICD-10 code missing in both form and clinical document"
            elif not has_icd_in_form:
                status = "Warning"
                note = "Code found in PDF but not in form"
                
        # 3. Diagnosis Presence (ID 4)
        elif rule["id"] == 4:
            diag = case_data.get("diagnosis", "").lower()
            if not diag or diag == "unknown":
                status = "Fail"
                note = "Clinical diagnosis not documented"
                
        # 4. Investigation Reports Support (ID 20)
        elif rule["id"] == 20:
            invest_keywords = ['report', 'finding', 'impression', 'test result', 'lab', 'imaging', 'mri', 'ct scan', 'x-ray', 'ecg', 'echo', 'biomarker']
            if not any(k in pdf_text for k in invest_keywords):
                status = "Warning"
                note = "No specific investigation reports mentioned in text"

        # 5. Policy Active Check (ID 9)
        elif rule["id"] == 9:
            if not case_data.get("insurance_provider"):
                status = "Fail"
                note = "Insurance provider must be specified"
                
        # 6. TPA Authorization (ID 13)
        elif rule["id"] == 13:
            if not case_data.get("tpa_name"):
                status = "Fail"
                note = "TPA name missing"
                
        # 7. Minimum 24-hr hospitalization (ID 17)
        elif rule["id"] == 17:
            status = "Warning"
            note = "Verify planned vs actual LOS"
            
        else:
          status = "Pass"
        
        results.append({
            "id": rule["id"],
            "category": rule["category"],
            "rule": rule["rule"],
            "severity": rule["severity"],
            "status": status,
            "note": note
        })
    
    passed = sum(1 for r in results if r["status"] == "Pass")
    failed = sum(1 for r in results if r["status"] == "Fail")
    warnings = sum(1 for r in results if r["status"] == "Warning")
    
    return {
        "total_rules": 32,
        "passed": passed,
        "failed": failed,
        "warnings": warnings,
        "rule_score": round((passed / 32) * 100),
        "results": results
    }
