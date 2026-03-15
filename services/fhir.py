from fhir.resources.bundle import Bundle, BundleEntry
from fhir.resources.patient import Patient
from fhir.resources.condition import Condition
from fhir.resources.procedure import Procedure
from fhir.resources.reference import Reference
from fhir.resources.humanname import HumanName
from fhir.resources.codeableconcept import CodeableConcept
from fhir.resources.coding import Coding
import re

def slugify(text: str) -> str:
    """Helper to convert string into a valid id snippet."""
    if not text:
        return "unknown"
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def build_fhir_bundle(extraction: dict) -> dict:
    """
    Converts extracted medical entities into a FHIR R4 Bundle.
    Returns the bundle as a dictionary.
    """
    try:
        entries = []
        
        # 1. Create Patient Resource
        try:
            patient_data = extraction.get("patient", {})
            patient_name_str = patient_data.get("name", "Unknown Patient")
            patient_id = slugify(patient_name_str)
            
            # Check for valid gender (male, female, other, unknown)
            gender_raw = str(patient_data.get("gender", "unknown")).lower()
            valid_genders = ["male", "female", "other", "unknown"]
            gender = gender_raw if gender_raw in valid_genders else "unknown"
            
            patient = Patient(
                id=patient_id,
                name=[HumanName(text=patient_name_str)],
                gender=gender
            )
            
            entries.append(BundleEntry(resource=patient))
            patient_reference = Reference(reference=f"Patient/{patient_id}")
        except Exception as e:
            print(f"Error building Patient resource: {e}")
            patient_id = "unknown"
            patient_reference = Reference(reference=f"Patient/{patient_id}")
        
        # 2. Create Condition Resources (Diagnoses)
        diagnoses = extraction.get("diagnoses", [])
        for idx, diag in enumerate(diagnoses):
            try:
                diag_text = diag.get("text")
                if not diag_text:
                    continue
                
                icd_data = diag.get("icd10", {})
                icd_code = icd_data.get("code", "UNKNOWN")
                
                # Make code optional based on if it's UNKNOWN
                if icd_code != "UNKNOWN":
                    code_concept = CodeableConcept(
                        coding=[Coding(
                            system="http://hl7.org/fhir/sid/icd-10",
                            code=icd_code,
                            display=icd_data.get("description", diag_text)
                        )],
                        text=diag_text
                    )
                else:
                    code_concept = CodeableConcept(
                        text=diag_text
                    )
                    
                condition = Condition(
                    id=f"cond-{patient_id}-{idx}",
                    subject=patient_reference,
                    code=code_concept
                )
                entries.append(BundleEntry(resource=condition))
            except Exception as e:
                print(f"Error building Condition resource index {idx}: {e}")
            
        # 3. Create Procedure Resources
        procedures = extraction.get("procedures", [])
        for idx, proc in enumerate(procedures):
            try:
                proc_text = proc.get("text")
                if not proc_text:
                    continue
                    
                procedure = Procedure(
                    id=f"proc-{patient_id}-{idx}",
                    subject=patient_reference,
                    code=CodeableConcept(
                        coding=[Coding(
                            display=proc_text
                        )],
                        text=proc_text
                    ),
                    status="completed" # status is required by FHIR for Procedure
                )
                entries.append(BundleEntry(resource=procedure))
            except Exception as e:
                print(f"Error building Procedure resource index {idx}: {e}")
            
        # 4. Create the final Bundle
        bundle = Bundle(
            type="collection",
            entry=entries
        )
        
        print(f"🏥 FHIR Bundle built with {len(entries)} resources")
        return bundle.model_dump(exclude_none=True)
        
    except Exception as overall_err:
        print(f"Critical error building FHIR Bundle: {overall_err}")
        return {"resourceType": "Bundle", "type": "collection", "entry": []}
