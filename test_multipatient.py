import asyncio
import os
from services.extractor import extract_entities
import json

async def run_test():
    test_text = """
    Patient: John Doe, 45M, Lab ID: L-9821
    Uric Acid 9.5 mg/dL. Final Diagnosis is Chronic Heart Failure.
    ---
    Patient: Jane Smith, 30F, Lab ID: L-1033
    Sodium 115 mEq/L. Final Diagnosis: Type 2 Diabetes.
    """
    print("Testing extraction with abnormal lab patients...")
    result = await extract_entities(test_text, "digital")
    
    print("\n--- TEST RESULT ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    if "GROQ_API_KEY" not in os.environ:
        from dotenv import load_dotenv
        load_dotenv()
    asyncio.run(run_test())
