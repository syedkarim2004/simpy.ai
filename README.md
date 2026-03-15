# Simpy.ai Backend
**AI-powered clinical & administrative data normalization engine.**

Simpy.ai bridges the gap between raw clinical document extraction and structured billing systems by normalizing medical records using state-of-the-art NLP models (Local MedGemma & Groq LLaMA 3) and translating them into FHIR R4 standard bundles.

---

## 🚀 Features
- **Intelligent Ingestion**: Automatically detects and extracts text from both digital and scanned clinical PDFs utilizing PyMuPDF and OCR (Tesseract).
- **Dual AI Extraction Strategy**: intelligently routes OCR documents locally to MedGemma and routes digital native text to Groq Cloud for instant entity extraction.
- **FHIR R4 Generation**: Transforms raw extracted entities (Patients, Diagnoses, Procedures, Medications) into formatted HL7 FHIR bundles.
- **Fuzzy ICD-10 Mapping**: Utilizes `rapidfuzz` scoring algorithms to pinpoint exact ICD-10 billing codes from conversational diagnosis strings.
- **Billing Reconciliation**: Automatically diffs the generated FHIR records against billed claims to highlight missing or unbilled codes and provide an actionable mismatch report.

---

## 🛠️ Stack & Dependencies
- **FastAPI** (Web Framework)
- **Motor** (Async MongoDB Driver)
- **Groq** & **MLX-LM** (AI Extraction Engines)
- **PyMuPDF** & **PyTesseract** (Document Parsing)
- **fhir.resources** (FHIR Standards Mapping)
- **RapidFuzz** (ICD Code Fuzzy Matching)

---

## 🚦 Endpoints

- `GET /` - Health check status.
- `POST /ingest` - Accepts a `multipart/form-data` PDF, extracts the raw text natively or via OCR fallback, and stores the document payload. Returns a `document_id`.
- `POST /extract` - Accepts a `{ "document_id": "uuid" }` payload, analyzes the document text, queries the AI models to locate all medical entities, and pipes diagnoses through the ICD-10 mapper. Returns an `extraction_id` alongside the entities matrix.
- `POST /fhir` - Accepts an `{ "extraction_id": "uuid" }` payload, consumes the parsed AI extraction, and models `Patient`, `Condition`, and `Procedure` entities matching the FHIR collection standard. Returns a `fhir_id` alongside the bundle configuration.
- `POST /reconcile` - Accepts a `{ "fhir_id": "uuid", "billed_data": dict }` payload, calculates mismatches against billed arrays seamlessly, and returns an actionable report score alongside missing discrepancies.

---

## 💻 Running Locally

1. **Clone the Repository:**
```bash
git clone https://github.com/syedkarim2004/simpy.ai.git
cd simpy.ai
```

2. **Setup virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. **Configure Environment variables (`.env`):**
Make sure the root `.env` includes:
```ini
ENVIRONMENT=development
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
MEDGEMMA_PATH=/absolute/path/to/local/model
```

4. **Start the FastAPI server:**
```bash
uvicorn main:app --reload
```
View the interactive Swagger docs locally at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
