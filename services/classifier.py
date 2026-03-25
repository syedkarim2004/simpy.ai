import os
import asyncio
from groq import AsyncGroq

async def classify_report(text: str) -> str:
    """
    Classifies a medical report into one of 7 categories.
    Uses a fast lightweight model (8B) for classification.
    """
    if not text:
        return "Mixed"
        
    client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
    
    prompt = f"""You are a medical document classifier.

Classify the report into EXACTLY ONE category from this list:

1. CBC / Hematology
2. Biochemistry
3. Cardiology (ECHO/ECG)
4. Microbiology
5. Urine Analysis
6. Radiology
7. Mixed

STRICT RULES:
- Return ONLY the category name.
- No explanation.
- No JSON.
- Just the string.

Text to classify:
{text[:2000]}"""

    try:
        chat = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=20
        )
        report_type = chat.choices[0].message.content.strip()
        
        # Clean up in case LLM adds extra text
        valid_types = [
            "CBC / Hematology", "Biochemistry", "Cardiology (ECHO/ECG)", 
            "Microbiology", "Urine Analysis", "Radiology", "Mixed"
        ]
        
        for vt in valid_types:
            if vt.lower() in report_type.lower():
                return vt
                
        return "Mixed"
    except Exception as e:
        print(f"⚠️ Classification failed: {e}")
        return "Mixed"
