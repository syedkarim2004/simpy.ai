import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Async Groq client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def extract_patient_from_page(page_text: str, page_number: int) -> dict:
    """
    Extracts patient data from a single page of a medical report.
    Returns a dictionary matching the expected patient structure.
    Uses AsyncGroq and 8B model for maximum speed and throughput.
    """
    # Truncate to safety limit
    text_to_process = page_text[:3000]
    
    system_prompt = (
        "You are a precise medical document parser. Extract patient data from this single medical report page. "
        "Return ONLY valid JSON, no markdown."
    )
    
    user_prompt = f"""Extract patient details from this page:
    
{text_to_process}

Return a JSON object with these fields:
- patient_name (default "Unknown")
- patient_id (default null)
- age (default null)
- sample_type (e.g. Blood, Urine)
- summary (2-3 line medical impression/result)
"""

    async def call_low_level(model_name):
        completion = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=800
        )
        return completion.choices[0].message.content.strip()

    try:
        # Prioritize 8B for extreme speed and higher rate limits
        try:
            response_text = await call_low_level("llama-3.1-8b-instant")
        except Exception:
            # Fallback to 70B only if 8B fails (rarely happens)
            response_text = await call_low_level("llama-3.3-70b-versatile")
            
        # Clean response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(response_text)
        
        return {
            "patient_number": page_number,
            "patient_name": data.get("patient_name", "Unknown"),
            "patient_id": data.get("patient_id"),
            "age": data.get("age"),
            "summary": data.get("summary", "No summary available"),
            "raw_data": page_text
        }
    except Exception as e:
        print(f"Error extracting patient from page {page_number}: {e}")
        return {
            "patient_number": page_number,
            "patient_name": "Unknown (Extraction Error)",
            "patient_id": None,
            "age": None,
            "summary": "Failed to parse page content.",
            "raw_data": page_text
        }

def split_patients_via_groq(raw_text: str) -> list:
    """
    Sends the first 4,500 characters of raw_text to Groq to intelligently detect 
    and split each patient's data into a structured JSON array.
    """
    # Truncate text to 4,500 characters to be safer with token limits
    truncated_text = raw_text[:4500]
    
    system_prompt = (
        "You are a precise medical document parser. Return only valid JSON arrays. "
        "No markdown, no explanation."
    )
    
    user_prompt = (
        "Detect patient boundaries in the following text using ANY clue: "
        "new name, new patient ID, repeated form headers (Name/Age/DOB appearing again), "
        "new admission record, page breaks followed by new patient info. "
        "Return ONLY a valid JSON array in this exact structure:\n"
        "[\n"
        "  {\n"
        "    \"patient_number\": 1,\n"
        "    \"patient_name\": \"Full name or Unknown\",\n"
        "    \"patient_id\": \"ID or null\",\n"
        "    \"age\": \"age or null\",\n"
        "    \"summary\": \"2-3 line summary of key medical info\",\n"
        "    \"raw_data\": \"complete text belonging to this patient only\"\n"
        "  }\n"
        "]\n\n"
        "Text to process:\n"
        f"{truncated_text}"
    )

    def call_groq(model_name):
        print(f"🚀 Attempting patient splitting with model: {model_name}")
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=3000
        )
        return completion.choices[0].message.content.strip()

    try:
        try:
            response_text = call_groq("llama-3.3-70b-versatile")
        except Exception as e:
            if "rate_limit" in str(e).lower() or "429" in str(e):
                print(f"⚠️ Groq 70B Rate Limit reached. Falling back to 8B model...")
                response_text = call_groq("llama-3.1-8b-instant")
            else:
                raise e
        
        # Strip markdown if present
        if response_text.startswith("```json"):
            response_text = response_text[7:].strip()
        if "```" in response_text:
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
        # Parse and return JSON
        return json.loads(response_text)
    except Exception as e:
        print(f"Error splitting patients via Groq: {e}")
        # Final fallback to a very basic structure if everything fails
        try:
             # Try one last time with 8b if we haven't already
             response_text = call_groq("llama-3.1-8b-instant")
             if response_text.startswith("```json"):
                response_text = response_text[7:].strip()
             if "```" in response_text:
                response_text = response_text.replace("```json", "").replace("```", "").strip()
             return json.loads(response_text)
        except:
            raise e
