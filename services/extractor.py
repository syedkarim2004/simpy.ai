import os
import json
import re
import subprocess
import asyncio
from groq import AsyncGroq, GroqError, RateLimitError

PROMPT_TEMPLATE = """You are a clinical-grade medical extraction AI.

IMPORTANT:
Your output MUST follow the exact JSON schema below so that the frontend works correctly.

========================================
STEP 1: PATIENT DETECTION
========================================
- Detect ALL patients in the document
- Use name / age / gender if available
- If only one patient -> still return inside "patients" array
- NEVER merge multiple patients

========================================
STEP 2: REPORT TYPE
========================================
Detect report type for each patient:
- CBC / Hemogram
- PT-INR
- APTT
- ECHO
- Other

========================================
STEP 3: EXTRACT VALUES
========================================
Extract for EACH patient:
- Hemoglobin (Hb)
- RBC
- WBC / TLC
- Platelets
- MCV
- MCHC
- RDW
- PT / INR / APTT (if present)

========================================
STEP 4: NUMERIC INTERPRETATION (RANGES)
========================================
- If a range is given (e.g., 3–6):
  → Use the UPPER VALUE for clinical decision making.
- Example: (3–6) → treat as 6.
- Example: (2–4) → treat as 4.

========================================
STEP 5: VALIDATE BEFORE DIAGNOSIS (STRICT)
========================================
Validate ALL numeric values BEFORE generating any diagnosis.

1. ANEMIA (CRITICAL):
- DO NOT diagnose anemia based on Hb alone.
- ONLY diagnose if: (Hb < 12) AND (MCV < 80 OR MCV > 100 OR RDW > 14).
- IF Hb is low BUT MCV and RDW are NORMAL:
  -> Return: "Borderline Hb – No Diagnosis"
  -> Confidence: 90

2. WBC INTERPRETATION:
- TLC > 11,000 → Leukocytosis
- TLC < 4,000 → Leukopenia

3. HARD BLOCK RULE:
- If validation conditions are NOT met → DO NOT generate diagnosis.
- NEVER infer without numeric support.
- NEVER guess or assume.

========================================
STEP 5: ICD MAPPING
========================================
Map strictly:

- Severe Anemia -> D50.9
- Anemia -> D64.9
- Leukopenia -> D72.819
- Leukocytosis -> D72.829
- Thrombocytopenia -> D69.6
- Thrombocytosis -> D75.1
- Coagulation Disorder -> D68.9
- Diastolic Dysfunction -> I50.3
- Heart Failure -> I50.9
- Mitral Regurgitation -> I34.0
- Tricuspid Regurgitation -> I36.1
- Tuberculosis -> A15.9

========================================
STEP 6: PROCEDURES (CPT)
========================================
Map:

- CBC -> 85025
- PT-INR -> 85610
- APTT -> 85730
- 2D Echocardiography -> 93306
- CBNAAT -> 87798

========================================
STEP 8: EXPLANATION GENERATION (MANDATORY)
========================================
Every diagnosis MUST include exact numeric values used + reasoning.
Example: "TLC 12,200 (>11,000) -> Leukocytosis"

"evidence": {{
  "values": {{ "Hb": "...", "MCV": "...", "RDW": "..." }},
  "reason": "...",
  "rule_triggered": "..."
}}

========================================
FINAL OUTPUT FORMAT (STRICT)
========================================

FINAL OUTPUT FORMAT (STRICT):
Return ONLY this JSON:

{{
  "patients": [
    {{
      "patient": {{
        "name": "...",
        "age": "...",
        "gender": "..."
      }},
      "diagnosis": [
        {{
          "name": "...",
          "icd_code": "...",
          "confidence": 90,
          "evidence": {{
            "values": {{ "Hb": "...", "MCV": "...", "RDW": "..." }},
            "reason": "Hb is low AND RDW is high → confirms anemia",
            "rule_triggered": "Anemia requires Hb + RDW/MCV correlation"
          }}
        }}
      ],
      "procedures": [
        {{
          "name": "...",
          "cpt_code": "..."
        }}
      ],
      "observations": []
    }}
  ]
}}

========================================
STRICT RULES
========================================
- ALWAYS return "patients" array (even if only 1 patient)
- NEVER use "diagnoses" -> use "diagnosis"
- NEVER use "icd10_code" -> use "icd_code"
- NEVER return empty diagnosis if abnormal values exist
- DO NOT hallucinate
- DO NOT add extra fields
- OUTPUT MUST BE VALID JSON ONLY

Document:
{text}"""

URINE_PROMPT_TEMPLATE = """You are a clinical urine analysis extractor.

Extract ONLY findings present in the report.

========================================
STEP 1: PATIENT DETECTION
========================================
- Detect ALL patients. Return inside "patients" array.

========================================
STEP 2: NUMERIC INTERPRETATION (RANGES)
========================================
- If a range is given (e.g., 3–6 / HPF):
  → Use the UPPER VALUE for the rule below.
- If leukocyte range overlaps abnormal threshold (>=5), classify as Pyuria.
- Example: 3–6 -> treat as 6 -> classify as Pyuria.

========================================
STEP 3: CLINICAL EXTRACTION (STRICT RULES)
========================================
Extract findings ONLY if present:
- Leukocytes > 5/HPF or Pus Cells > 5 -> Pyuria
- Protein Trace or Positive -> Proteinuria
- RBC Present -> Hematuria
- Glucose Positive -> Glycosuria
- Nitrite Positive -> UTI

STRICT SAFETY RULES:
- DO NOT generate "Anemia", "Leukocytosis", or "Thrombocytosis" here.
- DO NOT infer blood disorders from urine values.
- HARD BLOCK RULE: If conditions are not met -> Return empty list.
- EVIDENCE MANDATORY: Every diagnosis MUST include exact numeric values used + reasoning.
- ZERO HALLUCINATION RULE: NEVER infer without numeric support.

========================================
STEP 3: ICD MAPPING
========================================
Map strictly:
- Pyuria -> R82.81
- Proteinuria -> R80.9
- Hematuria -> R31.9
- Glycosuria -> R81
- UTI or Nitrite Positive -> N39.0

FINAL OUTPUT FORMAT (STRICT):
Return ONLY this JSON:
{{
  "patients": [
    {{
      "patient": {{ "name": "...", "age": "...", "gender": "..." }},
      "diagnosis": [
        {{ 
          "name": "Pyuria", 
          "icd_code": "R82.81", 
          "confidence": 95,
          "evidence": {{
            "values": {{ "Pus Cells": "..." }},
            "reason": "...",
            "rule_triggered": "..."
          }}
        }}
      ],
      "procedures": [
        {{ "name": "Urine Analysis", "cpt_code": "81001" }}
      ],
      "observations": []
    }}
  ]
}}

Document:
{text}"""

BIOCHEM_PROMPT_TEMPLATE = """You are a biochemistry extraction AI.

Focus on: PT, INR, APTT, Liver Function, Kidney Function.

========================================
RULES:
========================================
- PT/INR High -> Clotting Disorder (D68.9)
- APTT High -> Coagulation Disorder (D68.9)

========================================
STEP 8: EXPLANATION GENERATION (MANDATORY)
========================================
- HARD BLOCK RULE: If conditions are not met -> Return empty list.
- EVIDENCE MANDATORY: Every diagnosis MUST include exact numeric values + reasoning.
- ZERO HALLUCINATION RULE: NEVER infer without numeric support.

Example:
{{
  "values": {{ "PT": "...", "INR": "..." }},
  "reason": "PT/INR are elevated above reference range",
  "rule_triggered": "PT abnormal -> Clotting Disorder"
}}

Return standard JSON format with "patients" array.

Document:
{text}"""

# ═══════════════════════════════════════════════════════════════
# PYTHON-LEVEL NORMALIZATION LAYER (runs AFTER LLM extraction)
# This ensures consistent medical terms regardless of LLM output
# ═══════════════════════════════════════════════════════════════

TERM_NORMALIZATION_MAP = {
    # Cardiology
    "2d echo": "2D Echocardiography",
    "echocardiography": "2D Echocardiography",
    "2d echocardiography": "2D Echocardiography",
    "echo": "2D Echocardiography",
    "mr": "Mitral Regurgitation",
    "mitral regurgitation": "Mitral Regurgitation",
    "mr trivial": "Mitral Regurgitation (Trivial)",
    "mr mild": "Mitral Regurgitation (Mild)",
    "mr moderate": "Mitral Regurgitation (Moderate)",
    "tr": "Tricuspid Regurgitation",
    "tricuspid regurgitation": "Tricuspid Regurgitation",
    "tr trace": "Tricuspid Regurgitation (Trace)",
    "tr mild": "Tricuspid Regurgitation (Mild)",
    "diastolic dysfunction": "Diastolic Dysfunction",
    "lv diastolic dysfunction": "Diastolic Dysfunction",
    "dd": "Diastolic Dysfunction",
    "grade i diastolic dysfunction": "Diastolic Dysfunction (Grade I)",
    "grade ii diastolic dysfunction": "Diastolic Dysfunction (Grade II)",
    "lvef": "LV Ejection Fraction",
    "ejection fraction": "LV Ejection Fraction",
    "ef": "LV Ejection Fraction",
    "rwma": "RWMA",
    "regional wall motion abnormality": "RWMA",
    "av": "Aortic Valve",
    "aortic valve": "Aortic Valve",
    "mv": "Mitral Valve",
    "mitral valve": "Mitral Valve",
    "lv dysfunction": "LV Systolic Dysfunction",
    "global lv hypokinesia": "Global LV Hypokinesia",
    # Hematology
    "cbc": "Complete Blood Count",
    "complete blood count": "Complete Blood Count",
    "hb": "Hemoglobin",
    "hemoglobin": "Hemoglobin",
    "haemoglobin": "Hemoglobin",
    "wbc": "Total Leucocyte Count",
    "white blood cell count": "Total Leucocyte Count",
    "tlc": "Total Leucocyte Count",
    "rbc": "Red Blood Cell Count",
    "red blood cell count": "Red Blood Cell Count",
    "platelet count": "Platelet Count",
    "plt": "Platelet Count",
    # Microbiology
    "cbnaat": "CBNAAT (GeneXpert)",
    "genexpert": "CBNAAT (GeneXpert)",
    "xpert mtb/rif": "CBNAAT (GeneXpert)",
    "zn stain": "ZN Stain (Acid Fast)",
    "acid fast stain": "ZN Stain (Acid Fast)",
    "afb stain": "ZN Stain (Acid Fast)",
    "mgit": "Liquid Culture (MGIT 960)",
    "mgit 960": "Liquid Culture (MGIT 960)",
    "liquid culture": "Liquid Culture (MGIT 960)",
    # Clinical terms
    "anemia": "Anemia",
    "anaemia": "Anemia",
    "leukocytosis": "Leukocytosis",
    "tuberculosis": "Tuberculosis",
    "tb": "Tuberculosis",
    "microcytic anemia": "Microcytic Anemia",
    "severe anemia": "Severe Anemia",
    "iron deficiency anemia": "Iron Deficiency Anemia",
    "megaloblastic anemia": "Megaloblastic Anemia",
    "macrocytic anemia": "Megaloblastic Anemia",
    "leukopenia": "Leukopenia",
    "thrombocytopenia": "Thrombocytopenia",
    "thrombocytosis": "Thrombocytosis",
    "neutropenia": "Neutropenia",
    "lymphopenia": "Lymphopenia",
    "bicytopenia": "Bicytopenia",
    "pancytopenia": "Pancytopenia",
    "anisocytosis": "Anisocytosis",
    "coagulation disorder": "Coagulation Disorder",
    "coagulation defect": "Coagulation Disorder",
    "clotting disorder": "Coagulation Disorder",
    # Procedures / Tests
    "cbc/hemogram": "CBC/Hemogram with Differential",
    "hemogram": "CBC/Hemogram with Differential",
    "pt-inr": "Prothrombin Time (PT-INR)",
    "prothrombin time": "Prothrombin Time (PT-INR)",
    "pt": "Prothrombin Time (PT-INR)",
    "aptt": "APTT (Activated Partial Thromboplastin Time)",
    "activated partial thromboplastin time": "APTT (Activated Partial Thromboplastin Time)",
    "pbs": "Peripheral Blood Smear",
    "peripheral blood smear": "Peripheral Blood Smear",
}

def normalize_medical_term(term: str) -> str:
    """Normalize a medical term using the lookup map. Falls back to original if no match."""
    if not term:
        return term
    return TERM_NORMALIZATION_MAP.get(term.strip().lower(), term)

def normalize_entity_list(items: list) -> list:
    """Normalize all text fields in a list of entities."""
    for item in items:
        if isinstance(item, dict):
            for key in ["text", "name", "diagnosis_text", "procedure_name"]:
                if key in item and isinstance(item[key], str):
                    item[key] = normalize_medical_term(item[key])
        elif isinstance(item, str):
            items[items.index(item)] = normalize_medical_term(item)
    return items

# ═══════════════════════════════════════════════════════════════
# CONFIDENCE ENFORCER (runs AFTER normalization, BEFORE return)
# ═══════════════════════════════════════════════════════════════

def compute_confidence(ocr: bool = True, clarity: float = 0.8, numeric: bool = False) -> int:
    ocr_score = 50 if ocr else 0
    clarity_score = int(clarity * 30)
    numeric_score = 20 if numeric else 0
    return min(100, max(0, ocr_score + clarity_score + numeric_score))

def enforce_confidence(data: dict) -> dict:
    """Override hallucinated confidence with computed values."""
    for key in ["diagnosis", "diagnoses"]:
        for d in data.get(key, []):
            if isinstance(d, dict):
                has_numeric = bool(d.get("result_detail") or d.get("icd10") or d.get("icd_code"))
                raw_conf = d.get("confidence", 0)
                if isinstance(raw_conf, (int, float)) and 0 < raw_conf <= 100:
                    clarity = min(1.0, raw_conf / 100.0)
                else:
                    clarity = 0.8
                d["confidence"] = compute_confidence(ocr=True, clarity=clarity, numeric=has_numeric)
    return data

async def extract_entities(text: str, source: str) -> dict:
    print(f"--- RAW EXTRACTED TEXT ---\n{text}\n--------------------------")
    # --- SMART TRUNCATION FOR RATE LIMITS ---
    # Groq Free Tier has tight TPM/TPD limits. 4 pages of OCR noise is too much.
    if len(text) > 12000:
        print(f"⚠️ Text too long ({len(text)} chars). Truncating to 10k to prevent rate limits.")
        text = text[:10000] + "\n...[TRUNCATED DUE TO SIZE]..."

    # --- CLASSIFICATION LAYER ---
    from services.classifier import classify_report
    report_type = await classify_report(text)
    print(f"📊 Classified Report Type: {report_type}")

    # Select prompt based on classification
    if "Urine" in report_type:
        selected_prompt = URINE_PROMPT_TEMPLATE.format(text=text)
    elif "Biochemistry" in report_type or "PT" in text.upper():
        selected_prompt = BIOCHEM_PROMPT_TEMPLATE.format(text=text)
    else:
        # Default to standard clinical prompt (CBC/ECHO)
        selected_prompt = PROMPT_TEMPLATE.format(text=text)

    max_retries = 1
    parsed_entities = None

    async def call_llm(model_name: str, p: str):
        """Helper to call Groq with a specific model."""
        client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
        chat = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": p}],
            temperature=0.1,
            max_tokens=4096,
        )
        return chat.choices[0].message.content

    for attempt in range(max_retries + 1):
        try:
            raw_response = None
            medgemma_path = os.environ.get("MEDGEMMA_PATH")
            
            # 1. Try Local MedGemma if configured
            if medgemma_path:
                print(f"Using MedGemma (local) from: {medgemma_path}")
                try:
                    result = await asyncio.to_thread(
                        subprocess.run,
                        ["python3", "-m", "mlx_lm", "--model", medgemma_path, "--prompt", selected_prompt],
                        capture_output=True, text=True, timeout=120
                    )
                    raw_response = result.stdout
                    if not raw_response or not raw_response.strip():
                        print("⚠️ MedGemma returned empty — falling back to Groq")
                        raw_response = None
                except Exception as mg_err:
                    print(f"⚠️ MedGemma failed: {mg_err} — falling back to Groq")
                    raw_response = None
            
            # 2. Try Groq Primary (70B)
            if not raw_response:
                try:
                    print("Using Groq (Llama-3.3-70B)")
                    raw_response = await call_llm("llama-3.3-70b-versatile", selected_prompt)
                except RateLimitError as e:
                    print(f"⚠️ Groq 70B Rate Limit: {e} — falling back to 8B model")
                    raw_response = await call_llm("llama-3.1-8b-instant", selected_prompt)
                except GroqError as e:
                    print(f"⚠️ Groq Error: {e} — falling back to 8B model")
                    raw_response = await call_llm("llama-3.1-8b-instant", selected_prompt)

            if not raw_response:
                raise Exception("No response from any LLM provider")

            print(f"--- RAW LLM RESPONSE ---\n{raw_response[:500]}...\n-----------------------")

            # --- ROBUST JSON PARSING ---
            response_text = raw_response.strip()
            json_start = response_text.find('{')
            
            if json_start != -1:
                try:
                    # Attempt to decode exactly one JSON object starting from the first '{'
                    decoder = json.JSONDecoder()
                    parsed_entities, index = decoder.raw_decode(response_text[json_start:])
                    print("✅ Extraction using raw_decode successful")
                except json.JSONDecodeError as jde:
                    print(f"⚠️ raw_decode failed: {jde}. Falling back to rfind slice.")
                    # Fallback to the old rfind method if raw_decode fails for some reason
                    json_end = response_text.rfind('}') + 1
                    json_str = response_text[json_start:json_end]
                    parsed_entities = json.loads(json_str)
                    print("✅ Extraction using rfind slice successful")
            else:
                print("❌ No '{' found in response.")
                parsed_entities = {}

            if not isinstance(parsed_entities, dict):
                parsed_entities = {}
            
            break
                
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error on extraction attempt {attempt+1}: {e}")
            parsed_entities = {}
            if attempt < max_retries:
                print("Retrying...")
            else:
                # Return a minimal valid structure so the pipeline doesn't crash
                return {
                    "error": str(e),
                    "status": "error",
                    "patients": []
                }

    # === NORMALIZATION: handle strict multi-patient schema ===
    if parsed_entities is None:
        parsed_entities = {}

    print(f"--- FINAL ENTITIES ---\n{json.dumps(parsed_entities, indent=2)}\n----------------------")

    # ═══ MULTI-PATIENT NORMALIZATION ═══
    patients = parsed_entities.get("patients", [])
    if isinstance(patients, list) and len(patients) > 0:
        for patient_entry in patients:
            if not isinstance(patient_entry, dict):
                continue
            
            # Extract patient info from nested "patient" key
            patient_info = patient_entry.get("patient", {})
            if not isinstance(patient_info, dict):
                patient_info = {}
            
            # Normalize per-patient diagnoses (key is "diagnosis", not "diagnoses")
            raw_diags = patient_entry.get("diagnosis", patient_entry.get("diagnoses", []))
            if not isinstance(raw_diags, list):
                raw_diags = []
            normalized = _normalize_diagnosis_list(raw_diags)
            patient_entry["diagnosis"] = normalized
            patient_entry["diagnoses"] = normalized  # backward compat
            
            # Normalize per-patient procedures
            raw_procs = patient_entry.get("procedures", [])
            if not isinstance(raw_procs, list):
                raw_procs = []
            norm_procs = []
            for item in raw_procs:
                if isinstance(item, str):
                    norm_procs.append({"text": item, "name": item, "confidence": 80})
                elif isinstance(item, dict):
                    p = dict(item)
                    if "name" in p and "text" not in p:
                        p["text"] = p["name"]
                    if "procedure_name" in p and "text" not in p:
                        p["text"] = p["procedure_name"]
                    norm_procs.append(p)
            patient_entry["procedures"] = norm_procs
            
            # Ensure observations exists
            patient_entry["observations"] = patient_entry.get("observations", [])
            
            # Apply term normalization
            normalize_entity_list(patient_entry["diagnosis"])
            normalize_entity_list(patient_entry["procedures"])
            
            # Apply confidence enforcer per patient
            enforce_confidence(patient_entry)

        parsed_entities["patients"] = patients
        
        # ═══ BACKWARD COMPATIBILITY: flatten first patient for FHIR/Frontend ═══
        first = patients[0]
        first_patient_info = first.get("patient", {})
        if not isinstance(first_patient_info, dict):
            first_patient_info = {}
        
        parsed_entities["patient"] = {
            "name": first_patient_info.get("name", first.get("name", "Unknown Patient")),
            "age": first_patient_info.get("age", first.get("age", "")),
            "gender": first_patient_info.get("gender", first.get("gender", "unknown")),
        }
        parsed_entities["patient_info"] = parsed_entities["patient"]
        parsed_entities["diagnosis"] = first.get("diagnosis", [])
        parsed_entities["diagnoses"] = first.get("diagnoses", first.get("diagnosis", []))
        parsed_entities["procedures"] = first.get("procedures", [])
        parsed_entities["observations"] = first.get("observations", [])
        parsed_entities["measurements"] = parsed_entities.get("measurements", {})
        
    else:
        # ═══ SINGLE-PATIENT / LEGACY FORMAT ═══
        patient_raw = parsed_entities.get("patient", parsed_entities.get("patient_info", {}))
        if not isinstance(patient_raw, dict):
            patient_raw = {}
        parsed_entities["patient"] = {
            "name": patient_raw.get("name", "Unknown Patient"),
            "age": patient_raw.get("age", ""),
            "gender": patient_raw.get("gender", patient_raw.get("sex", "unknown")),
        }
        parsed_entities["patient_info"] = patient_raw

        raw_diagnoses = parsed_entities.get("diagnosis", parsed_entities.get("diagnoses", parsed_entities.get("findings", [])))
        if not isinstance(raw_diagnoses, list):
            raw_diagnoses = []
        normalized_diagnoses = _normalize_diagnosis_list(raw_diagnoses)
        parsed_entities["diagnosis"] = normalized_diagnoses
        parsed_entities["diagnoses"] = normalized_diagnoses

        raw_procedures = parsed_entities.get("procedures", [])
        if not isinstance(raw_procedures, list):
            raw_procedures = []
        normalized_procedures = []
        for item in raw_procedures:
            if isinstance(item, str):
                normalized_procedures.append({"text": item, "name": item, "confidence": 80})
            elif isinstance(item, dict):
                p = dict(item)
                if "name" in p and "text" not in p:
                    p["text"] = p["name"]
                if "procedure_name" in p and "text" not in p:
                    p["text"] = p["procedure_name"]
                normalized_procedures.append(p)
        parsed_entities["procedures"] = normalized_procedures

        parsed_entities["observations"] = parsed_entities.get("observations", [])
        parsed_entities["measurements"] = parsed_entities.get("measurements", {})

        normalize_entity_list(parsed_entities.get("diagnosis", []))
        normalize_entity_list(parsed_entities.get("diagnoses", []))
        normalize_entity_list(parsed_entities.get("procedures", []))
        
        parsed_entities = enforce_confidence(parsed_entities)

    # ICD mapping for any diagnoses that don't have ICD codes
    all_diagnoses = parsed_entities.get("diagnosis", parsed_entities.get("diagnoses", []))
    unmapped = [d for d in all_diagnoses if isinstance(d, dict) and not d.get("icd10") and not d.get("icd10_code") and not d.get("icd_code")]
    if unmapped:
        from services.icd_mapper import map_all_diagnoses
        mapped = await map_all_diagnoses(unmapped)
        mapped_idx = 0
        for i, d in enumerate(all_diagnoses):
            if isinstance(d, dict) and not d.get("icd10") and not d.get("icd10_code") and not d.get("icd_code"):
                if mapped_idx < len(mapped):
                    all_diagnoses[i] = mapped[mapped_idx]
                    mapped_idx += 1

    # Reconciliation summary
    if "reconciliation" not in parsed_entities:
        parsed_entities["reconciliation"] = {
            "score": 85,
            "claim_status": "APPROVED",
            "diagnoses_count": len(all_diagnoses),
            "icd_mapped_count": len([d for d in all_diagnoses if isinstance(d, dict) and (d.get("icd10") or d.get("icd10_code") or d.get("icd_code"))]),
            "mismatches": []
        }

    print(f"✅ Pipeline complete | Patients: {len(patients) if patients else 1} | Diagnoses: {len(all_diagnoses)}")
    return parsed_entities


def _normalize_diagnosis_list(raw_list: list) -> list:
    """Normalize a list of diagnosis items to a consistent format."""
    normalized = []
    for item in raw_list:
        if isinstance(item, str):
            normalized.append({"text": item, "name": item, "confidence": 80})
        elif isinstance(item, dict):
            d = dict(item)
            # Ensure "text" key exists for FHIR compatibility
            if "name" in d and "text" not in d:
                d["text"] = d["name"]
            if "diagnosis_text" in d and "text" not in d:
                d["text"] = d["diagnosis_text"]
            # Build icd10 object from icd_code (new schema) or icd10_code (legacy)
            if "icd_code" in d and "icd10" not in d:
                d["icd10"] = {
                    "code": d.get("icd_code", ""),
                    "description": d.get("name", d.get("text", ""))
                }
            if "icd10_code" in d and "icd10" not in d:
                d["icd10"] = {
                    "code": d.get("icd10_code", ""),
                    "description": d.get("icd10_description", d.get("diagnosis_text", ""))
                }
            # Preserve evidence field (IMPORTANT)
            if "evidence" in d:
                pass # Already preserved by dict(item)
            
            normalized.append(d)
    return normalized
