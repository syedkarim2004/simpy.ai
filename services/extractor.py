import os
import json
import subprocess
from groq import AsyncGroq

PROMPT_TEMPLATE = """You are a medical NLP expert. Extract clinical entities 
from this document. Return ONLY valid JSON with these fields:
{{
  'diagnoses': [{{'text': '', 'confidence': 0.0}}],
  'procedures': [{{'text': ''}}],
  'medications': [{{'name': '', 'dosage': ''}}],
  'patient': {{'name': '', 'age': 0, 'gender': ''}},
  'document_type': ''
}}
Document: {text}"""

async def extract_entities(text: str, source: str) -> dict:
    prompt = PROMPT_TEMPLATE.format(text=text)
    
    if source == "ocr":
        print("🤖 MedGemma used")
        model_path = os.getenv("MEDGEMMA_PATH", "")
        # Use MLX to run the local model via subprocess
        
        # Write the prompt to a temporary file to avoid command line length limits
        prompt_file = "/tmp/medgemma_prompt.txt"
        with open(prompt_file, "w") as f:
            f.write(prompt)
            
        try:
            result = subprocess.run(
                [
                    "python3", "-m", "mlx_lm.generate",
                    "--model", model_path,
                    "--prompt", prompt,
                    "--max-tokens", "1000"
                ],
                capture_output=True,
                text=True,
                check=True
            )
            response_text = result.stdout
        except subprocess.CalledProcessError as e:
            print(f"Error running MedGemma: {e.stderr}")
            response_text = "{}"
            
    elif source == "digital":
        print("⚡ Groq used")
        client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        
        try:
            completion = await client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.0,
            )
            response_text = completion.choices[0].message.content
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            response_text = "{}"
    else:
        raise ValueError("Invalid source. Must be 'ocr' or 'digital'")

    # Try to parse the resulting text as JSON
    try:
        # Clean up markdown formatting if present
        if response_text.startswith("```json"):
            response_text = response_text.split("```json")[1]
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
            
        parsed_entities = json.loads(response_text.strip())
        
        # Hydrate diagnoses list with ICD-10 fuzzy matches
        from services.icd_mapper import map_all_diagnoses
        if "diagnoses" in parsed_entities and parsed_entities["diagnoses"]:
            parsed_entities["diagnoses"] = await map_all_diagnoses(parsed_entities["diagnoses"])
            
        return parsed_entities
        
    except json.JSONDecodeError:
        print("Error: Could not parse response as JSON. Returning empty dict.")
        print(f"Raw response: {response_text}")
        return {
            "diagnoses": [],
            "procedures": [],
            "medications": [],
            "patient": {"name": "", "age": 0, "gender": ""},
            "document_type": ""
        }
