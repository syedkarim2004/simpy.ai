# ═══════════════════════════════════════════════════════════════
# VALIDATION & ERROR DETECTION ENGINE v1.0
# Cross-validates FHIR resources for clinical + billing integrity
# ═══════════════════════════════════════════════════════════════


def validate_bundle(fhir_bundle: dict, extraction_entities: dict = None) -> dict:
    """
    Validates a FHIR R4 Bundle for clinical completeness,
    coding accuracy, and billing readiness.
    Returns a structured validation report with severity levels.
    """
    entries = fhir_bundle.get("entry", [])
    issues = []
    
    has_patient = False
    has_condition = False
    has_procedure = False
    has_observation = False
    has_diagnostic_report = False
    
    patient_name = "Unknown"
    
    for entry in entries:
        res = entry.get("resource", {})
        rtype = res.get("resourceType")
        
        # ── Patient Validation ───────────────────────────────
        if rtype == "Patient":
            has_patient = True
            name_list = res.get("name", [])
            if name_list:
                patient_name = name_list[0].get("text", "Unknown")
            
            if not name_list or name_list[0].get("text", "").lower() in ("unknown", "unknown patient", ""):
                issues.append({
                    "severity": "warning",
                    "code": "VAL-P01",
                    "message": "Patient name is missing or unknown",
                    "resource": "Patient",
                    "impact": "May cause claim rejection — patient identification required"
                })
            
            if res.get("gender") in (None, "unknown"):
                issues.append({
                    "severity": "warning",
                    "code": "VAL-P02",
                    "message": "Patient gender is unknown",
                    "resource": "Patient",
                    "impact": "Some payers require gender for claims processing"
                })
        
        # ── Condition Validation ─────────────────────────────
        elif rtype == "Condition":
            has_condition = True
            coding = res.get("code", {}).get("coding", [])
            diag_text = res.get("code", {}).get("text", "")
            
            if not coding:
                issues.append({
                    "severity": "error",
                    "code": "VAL-C01",
                    "message": f"Diagnosis \"{diag_text}\" has no ICD-10 code",
                    "resource": f"Condition/{res.get('id', '?')}",
                    "impact": "Claim will be rejected — ICD-10 coding mandatory for billing"
                })
            else:
                icd_code = coding[0].get("code", "UNKNOWN")
                if icd_code == "UNKNOWN":
                    issues.append({
                        "severity": "error",
                        "code": "VAL-C02",
                        "message": f"Diagnosis \"{diag_text}\" has UNKNOWN ICD-10 code",
                        "resource": f"Condition/{res.get('id', '?')}",
                        "impact": "Code could not be mapped — manual review required"
                    })
        
        # ── Procedure Validation ─────────────────────────────
        elif rtype == "Procedure":
            has_procedure = True
            coding = res.get("code", {}).get("coding", [])
            proc_text = res.get("code", {}).get("text", "")
            
            has_cpt = any(
                c.get("system") == "http://www.ama-assn.org/go/cpt" 
                for c in coding
            )
            
            if not has_cpt:
                issues.append({
                    "severity": "warning",
                    "code": "VAL-PR01",
                    "message": f"Procedure \"{proc_text}\" does not have a CPT code",
                    "resource": f"Procedure/{res.get('id', '?')}",
                    "impact": "Procedure may not be billable without CPT coding"
                })
        
        # ── Observation Validation ───────────────────────────
        elif rtype == "Observation":
            has_observation = True
            coding = res.get("code", {}).get("coding", [])
            obs_text = res.get("code", {}).get("text", "")
            
            has_loinc = any(
                c.get("system") == "http://loinc.org" and c.get("code") != "UNKNOWN"
                for c in coding
            )
            
            if not has_loinc:
                issues.append({
                    "severity": "info",
                    "code": "VAL-O01",
                    "message": f"Observation \"{obs_text}\" missing LOINC code",
                    "resource": f"Observation/{res.get('id', '?')}",
                    "impact": "LOINC coding improves interoperability with ABDM systems"
                })
        
        # ── DiagnosticReport Validation ──────────────────────
        elif rtype == "DiagnosticReport":
            has_diagnostic_report = True
    
    # ── Structural Validation ────────────────────────────────
    if not has_patient:
        issues.append({
            "severity": "error",
            "code": "VAL-S01",
            "message": "No Patient resource found in FHIR bundle",
            "resource": "Bundle",
            "impact": "Critical — claim cannot be processed without patient identification"
        })
    
    if not has_condition:
        issues.append({
            "severity": "warning",
            "code": "VAL-S02",
            "message": "No Condition (diagnosis) resources found",
            "resource": "Bundle",
            "impact": "Bundle contains no diagnoses — may indicate extraction failure"
        })
    
    if not has_diagnostic_report:
        issues.append({
            "severity": "warning",
            "code": "VAL-S03",
            "message": "No DiagnosticReport resource found",
            "resource": "Bundle",
            "impact": "ABDM requires DiagnosticReport for lab result bundles"
        })
    
    # ── Cross-Validation (Clinical Logic) ────────────────────
    if extraction_entities and isinstance(extraction_entities, dict):
        diag_list = extraction_entities.get("diagnosis", extraction_entities.get("diagnoses", []))
        obs_list = extraction_entities.get("observations", [])
        
        if isinstance(diag_list, list) and len(diag_list) > 0 and (not isinstance(obs_list, list) or len(obs_list) == 0):
            issues.append({
                "severity": "info",
                "code": "VAL-X01",
                "message": "Diagnoses found but no supporting observations extracted",
                "resource": "Cross-validation",
                "impact": "Supporting lab values strengthen claim validity — ensure source document contains numeric data"
            })
    
    # ── Score Calculation ────────────────────────────────────
    error_count = sum(1 for i in issues if i["severity"] == "error")
    warning_count = sum(1 for i in issues if i["severity"] == "warning")
    info_count = sum(1 for i in issues if i["severity"] == "info")
    
    if error_count > 0:
        overall_status = "failed"
    elif warning_count > 2:
        overall_status = "review_required"
    elif warning_count > 0:
        overall_status = "passed_with_warnings"
    else:
        overall_status = "passed"
    
    validation_score = max(0, 100 - (error_count * 20) - (warning_count * 5) - (info_count * 1))
    
    report = {
        "validation_score": validation_score,
        "status": overall_status,
        "patient": patient_name,
        "summary": {
            "errors": error_count,
            "warnings": warning_count,
            "info": info_count,
            "total_issues": len(issues),
        },
        "issues": issues,
        "resources_found": {
            "Patient": has_patient,
            "Condition": has_condition,
            "Procedure": has_procedure,
            "Observation": has_observation,
            "DiagnosticReport": has_diagnostic_report,
        }
    }
    
    print(f"🔍 Validation complete: {overall_status} | Score: {validation_score} | Errors: {error_count} | Warnings: {warning_count}")
    return report
