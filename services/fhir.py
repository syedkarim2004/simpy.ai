from fhir.resources.bundle import Bundle, BundleEntry
from fhir.resources.patient import Patient
from fhir.resources.condition import Condition
from fhir.resources.procedure import Procedure
from fhir.resources.observation import Observation
from fhir.resources.diagnosticreport import DiagnosticReport
from fhir.resources.quantity import Quantity
from fhir.resources.reference import Reference
from fhir.resources.humanname import HumanName
from fhir.resources.codeableconcept import CodeableConcept
from fhir.resources.coding import Coding
import re

# ═══════════════════════════════════════════════════════════════
# LOINC CODE MAPS — Per Report Type (ABDM / India Standards)
# ═══════════════════════════════════════════════════════════════

# DiagnosticReport LOINC codes per report type
REPORT_LOINC = {
    "CBC / Hematology":         {"code": "58410-2",  "display": "CBC panel - Blood by Automated count"},
    "Biochemistry":             {"code": "24323-8",  "display": "Comprehensive metabolic panel"},
    "Microbiology":             {"code": "18725-2",  "display": "Microbiology studies"},
    "Urine Analysis":           {"code": "24356-8",  "display": "Urinalysis complete panel"},
    "Radiology":                {"code": "18748-4",  "display": "Diagnostic imaging study"},
}

# Observation LOINC codes — Hematology
LOINC_HEMATOLOGY = {
    "hemoglobin": {"code": "718-7",   "display": "Hemoglobin [Mass/volume] in Blood", "unit": "g/dL"},
    "hb":         {"code": "718-7",   "display": "Hemoglobin [Mass/volume] in Blood", "unit": "g/dL"},
    "rbc":        {"code": "789-8",   "display": "Erythrocytes [#/volume] in Blood",  "unit": "10^6/uL"},
    "wbc":        {"code": "26464-8", "display": "Leukocytes [#/volume] in Blood",    "unit": "/uL"},
    "platelets":  {"code": "777-3",   "display": "Platelets [#/volume] in Blood",     "unit": "10^3/uL"},
    "mcv":        {"code": "787-2",   "display": "MCV [Entitic volume]",              "unit": "fL"},
    "mch":        {"code": "785-6",   "display": "MCH [Entitic mass]",                "unit": "pg"},
    "rdw":        {"code": "788-0",   "display": "Erythrocyte distribution width",    "unit": "%"},
    "hct":        {"code": "4544-3",  "display": "Hematocrit [Volume Fraction]",      "unit": "%"},
    "esr":        {"code": "30341-2", "display": "Erythrocyte sedimentation rate",    "unit": "mm/hr"},
    "inr":        {"code": "6301-6",  "display": "INR in Platelet poor plasma",       "unit": "INR"},
    "aptt":       {"code": "3173-2",  "display": "aPTT in Blood",                    "unit": "s"},
}

# Observation LOINC codes — Urine Analysis
LOINC_URINE = {
    "leukocytes":    {"code": "5821-4",  "display": "Leukocytes [#/area] in Urine sediment", "unit": "/HPF"},
    "protein":       {"code": "5804-0",  "display": "Protein [Mass/volume] in Urine",        "unit": "mg/dL"},
    "glucose":       {"code": "5792-7",  "display": "Glucose [Mass/volume] in Urine",        "unit": "mg/dL"},
    "specific gravity": {"code": "5811-5", "display": "Specific gravity of Urine",           "unit": ""},
    "ph":            {"code": "5803-2",  "display": "pH of Urine",                           "unit": "pH"},
    "ketone":        {"code": "5797-6",  "display": "Ketones [Mass/volume] in Urine",         "unit": "mg/dL"},
    "bilirubin":     {"code": "5770-3",  "display": "Bilirubin.total [Mass/volume] in Urine", "unit": "mg/dL"},
}

# Observation LOINC codes — Cardiology (ECHO)
LOINC_ECHO = {
    "lvef":  {"code": "8806-2",  "display": "Left ventricular Ejection fraction", "unit": "%"},
    "ivsd":  {"code": "18148-9", "display": "IVS thickness diastole",             "unit": "mm"},
    "lvpwd": {"code": "18152-1", "display": "LV posterior wall diastole",          "unit": "mm"},
    "lvids": {"code": "18154-7", "display": "LV Internal dimension systole",       "unit": "mm"},
    "ao":    {"code": "18037-4", "display": "Aortic root dimension",               "unit": "mm"},
}

# Observation LOINC codes — Biochemistry
LOINC_BIOCHEM = {
    "creatinine":    {"code": "2160-0",  "display": "Creatinine [Mass/volume] in Serum",  "unit": "mg/dL"},
    "urea":          {"code": "3094-0",  "display": "Urea nitrogen [Mass/volume] in Serum","unit": "mg/dL"},
    "bun":           {"code": "3094-0",  "display": "Urea nitrogen [Mass/volume] in Serum","unit": "mg/dL"},
    "sgpt":          {"code": "1742-6",  "display": "ALT [Enzymatic activity/volume]",     "unit": "U/L"},
    "sgot":          {"code": "1920-8",  "display": "AST [Enzymatic activity/volume]",     "unit": "U/L"},
    "ast":           {"code": "1920-8",  "display": "AST [Enzymatic activity/volume]",     "unit": "U/L"},
    "bilirubin":     {"code": "1975-2",  "display": "Bilirubin.total [Mass/volume]",       "unit": "mg/dL"},
    "total protein": {"code": "2885-2",  "display": "Total Protein [Mass/volume]",         "unit": "g/dL"},
    "potassium":     {"code": "2823-3",  "display": "Potassium [Moles/volume] in Serum",   "unit": "mEq/L"},
    "calcium":       {"code": "17861-6", "display": "Calcium [Mass/volume] in Serum",      "unit": "mg/dL"},
    "uric acid":     {"code": "3084-1",  "display": "Uric acid [Mass/volume] in Serum",    "unit": "mg/dL"},
    "cholesterol":   {"code": "2093-3",  "display": "Cholesterol [Mass/volume] in Serum",  "unit": "mg/dL"},
    "triglycerides": {"code": "2571-8",  "display": "Triglycerides [Mass/volume]",         "unit": "mg/dL"},
}

# CPT code lookup for Procedures
CPT_MAP = {
    "cbc":                     "85025",
    "complete blood count":    "85025",
    "hemogram":                "85025",
    "pt-inr":                  "85610",
    "prothrombin time":        "85610",
    "2d echocardiography":     "93306",
    "echocardiography":        "93306",
    "echo":                    "93306",
    "cbnaat":                  "87798",
    "urine analysis":          "81001",
    "urinalysis":              "81001",
    "lipid profile":           "80061",
    "liver function test":     "80076",
    "lft":                     "80076",
    "kidney function test":    "80069",
    "kft":                     "80069",
    "renal function test":     "80069",
    "rft":                     "80069",
    "thyroid profile":         "84443",
    "blood glucose":           "82947",
    "hba1c":                   "83036",
    "peripheral blood smear":  "85007",
    "esr":                     "85652",
    "chest x-ray":             "71046",
    "x-ray":                   "71046",
    "mri":                     "70553",
    "ultrasound":              "76700",
}

def slugify(text: str) -> str:
    """Helper to convert string into a valid id snippet."""
    if not text:
        return "unknown"
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def _get_loinc_for_obs(key: str, report_type: str) -> dict | None:
    """Resolve the correct LOINC entry for an observation key based on report type."""
    key_lower = key.lower().strip()
    
    # Check type-specific maps first, then fall back
    if report_type in ("CBC / Hematology", "Mixed"):
        if key_lower in LOINC_HEMATOLOGY:
            return LOINC_HEMATOLOGY[key_lower]
    if report_type in ("Urine Analysis", "Mixed"):
        if key_lower in LOINC_URINE:
            return LOINC_URINE[key_lower]
    if report_type in ("Cardiology (ECHO/ECG)", "Mixed"):
        if key_lower in LOINC_ECHO:
            return LOINC_ECHO[key_lower]
    if report_type in ("Biochemistry", "Mixed"):
        if key_lower in LOINC_BIOCHEM:
            return LOINC_BIOCHEM[key_lower]
    
    # Fallback: check ALL maps
    for loinc_map in [LOINC_HEMATOLOGY, LOINC_URINE, LOINC_ECHO, LOINC_BIOCHEM]:
        if key_lower in loinc_map:
            return loinc_map[key_lower]
    
    return None


def _get_cpt_code(proc_name: str) -> str | None:
    """Resolve CPT code for a procedure name."""
    if not proc_name:
        return None
    normalized = proc_name.lower().strip()
    # Exact match first
    if normalized in CPT_MAP:
        return CPT_MAP[normalized]
    # Partial match
    for key, code in CPT_MAP.items():
        if key in normalized or normalized in key:
            return code
    return None


def build_fhir_bundle(extractions, report_type: str = "Mixed") -> dict:
    """
    Converts extracted medical entities into a FHIR R4 Bundle.
    Supports ABDM-aligned terminology (SNOMED CT, LOINC, ICD-10).
    Dynamically selects LOINC codes based on report_type.
    """
    try:
        entries = []
        if isinstance(extractions, dict):
            extractions = [extractions]
            
        for ext_idx, extraction in enumerate(extractions):
            patient_id = "unknown"
            
            # ── 1. PATIENT RESOURCE ──────────────────────────────
            try:
                patient_name_str = extraction.get("patient_name")
                if not patient_name_str:
                    patient_data = extraction.get("patient_info", extraction.get("patient", {}))
                    if isinstance(patient_data, str):
                        patient_name_str = patient_data
                        gender_raw = "unknown"
                        lab_id = ""
                    else:
                        patient_name_str = patient_data.get("name", "Unknown Patient")
                        gender_raw = str(patient_data.get("sex", patient_data.get("gender", "unknown"))).lower()
                        lab_id = patient_data.get("lab_id", "")
                else:
                    gender_raw = "unknown"
                    lab_id = ""
                    
                base_slug = slugify(patient_name_str)
                if lab_id:
                    patient_id = f"{base_slug}-{slugify(lab_id)}"
                else:
                    patient_id = f"{base_slug}-{ext_idx}"
                
                patient_reference = Reference(reference=f"Patient/{patient_id}")
                
                if not any(e.resource.id == patient_id for e in entries if type(e.resource).__name__ == "Patient"):
                    valid_genders = ["male", "female", "other", "unknown"]
                    gender = gender_raw if gender_raw in valid_genders else "unknown"
                    
                    patient = Patient(
                        id=patient_id,
                        name=[HumanName(text=patient_name_str)],
                        gender=gender
                    )
                    entries.append(BundleEntry(resource=patient))
            except Exception as e:
                print(f"Error building Patient resource: {e}")
            
            # ── 2. CONDITION RESOURCES (Diagnoses) ───────────────
            diagnoses = extraction.get("diagnosis", extraction.get("diagnoses", []))
            if not isinstance(diagnoses, list):
                diagnoses = []
                
            for idx, diag in enumerate(diagnoses):
                try:
                    diag_text = diag.get("text") or diag.get("name") or diag.get("diagnosis_text")
                    if not diag_text:
                        continue
                    
                    icd_code = diag.get("icd_code") or diag.get("icd10_code")
                    icd_desc = diag_text
                    if not icd_code:
                        icd_data = diag.get("icd10", {})
                        if isinstance(icd_data, dict):
                            icd_code = icd_data.get("code", "UNKNOWN")
                            icd_desc = icd_data.get("description", diag_text)
                        else:
                            icd_code = "UNKNOWN"
                    
                    codings = []
                    if icd_code and icd_code != "UNKNOWN":
                        codings.append(Coding(
                            system="http://hl7.org/fhir/sid/icd-10-cm",
                            code=icd_code,
                            display=icd_desc
                        ))
                    
                    code_concept = CodeableConcept(
                        coding=codings if codings else None,
                        text=diag_text
                    )
                        
                    condition = Condition(
                        id=f"cond-{patient_id}-{idx}",
                        subject=patient_reference,
                        code=code_concept,
                        clinicalStatus=CodeableConcept(
                            coding=[Coding(
                                system="http://terminology.hl7.org/CodeSystem/condition-clinical", 
                                code="active"
                            )]
                        ),
                        verificationStatus=CodeableConcept(
                            coding=[Coding(
                                system="http://terminology.hl7.org/CodeSystem/condition-ver-status",
                                code="confirmed"
                            )]
                        )
                    )
                    entries.append(BundleEntry(resource=condition))
                except Exception as e:
                    print(f"Error building Condition resource index {idx}: {e}")
            
            # ── 3. PROCEDURE RESOURCES (with CPT codes) ──────────
            procedures = extraction.get("procedures", [])
            if not isinstance(procedures, list):
                procedures = []
            theor_procedure = extraction.get("procedure")
            if theor_procedure and isinstance(theor_procedure, str):
                procedures.append({"text": theor_procedure})
                
            for idx, proc in enumerate(procedures):
                try:
                    proc_text = proc.get("text") or proc.get("name") or proc.get("procedure_name")
                    if not proc_text:
                        continue
                    
                    cpt_code = proc.get("cpt_code") or _get_cpt_code(proc_text)
                    
                    codings = []
                    if cpt_code:
                        codings.append(Coding(
                            system="http://www.ama-assn.org/go/cpt",
                            code=cpt_code,
                            display=proc_text
                        ))
                    else:
                        codings.append(Coding(display=proc_text))
                    
                    procedure = Procedure(
                        id=f"proc-{patient_id}-{idx}",
                        subject=patient_reference,
                        code=CodeableConcept(
                            coding=codings,
                            text=proc_text
                        ),
                        status="completed"
                    )
                    entries.append(BundleEntry(resource=procedure))
                except Exception as e:
                    print(f"Error building Procedure resource index {idx}: {e}")
            
            # ── 4. OBSERVATION RESOURCES (Dynamic per report type) ─
            observations_raw = extraction.get("observations", [])
            measurements = extraction.get("measurements", {})
            observation_references = []
            obs_idx = 0
            
            # 4a. Build from structured observations array
            if isinstance(observations_raw, list):
                for obs_data in observations_raw:
                    if not isinstance(obs_data, dict):
                        continue
                    try:
                        obs_name = obs_data.get("name") or obs_data.get("test") or obs_data.get("parameter", "")
                        obs_value = obs_data.get("value", obs_data.get("result", ""))
                        
                        if not obs_name or not obs_value:
                            continue
                        
                        loinc_entry = _get_loinc_for_obs(obs_name, report_type)
                        
                        num_match = re.search(r"[\d.]+", str(obs_value))
                        obs_id = f"obs-{patient_id}-{obs_idx}"
                        
                        if num_match and loinc_entry:
                            num_val = float(num_match.group(0))
                            observation = Observation(
                                id=obs_id,
                                status="final",
                                category=[CodeableConcept(
                                    coding=[Coding(
                                        system="http://terminology.hl7.org/CodeSystem/observation-category",
                                        code="laboratory"
                                    )]
                                )],
                                code=CodeableConcept(
                                    coding=[Coding(
                                        system="http://loinc.org",
                                        code=loinc_entry["code"],
                                        display=loinc_entry["display"]
                                    )],
                                    text=obs_name
                                ),
                                subject=patient_reference,
                                valueQuantity=Quantity(
                                    value=num_val,
                                    unit=loinc_entry.get("unit", ""),
                                    system="http://unitsofmeasure.org",
                                    code=loinc_entry.get("unit", "")
                                )
                            )
                        elif loinc_entry:
                            # Non-numeric observation (e.g. "Positive", "Trace")
                            observation = Observation(
                                id=obs_id,
                                status="final",
                                category=[CodeableConcept(
                                    coding=[Coding(
                                        system="http://terminology.hl7.org/CodeSystem/observation-category",
                                        code="laboratory"
                                    )]
                                )],
                                code=CodeableConcept(
                                    coding=[Coding(
                                        system="http://loinc.org",
                                        code=loinc_entry["code"],
                                        display=loinc_entry["display"]
                                    )],
                                    text=obs_name
                                ),
                                subject=patient_reference,
                                valueString=str(obs_value)
                            )
                        else:
                            # No LOINC match — use text-only
                            observation = Observation(
                                id=obs_id,
                                status="final",
                                category=[CodeableConcept(
                                    coding=[Coding(
                                        system="http://terminology.hl7.org/CodeSystem/observation-category",
                                        code="laboratory"
                                    )]
                                )],
                                code=CodeableConcept(text=obs_name),
                                subject=patient_reference,
                                valueString=str(obs_value)
                            )
                        
                        entries.append(BundleEntry(resource=observation))
                        observation_references.append(Reference(reference=f"Observation/{obs_id}"))
                        obs_idx += 1
                        
                    except Exception as e:
                        print(f"Error building Observation from observations[]: {e}")
            
            # 4b. Build from legacy measurements dict (ECHO compatibility)
            if isinstance(measurements, dict):
                for key, value in measurements.items():
                    try:
                        num_match = re.search(r"[\d.]+", str(value))
                        if not num_match:
                            continue
                        num_val = float(num_match.group(0))
                        
                        loinc_entry = _get_loinc_for_obs(key, report_type)
                        unit = "%" if ("LVEF" in key.upper() or "%" in str(value)) else "mm"
                        loinc_code = loinc_entry["code"] if loinc_entry else "UNKNOWN"
                        loinc_display = loinc_entry["display"] if loinc_entry else key
                        if loinc_entry:
                            unit = loinc_entry.get("unit", unit)
                        
                        obs_id = f"obs-{patient_id}-{obs_idx}"
                        
                        observation = Observation(
                            id=obs_id,
                            status="final",
                            category=[CodeableConcept(
                                coding=[Coding(
                                    system="http://terminology.hl7.org/CodeSystem/observation-category",
                                    code="laboratory" if report_type != "Cardiology (ECHO/ECG)" else "exam"
                                )]
                            )],
                            code=CodeableConcept(
                                coding=[Coding(
                                    system="http://loinc.org",
                                    code=loinc_code,
                                    display=loinc_display
                                )],
                                text=key
                            ),
                            subject=patient_reference,
                            valueQuantity=Quantity(
                                value=num_val,
                                unit=unit,
                                system="http://unitsofmeasure.org",
                                code=unit
                            )
                        )
                        entries.append(BundleEntry(resource=observation))
                        observation_references.append(Reference(reference=f"Observation/{obs_id}"))
                        obs_idx += 1
                        
                    except Exception as e:
                        print(f"Error building Observation {key}: {e}")
            
            # ── 5. DIAGNOSTIC REPORT (Dynamic per report type) ────
            try:
                diag_texts = []
                for diag in diagnoses:
                    txt = diag.get("text") or diag.get("name")
                    if txt:
                        diag_texts.append(txt)
                conclusion_text = ", ".join(diag_texts) if diag_texts else "No diagnoses recorded."
                
                # Resolve LOINC code for this report type
                report_loinc = REPORT_LOINC.get(report_type, REPORT_LOINC["Mixed"])
                
                dr_id = f"dr-{patient_id}-{ext_idx}"
                diagnostic_report = DiagnosticReport(
                    id=dr_id,
                    status="final",
                    code=CodeableConcept(
                        coding=[Coding(
                            system="http://loinc.org",
                            code=report_loinc["code"],
                            display=report_loinc["display"]
                        )]
                    ),
                    subject=patient_reference,
                    result=observation_references if observation_references else None,
                    conclusion=conclusion_text
                )
                entries.append(BundleEntry(resource=diagnostic_report))
            except Exception as e:
                print(f"Error building DiagnosticReport: {e}")
            
        # ── 6. FINALIZE BUNDLE ───────────────────────────────────
        bundle = Bundle(
            type="collection",
            entry=entries
        )
        
        print(f"🏥 FHIR Bundle built with {len(entries)} resources | Report Type: {report_type}")
        return bundle.model_dump(exclude_none=True)
        
    except Exception as overall_err:
        print(f"Critical error building FHIR Bundle: {overall_err}")
        return {"resourceType": "Bundle", "type": "collection", "entry": []}
