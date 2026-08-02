# backend/app/services/pdf_parser.py
from pypdf import PdfReader
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text content from uploaded PDF file bytes."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""