import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, DECIMAL, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    generic_name = Column(String, unique=True, nullable=False)
    brand_names = Column(JSON, default=[])
    strength = Column(String, nullable=False)
    form = Column(String, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    gst_rate = Column(DECIMAL(5, 2), default=5.0)
    min_stock_level = Column(Integer, default=10)
    current_stock = Column(Integer, default=0, nullable=False)
    reorder_quantity = Column(Integer, default=50)
    expiry_date = Column(DateTime, nullable=True)
    manufacturer = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    shelf_position = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    image_path = Column(String, nullable=False)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    gemini_extraction_response = Column(JSON, nullable=False)
    extraction_confidence = Column(DECIMAL(3, 2))
    is_readable = Column(Boolean)
    status = Column(String, default='EXTRACTED') # EXTRACTED, PROCESSED, ERROR
    created_at = Column(DateTime, default=datetime.utcnow)

class Pharmacist(Base):
    __tablename__ = "pharmacists"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    pin_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # login_attempts and last_login were missing in original paste but existed in SQL. 
    # Adding for completeness based on SQL schema if needed, or sticking to existing Python model.
    # Sticking to existing for now to minimize diff risk.

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    bill_number = Column(String, unique=True, nullable=False)
    prescription_id = Column(String, ForeignKey("prescriptions.id"), nullable=True)
    patient_name = Column(String, nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_phone = Column(String, nullable=True)
    subtotal = Column(DECIMAL(12, 2), nullable=False)
    total_gst = Column(DECIMAL(12, 2), nullable=False)
    final_amount = Column(DECIMAL(12, 2), nullable=False)
    status = Column(String, default="PENDING") # PENDING, CONFIRMED
    confirmed_by = Column(String, ForeignKey("pharmacists.id"), nullable=True)
    confirmation_notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("BillItem", back_populates="bill")

class BillItem(Base):
    __tablename__ = "bill_items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    bill_id = Column(String, ForeignKey("bills.id"), nullable=False)
    medicine_id = Column(String, ForeignKey("medicines.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    line_total = Column(DECIMAL(12, 2), nullable=False)
    gst_amount = Column(DECIMAL(10, 2), nullable=False)
    item_total = Column(DECIMAL(12, 2), nullable=False)
    dosage_frequency = Column(String, nullable=True)
    dosage_duration = Column(String, nullable=True)
    
    bill = relationship("Bill", back_populates="items")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    medicine_id = Column(String, ForeignKey("medicines.id"), nullable=False)
    transaction_type = Column(String, nullable=False)
    quantity_change = Column(Integer, nullable=False)
    stock_before = Column(Integer, nullable=False)
    stock_after = Column(Integer, nullable=False)
    bill_id = Column(String, ForeignKey("bills.id"), nullable=True)
    performed_by = Column(String, ForeignKey("pharmacists.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    pharmacist_id = Column(String, ForeignKey("pharmacists.id"), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String)
    resource_id = Column(String)
    changes = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class StockUpdateLog(Base):
    __tablename__ = "stock_update_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    medicine_id = Column(String, ForeignKey("medicines.id"), nullable=False)
    pharmacist_id = Column(String, ForeignKey("pharmacists.id"), nullable=True)
    quantity_added = Column(Integer, nullable=False)
    stock_before = Column(Integer, nullable=False)
    stock_after = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
