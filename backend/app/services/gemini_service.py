import google.generativeai as genai
import json
import base64
from pathlib import Path
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_API_KEY)

VISION_PROMPT = """
You are a pharmaceutical data extraction specialist. Analyze this prescription image and extract ALL medicines, dosages, frequencies, and patient details. Return ONLY valid JSON.
    Analyze this prescription image and extract medicine details into a strict JSON format.
    
    CRITICAL RULES:
    1. **Single Medicine per Entry**: If a line lists multiple distinct medicines (separate pills/syrups), split them into separate JSON objects.
    2. **Combination Drugs**: If a medicine is a combination (e.g., "Telmisartan + Amlodipine"), treat it as ONE medicine. Use the Brand Name as the primary identifier if visible.
    3. **Clean Names**: In 'generic_name', do not list every single ingredient if it makes the name too long. Use the main ingredient or the class (e.g., "Multivitamin" instead of listing all 20 vitamins).
    4. **No Branding**: Do not include any text like "Scanned by AI" or "Gemini" in the output.
    5. **Strict JSON**: Output ONLY the JSON object. No markdown formatting (```json).
    
    Required JSON Structure:
    {
        "prescription_metadata": {
            "patient_name": "string or null",
            "patient_age": "number or null",
            "prescriber_name": "string or null",
            "prescription_date": "YYYY-MM-DD or null",
            "doctor_notes": "string (Any additional notes, diagnosis, or advice like 'Drink water', 'Review after 3 days') or null",
            "overall_confidence": "number (0-1)"
        },
        "clinical_analysis": {
            "inferred_diagnosis": "string (Infer the likely condition based on the medicines, e.g. 'Hypertension', 'Respiratory Infection', 'Diabetes')",
            "patient_advice": "string (Simple, non-technical advice for the patient. e.g. 'Complete the full course', 'Take after meals', 'May cause drowsiness')",
            "pharmacist_notes": "string (Technical notes for the pharmacist, potential interactions or dosage warnings)"
        },
        "medicines": [
            {
                "generic_name": "string (Main Ingredient)",
                "brand_name": "string or null",
                "strength": "string (e.g. 500mg) or null",
                "form": "Tablet/Syrup/Injection etc.",
                "quantity_prescribed": "number (integer only, default 1)",
                "frequency": "string (e.g. 1-0-1 or BID)",
                "duration": "string (e.g. 5 days)",
                "special_instructions": "string or null"
            }
        ],
        "extraction_quality": {
            "is_readable": boolean,
            "missing_fields": ["list of missing important fields"],
            "overall_suggestion": "string"
        }
    }
    """

async def extract_medicines_from_prescription(image_path: str) -> dict:
    try:
        # Using generic alias 'gemini-flash-latest' which maps to the current stable Flash model
        # If this fails with 429, the user MUST enable billing on their Google Cloud Project.
        model = genai.GenerativeModel('gemini-flash-latest') 
        
        print(f"Processing image: {image_path}")
        
        # Load image
        if not Path(image_path).exists():
             raise FileNotFoundError(f"Image not found at {image_path}")
             
        with open(image_path, "rb") as f:
            image_data = f.read()
            
        parts = [
            {"mime_type": "image/jpeg", "data": image_data},
            {"text": VISION_PROMPT}
        ]
        
        print("Sending request to Gemini...")
        response = model.generate_content(parts)
        print(f"Gemini Raw Response: {response.text}")
        
        # Clean response text (remove markdown code blocks if any)
        text = response.text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(text)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Gemini Extraction Error: {e}")
        # Return a fallback/error structure
        return {
            "prescription_metadata": {},
            "medicines": [],
            "extraction_quality": {
                "is_readable": False, 
                "error": str(e)
            }
        }
