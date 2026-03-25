from services.reconciler import reconcile
import json

dummy_fhir = {
    "entry": [
        {"resource": {"resourceType": "Condition", "code": {"coding": [{"code": "I50.9"}]}}},
        {"resource": {"resourceType": "Procedure", "code": {"coding": [{"display": "ECHOCARDIOGRAPHY"}]}}}
    ]
}

dummy_billed = {
    "diagnoses": ["I10"],
    "procedures": ["ECHO"]
}

result = reconcile(dummy_fhir, dummy_billed)
print(json.dumps(result["mismatches"], indent=2))
