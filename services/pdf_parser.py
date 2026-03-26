import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file provided as bytes.
    Adds page markers like '=== PAGE X ===' before each page's text.
    """
    try:
        # Open the PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        full_text = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            
            # Add page marker and text
            full_text.append(f"=== PAGE {page_num + 1} ===")
            full_text.append(text)

        doc.close()
        return "\n".join(full_text)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_pages_from_pdf(file_bytes: bytes) -> list:
    """
    Extracts each page as a separate string.
    Skips pages that are empty or have < 50 characters.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for i in range(len(doc)):
            text = doc[i].get_text().strip()
            if len(text) > 50:
                pages.append(text)
        doc.close()
        return pages
    except Exception as e:
        print(f"Error extracting pages from PDF: {e}")
        return []
