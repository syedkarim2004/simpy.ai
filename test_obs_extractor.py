import asyncio
import os
from services.extractor import extract_entities
import json

async def run_test():
    test_text = "Sodium 140 mEq/L. Chloride 105 mEq/L. Final Diagnosis is Chronic Heart Failure."
    print("Testing extraction with both labs and diagnoses...")
    result = await extract_entities(test_text, "digital")
    
    print("\n--- TEST RESULT ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    if "GROQ_API_KEY" not in os.environ:
        from dotenv import load_dotenv
        load_dotenv()
    asyncio.run(run_test())
