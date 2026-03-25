import fitz  # PyMuPDF
from pdf2image import convert_from_bytes
import pytesseract
pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"
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
        print("📄 Digital PDF extracted")
        return text_content
        
    # 2. Fallback to OCR if text is minimal (likely scanned)
    try:
        ocr_text = ""
        # Convert PDF bytes to a list of PIL Images at 300 DPI
        images = convert_from_bytes(file_bytes, dpi=300)
        
        print(f"🔍 OCR fallback used — {len(images)} pages")
        
        for image in images:
            # Run pytesseract on each image using PSM 6 for better accuracy
            page_text = pytesseract.image_to_string(image, config="--psm 6")
            ocr_text += page_text + "\n"
            
        print("OCR TEXT:", ocr_text[:1000])
        return ocr_text.strip()
    except Exception as e:
        print(f"Error performing OCR: {e}")
        # Return whatever we got from PyMuPDF if OCR fails
        return text_content
