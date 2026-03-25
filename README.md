# Simpy.ai
**AI-powered clinical & administrative data normalization engine.**

Simpy.ai bridges the gap between raw clinical document extraction and structured billing systems by normalizing medical records using state-of-the-art NLP models (Local MedGemma & Groq LLaMA 3) and translating them into FHIR R4 standard bundles.

---

## 🚀 Features
- **Intelligent Ingestion**: Automatically detects and extracts text from digital PDFs, images, and scanned documents utilizing PyMuPDF and OCR (PyTesseract).
- **Dual AI Extraction Strategy**: Intelligently routes local extraction to MedGemma and cloud processing to Groq for instant entity extraction.
- **FHIR R4 Generation**: Transforms raw extracted entities (Patients, Diagnoses, Procedures, Medications) into structured HL7 FHIR payloads.
- **Fuzzy ICD-10 Mapping**: Utilizes `rapidfuzz` scoring algorithms to pinpoint exact ICD-10 billing codes from conversational diagnosis strings.
- **Revenue Reconciliation**: Automatically diffs generated FHIR records against billed claims to highlight missing or unbilled codes, exposing revenue leakage.

---

## 🏗️ Architecture Stack

### Backend (`/`)
- **FastAPI** (High-performance Async Web Framework)
- **Motor** (Async MongoDB Driver)
- **Groq API** & **MLX-LM** (Hardware-accelerated AI Models)
- **PyMuPDF**, **pdf2image**, & **Pytesseract** (Document Parsing)
- **fhir.resources** (FHIR R4 Standard Modeling)

### Frontend (`/simpy-frontend`)
- **React 18** & **Vite** (Lightning-fast client rendering)
- **Tailwind CSS v3** (Utility-first styling matching Inovalon design specs)
- **React Router v6** (Client-side nested routing)
- **React Three Fiber** & **Drei** (WebGL TorusKnot Hero Visualizations)
- **Lucide React** (Clean SVG iconography)

---

## 🚦 Backend Endpoints

- `GET /` - API Health check status.
- `POST /ingest` - Accepts a `multipart/form-data` file payload, extracts raw text natively or via Image OCR, and stores the buffer. Returns a `document_id`.
- `POST /extract` - Accepts `{ "document_id": "uuid" }`, analyzes the document text, queries the AI models to locate medical entities, and pipes diagnoses through the ICD-10 dictionary. Returns an `extraction_id` alongside the entities matrix.
- `POST /fhir` - Accepts `{ "extraction_id": "uuid" }`, consumes the parsed AI extraction, and models `Patient`, `Condition`, and `Procedure` schemas. Returns a `fhir_id` alongside the raw bundle configuration.
- `POST /reconcile` - Accepts `{ "fhir_id": "uuid", "billed_data": dict }`, calculates mismatches against billed arrays seamlessly, and returns an actionable report score alongside missing discrepancies.

---

## 💻 Running Locally

### 1. Start the FastAPI Backend
```bash
# Clone the repository
git clone https://github.com/syedkarim2004/simpy.ai.git
cd simpy.ai

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure Environment Variables (.env)
echo "MONGO_URI=mongodb://localhost:27017" >> .env
echo "GROQ_API_KEY=your_key_here" >> .env

# Launch Uvicorn Server
uvicorn main:app --reload
```
View the interactive Swagger API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the React Frontend
```bash
# Navigate to the frontend workspace
cd simpy-frontend

# Install node dependencies
npm install

# Boot the Vite dev server
npm run dev
```
Access the client-side portal at [http://localhost:5173](http://localhost:5173)
