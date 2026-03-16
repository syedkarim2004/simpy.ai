import json
import os
from rapidfuzz import process, fuzz

# Load the JSON on startup into memory
CODE_MAP = {}
json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "icd10_codes.json")

try:
    with open(json_path, "r") as f:
        data = json.load(f)
        # The new format is immediately a dictionary of {description_lowercase: code}
        CODE_MAP = data
except Exception as e:
    print(f"Error loading ICD-10 codes: {e}")

async def map_icd10(diagnosis_text: str) -> dict:
    """
    Takes a clinical diagnosis text and fuzzy matches it against a local JSON file.
    Returns matched code with description and confidence, or UNKNOWN.
    """
    if not diagnosis_text or not CODE_MAP:
        return {"code": "UNKNOWN", "description": "No match found", "confidence": 0.0}

    # Extract best match from the dictionary keys (descriptions)
    descriptions = list(CODE_MAP.keys())
    
    # rapidfuzz extractOne returns a tuple: (match_string, score, index)
    match = process.extractOne(
        diagnosis_text.lower(), 
        descriptions, 
        scorer=fuzz.WRatio, 
        score_cutoff=60
    )
    
    if match:
        matched_desc, score, _ = match
        matched_code = CODE_MAP[matched_desc]
        
        # Convert rapidfuzz score (0-100) to confidence float (0.0-1.0)
        confidence = round(score / 100.0, 2)
        
        print(f"🔍 ICD-10 mapped: {matched_code} — {matched_desc}")
        
        return {
            "code": matched_code, 
            "description": matched_desc, 
            "confidence": confidence
        }
    
    return {"code": "UNKNOWN", "description": "No match found", "confidence": 0.0}

async def map_all_diagnoses(diagnoses: list) -> list:
    """
    Loops through an array of diagnosis dicts and appends the matched ICD-10 record to each.
    """
    mapped_diagnoses = list(diagnoses) # Create a copy to modify
    
    for diag in mapped_diagnoses:
        text = diag.get("text", "")
        if text:
            # Map the actual ICD-10 classification item block
            diag["icd10"] = await map_icd10(text)
        else:
            diag["icd10"] = {"code": "UNKNOWN", "description": "No text provided", "confidence": 0.0}
            
    return mapped_diagnoses
