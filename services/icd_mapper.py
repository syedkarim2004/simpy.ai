import asyncio

# Hardcoded JSON dictionary for common conditions
ICD10_MAPPING = {
    # Hematology
    "severe anemia": "D50.9",
    "anemia": "D64.9",
    "iron deficiency anemia": "D50.9",
    "megaloblastic anemia": "D53.9",
    "macrocytic anemia": "D53.9",
    "microcytic anemia": "D50.9",
    "leukopenia": "D72.819",
    "leukocytosis": "D72.829",
    "thrombocytopenia": "D69.6",
    "thrombocytosis": "D75.1",
    "neutropenia": "D70.9",
    "lymphopenia": "D72.810",
    "bicytopenia": "D61.9",
    "pancytopenia": "D61.9",
    "anisocytosis": "D64.9",
    "coagulation disorder": "D68.9",
    "coagulation defect": "D68.9",
    "clotting disorder": "D68.9",
    # Cardiology
    "global lv hypokinesia": "I50.9",
    "lv dysfunction": "I50.9",
    "lv systolic dysfunction": "I50.9",
    "diastolic dysfunction": "I50.3",
    "diastolic dysfunction (grade i)": "I50.3",
    "diastolic dysfunction (grade ii)": "I50.3",
    "heart failure": "I50.9",
    "mitral regurgitation": "I34.0",
    "mitral regurgitation (trivial)": "I34.0",
    "mitral regurgitation (mild)": "I34.0",
    "mitral regurgitation (moderate)": "I34.0",
    "tricuspid regurgitation": "I36.1",
    "tricuspid regurgitation (trace)": "I36.1",
    "tricuspid regurgitation (mild)": "I36.1",
    "mild mr": "I34.0",
    "trace tr": "I36.1",
    # Microbiology
    "tuberculosis": "A15.9",
    "pulmonary tuberculosis": "A15.0",
    # Urine Analysis
    "pyuria": "R82.81",
    "proteinuria": "R80.9",
    "hematuria": "R31.9",
    "urine tract infection": "N39.0",
    "uti": "N39.0",
    "glycosuria": "R81",
    # Biochemistry / Metabolic
    "hyperglycemia": "R73.09",
    "diabetes mellitus": "E11.9",
    "elevated creatinine": "R79.89",
    "renal impairment": "N28.9",
    "chronic kidney disease": "N18.9",
    "elevated bilirubin": "R17",
    "jaundice": "R17",
    "hyperbilirubinemia": "R17",
    "elevated liver enzymes": "R74.0",
    "hyponatremia": "E87.1",
    "hyperkalemia": "E87.5",
    "hypokalemia": "E87.6",
    "hypercholesterolemia": "E78.00",
    "dyslipidemia": "E78.5",
    "hyperuricemia": "E79.0",
    "hypothyroidism": "E03.9",
    "hyperthyroidism": "E05.90",
    # Radiology
    "pleural effusion": "J90",
    "pneumonia": "J18.9",
    "consolidation": "J18.1",
    "fracture": "S72.009A",
    "cardiomegaly": "I51.7",
    "pulmonary edema": "J81.0",
    "pneumothorax": "J93.9",
    "hepatomegaly": "R16.0",
    "splenomegaly": "R16.1",
    # General
    "sepsis": "A41.9",
    "fever": "R50.9",
    "hypertension": "I10",
    "borderline hb": "R71.0",
    "borderline hb \u2013 no diagnosis": "R71.0",
}

async def map_icd10(diagnosis_text: str, model_confidence: int = 0) -> dict | None:
    """
    Takes a diagnosis string, normalizes it, and maps it strictly against a hardcoded dictionary.
    """
    if not diagnosis_text:
        return None

    # Normalize text (lowercase & remove extra spaces)
    normalized_text = " ".join(diagnosis_text.lower().split())
    
    if normalized_text in ICD10_MAPPING:
        code = ICD10_MAPPING[normalized_text]
        
        calculated_conf = min(100, max(0, int(model_confidence)))
        
        print(f"🔍 ICD-10 Exact Mapped: {code} — {normalized_text} (Score: {calculated_conf})")
        return {
            "diagnosis": diagnosis_text,
            "code": code,
            "description": normalized_text,
            "confidence": calculated_conf
        }
    
    # Try partial matching for compound diagnosis text like "Severe anemia - Hgb 5.9 g/dL"
    for key, code in ICD10_MAPPING.items():
        if key in normalized_text:
            calculated_conf = min(100, max(0, int(model_confidence)))
            print(f"🔍 ICD-10 Partial Mapped: {code} — '{key}' found in '{normalized_text}' (Score: {calculated_conf})")
            return {
                "diagnosis": diagnosis_text,
                "code": code,
                "description": key,
                "confidence": calculated_conf
            }
            
    print(f"⚠️ ICD-10 mapping no match for: '{diagnosis_text}'")
    return None

async def map_all_diagnoses(diagnoses: list) -> list:
    """
    Loops through an array of diagnosis dicts and appends the matched ICD-10 record to each.
    """
    mapped_diagnoses = list(diagnoses) # Create a copy to modify
    
    for diag in mapped_diagnoses:
        # Support both "text" and "name" keys
        text = diag.get("text", "") or diag.get("name", "") or diag.get("diagnosis_text", "")
        model_conf = diag.get("confidence", 0)
        
        if text:
            mapping = await map_icd10(text, model_conf)
            if mapping:
                diag["icd10"] = mapping
                diag["icd_code"] = mapping["code"]
            
            # Ensure evidence is preserved if it exists
            if "evidence" not in diag and "evidence" in diag: # redundant but safe
                pass 
        else:
            diag.pop("icd10", None)
            
    return mapped_diagnoses
