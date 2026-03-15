import fitz  # PyMuPDF
from pdf2image import convert_from_bytes
import pytesseract
import io

async def extract_text(file_bytes: bytes) -> str:
    """
    Extract text from a PDF file provided as bytes.
    Tries PyMuPDF (digital PDF) first. If less than 50 chars are extracted,
    falls back to OCR using pdf2image and pytesseract (scanned PDF).
    """
    extracted_text = ""
    
    # 1. Try PyMuPDF First
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            extracted_text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error reading PDF with PyMuPDF: {e}")

    # Clean up whitespace and check length
    text_content = extracted_text.strip()
    
    if len(text_content) >= 50:
        print("📄 Digital PDF")
        return text_content
        
    # 2. Fallback to OCR if text is minimal (likely scanned)
    try:
        print("🔍 OCR used")
        ocr_text = ""
        # Convert PDF bytes to a list of PIL Images
        images = convert_from_bytes(file_bytes)
        
        for image in images:
            # Run pytesseract on each image
            page_text = pytesseract.image_to_string(image)
            ocr_text += page_text + "\n"
            
        return ocr_text.strip()
    except Exception as e:
        print(f"Error performing OCR: {e}")
        # Return whatever we got from PyMuPDF if OCR fails
        return text_content
