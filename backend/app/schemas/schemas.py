from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

# Bill/Prescription Schemas
class MedicineExtraction(BaseModel):
    generic_name: str
    brand_name: Optional[str] = None
    strength: Optional[str] = None
    form: Optional[str] = None
    quantity_prescribed: Optional[int] = 1
    frequency: Optional[str] = None
    duration: Optional[str] = None
    special_instructions: Optional[str] = None
    extraction_confidence: Optional[float] = 0.0

class PrescriptionMetadata(BaseModel):
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    prescriber_name: Optional[str] = None
    prescription_date: Optional[str] = None
    doctor_notes: Optional[str] = None
    overall_confidence: Optional[float] = None

class ExtractionQuality(BaseModel):
    is_readable: bool
    missing_fields: List[str] = []
    overall_suggestion: Optional[str] = None
    error: Optional[str] = None

class ClinicalAnalysis(BaseModel):
    inferred_diagnosis: Optional[str] = None
    patient_advice: Optional[str] = None
    pharmacist_notes: Optional[str] = None

class GeminiResponse(BaseModel):
    prescription_metadata: PrescriptionMetadata
    clinical_analysis: Optional[ClinicalAnalysis] = None
    medicines: List[MedicineExtraction]
    extraction_quality: ExtractionQuality

# API Response Schemas
class MedicinePriceCheck(MedicineExtraction):
    medicine_id: Optional[str] = None
    found_in_inventory: bool
    unit_price: Optional[float] = None
    line_total: Optional[float] = None
    gst_amount: Optional[float] = None
    item_total: Optional[float] = None
    stock_available: bool = False
    current_stock: int = 0

class ScanResponse(BaseModel):
    status: str
    bill_id: str
    bill_number: str
    extraction_confidence: float
    medicines: List[MedicinePriceCheck]
    subtotal: float
    total_gst: float
    final_amount: float
    doctor_notes: Optional[str] = None
    clinical_analysis: Optional[ClinicalAnalysis] = None
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    warnings: List[dict]

class BillConfirmationRequest(BaseModel):
    pharmacist_pin: str
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    notes: Optional[str] = None

class MedicineResponse(BaseModel):
    id: str
    generic_name: str
    brand_names: Optional[List[str]] = []
    strength: str
    current_stock: int
    min_stock_level: int
    unit_price: float
    shelf_position: Optional[str] = None
    stock_status: str

# Staff & Inventory Schemas
class StaffLoginRequest(BaseModel):
    pin: str

class StaffLoginResponse(BaseModel):
    status: str
    pharmacist_id: str
    name: str

class StockAddRequest(BaseModel):
    medicine_id: str
    pharmacist_pin: str
    quantity_added: int
    shelf_position: Optional[str] = None
    notes: Optional[str] = None

class MedicineCreateRequest(BaseModel):
    generic_name: str
    brand_names: List[str] = []
    strength: str
    form: str
    unit_price: float
    gst_rate: float = 5.0
    min_stock_level: int = 10
    shelf_position: Optional[str] = None
    initial_stock: int = 0
    pharmacist_pin: str

class AnalyticsTimeSeries(BaseModel):
    date: str
    sales: float
    items_sold: int

class AnalyticsCategoryDist(BaseModel):
    category: str
    count: int

class AnalyticsResponse(BaseModel):
    total_sales_month: float
    total_items_sold_month: int
    low_stock_count: int
    active_medicines_count: int
    sales_over_time: List[AnalyticsTimeSeries]
    category_distribution: List[AnalyticsCategoryDist]
