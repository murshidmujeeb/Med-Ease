from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, String, func
from typing import List, Optional
import shutil
from pathlib import Path
from uuid import uuid4
from datetime import datetime

import random
from app.core.database import get_db
from app.models.all_models import Medicine, Prescription, Bill, BillItem, Pharmacist, InventoryTransaction, AuditLog, StockUpdateLog
from app.schemas.schemas import (
    ScanResponse, BillConfirmationRequest, MedicineResponse,
    StaffLoginRequest, StaffLoginResponse, StockAddRequest, 
    AnalyticsResponse, MedicineCreateRequest
)
from app.services.gemini_service import extract_medicines_from_prescription
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Helpers ---
def generate_bill_number():
    # Simple bill number generation
    year = datetime.now().year
    count = uuid4().hex[:6].upper()
    return f"BILL-{year}-{count}"

def authenticate_pharmacist_by_pin(pin: str, db: Session):
    # In a real app, use bcrypt verify. For this demo, simple check or mock.
    # We will assume a simple PIN for now as per prompt "Simple PIN-based"
    # To make it work with the seed data, we'll implement a basic check.
    # Note: PINs should be hashed. We'll handle this in the seed data.
    # PIN: 1234
    print(f"DEBUG AUTH: Checking PIN: {pin}")
    pharmacist = db.query(Pharmacist).filter(Pharmacist.pin_hash == pin, Pharmacist.is_active == True).first()
    if pharmacist:
        print(f"DEBUG AUTH: Found Pharmacist: {pharmacist.name}")
    else:
        print("DEBUG AUTH: No pharmacist found with this PIN.")
    return pharmacist

# --- Endpoints ---

@router.post("/prescriptions/scan", response_model=ScanResponse)
async def scan_prescription(
    file: UploadFile = File(...),
    is_demo: bool = Query(False),
    db: Session = Depends(get_db)
):
    # 1. Save uploaded image
    upload_dir = Path("uploads/prescriptions")
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / f"{uuid4()}.jpg"
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
        
    # 2. Call Gemini
    # Convert path to string for service
    extraction = await extract_medicines_from_prescription(str(file_path))
    
    # 3. Create prescription record
    prescription = Prescription(
        image_path=str(file_path),
        gemini_extraction_response=extraction,
        extraction_confidence=extraction.get("prescription_metadata", {}).get("overall_confidence", 0.0),
        is_readable=extraction.get("extraction_quality", {}).get("is_readable", False)
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    
    # 4. Process medicines
    medicines_with_pricing = []
    bill_subtotal = 0.0
    
    extracted_medicines = extraction.get("medicines", [])
    
    # Fetch all medicines for better matching (small dataset assumption)
    all_medicines = db.query(Medicine).filter(Medicine.is_demo == is_demo).all()
    
    extracted_medicines = extraction.get("medicines", [])
    
    for med_data in extracted_medicines:
        # Match Logic:
        # 1. Exact/Case-insensitive Generic Name
        # 2. Brand Name match (if available)
        
        extracted_generic = (med_data.get("generic_name") or "").strip().lower()
        extracted_brand = (med_data.get("brand_name") or "").strip().lower()
        
        matched_med = None
        
        # Try finding match
        for db_med in all_medicines:
            db_generic = db_med.generic_name.lower().strip()
             # Check if brand_names is a list (JSON) or string, handle safely
            db_brands = []
            if isinstance(db_med.brand_names, list):
                db_brands = [b.lower() for b in db_med.brand_names]
            elif isinstance(db_med.brand_names, str):
                 # Fallback if somehow stored as string
                 import json
                 try: 
                     db_brands = [b.lower() for b in json.loads(db_med.brand_names)]
                 except: 
                     db_brands = [db_med.brand_names.lower()]

            if extracted_generic == db_generic:
                matched_med = db_med
                break
            
            # Check if extracted generic matches a DB brand (common AI error)
            if extracted_generic in db_brands:
                matched_med = db_med
                break
                
            # Check if extracted brand matches DB brand
            if extracted_brand and extracted_brand in db_brands:
                matched_med = db_med
                break
                
            # Check if extracted brand matches DB generic (common AI error)
            if extracted_brand and extracted_brand == db_generic:
                matched_med = db_med
                break


        
        if not matched_med and is_demo:
            # AUTO-ADD to Demo Inventory
            qty = int(med_data.get("quantity_prescribed") or 1)
            initial_stock = random.randint(50, 100)
            
            new_med = Medicine(
                generic_name=extracted_generic.title(),
                brand_names=[extracted_brand.title()] if extracted_brand else [],
                strength=med_data.get("strength") or "N/A",
                form=med_data.get("form") or "Tablet",
                unit_price=random.uniform(5.0, 50.0), # Random price
                gst_rate=12.0,
                current_stock=max(0, initial_stock - qty),
                min_stock_level=10,
                is_demo=True,
                shelf_position=f"ZONE-{random.choice(['A','B','C','D'])}-{random.randint(1,20):02d}"
            )
            db.add(new_med)
            db.commit()
            db.refresh(new_med)
            matched_med = new_med
            med_data["is_seeded"] = True
        else:
            med_data["is_seeded"] = False

        item = med_data.copy()
        item["is_seeded"] = med_data.get("is_seeded", False)
        item["found_in_inventory"] = False
        item["stock_available"] = False
        item["unit_price"] = 0.0
        item["line_total"] = 0.0
        item["gst_amount"] = 0.0
        item["item_total"] = 0.0
        item["current_stock"] = 0
        
        qty = int(med_data.get("quantity_prescribed") or 1) # Default to 1 if None
        item["quantity_prescribed"] = qty

        if matched_med:
            medicine = matched_med
            item["medicine_id"] = medicine.id
            item["found_in_inventory"] = True
            item["current_stock"] = medicine.current_stock
            item["stock_available"] = medicine.current_stock >= qty
            item["unit_price"] = float(medicine.unit_price)
            
            line_total = float(medicine.unit_price) * qty
            gst_amount = line_total * (float(medicine.gst_rate) / 100.0)
            
            item["line_total"] = line_total
            item["gst_amount"] = gst_amount
            item["item_total"] = line_total + gst_amount
            
            bill_subtotal += line_total
        
        medicines_with_pricing.append(item)
        
    # 5. Totals
    total_gst = sum(m["gst_amount"] for m in medicines_with_pricing)
    final_amount = bill_subtotal + total_gst
    
    # 6. Create Bill (Pending)
    bill = Bill(
        bill_number=generate_bill_number(),
        prescription_id=prescription.id,
        patient_name=extraction.get("prescription_metadata", {}).get("patient_name"),
        patient_age=extraction.get("prescription_metadata", {}).get("patient_age"),
        subtotal=bill_subtotal,
        total_gst=total_gst,
        final_amount=final_amount,
        status="PENDING",
        is_demo=is_demo
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    
    # 7. Create Items (only for found ones? or all? Prompt says "Flag extractions... for manual review")
    # We will save all, but non-inventory ones might fail FK constraints if we enforce medicine_id.
    # The requirement says "Medicine not in database - flag for manual entry".
    # Since our DB schema forces medicine_id, we can't save non-existent medicines to bill_items yet.
    # In a real app we'd have a temporary items table or allow null medicine_id.
    # For this build, we will only save FOUND items to the DB, but return ALL to the UI.
    # The UI will likely need to "Add to Inventory" or map to existing before confirming.
    
    for m in medicines_with_pricing:
        if m["found_in_inventory"]:
             bill_item = BillItem(
                bill_id=bill.id,
                medicine_id=m["medicine_id"],
                quantity=m["quantity_prescribed"],
                unit_price=m["unit_price"],
                line_total=m["line_total"],
                gst_amount=m["gst_amount"],
                item_total=m["item_total"],
                dosage_frequency=m.get("frequency"),
                dosage_duration=m.get("duration"),
            )
             db.add(bill_item)
    db.commit()
    
    return {
        "status": "PENDING_CONFIRMATION",
        "bill_id": bill.id,
        "bill_number": bill.bill_number,
        "extraction_confidence": float(prescription.extraction_confidence or 0),
        "medicines": medicines_with_pricing,
        "subtotal": bill_subtotal,
        "total_gst": total_gst,
        "final_amount": final_amount,
        "patient_name": extraction.get("prescription_metadata", {}).get("patient_name"),
        "patient_age": extraction.get("prescription_metadata", {}).get("patient_age"),
        "doctor_notes": extraction.get("prescription_metadata", {}).get("doctor_notes"),
        "clinical_analysis": extraction.get("clinical_analysis"),
        "warnings": [m for m in medicines_with_pricing if not m["found_in_inventory"] or not m["stock_available"]]
    }

@router.post("/staff/login", response_model=StaffLoginResponse)
async def staff_login(request: StaffLoginRequest, db: Session = Depends(get_db)):
    pharmacist = authenticate_pharmacist_by_pin(request.pin, db)
    if not pharmacist:
        raise HTTPException(status_code=401, detail="Invalid Pharmacist PIN")
    return {
        "status": "success",
        "pharmacist_id": pharmacist.id,
        "name": pharmacist.name
    }

@router.post("/inventory/stock")
async def add_stock(request: StockAddRequest, db: Session = Depends(get_db)):
    pharmacist = authenticate_pharmacist_by_pin(request.pharmacist_pin, db)
    if not pharmacist:
        raise HTTPException(status_code=401, detail="Invalid Pharmacist PIN")
    
    medicine = db.query(Medicine).filter(Medicine.id == request.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    stock_before = medicine.current_stock
    medicine.current_stock += request.quantity_added
    if request.shelf_position:
        medicine.shelf_position = request.shelf_position
    
    # Log the update
    log = StockUpdateLog(
        medicine_id=medicine.id,
        pharmacist_id=pharmacist.id,
        quantity_added=request.quantity_added,
        stock_before=stock_before,
        stock_after=medicine.current_stock,
        notes=request.notes
    )
    db.add(log)
    db.commit()
    
    return {"status": "success", "new_stock": medicine.current_stock}

@router.post("/inventory/register")
async def register_medicine(request: MedicineCreateRequest, db: Session = Depends(get_db)):
    pharmacist = authenticate_pharmacist_by_pin(request.pharmacist_pin, db)
    if not pharmacist:
        raise HTTPException(status_code=401, detail="Invalid Pharmacist PIN")
        
    # Check if generic_name already exists in Live inventory (is_demo=False)
    existing = db.query(Medicine).filter(
        Medicine.generic_name.ilike(request.generic_name),
        Medicine.is_demo == False
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Medicine '{request.generic_name}' already exists in inventory.")
        
    new_medicine = Medicine(
        generic_name=request.generic_name,
        brand_names=request.brand_names,
        strength=request.strength,
        form=request.form,
        unit_price=request.unit_price,
        gst_rate=request.gst_rate,
        min_stock_level=request.min_stock_level,
        current_stock=request.initial_stock,
        shelf_position=request.shelf_position,
        is_demo=False,
        is_active=True
    )
    
    db.add(new_medicine)
    db.flush() # Get the ID
    
    # Log the initial stock as an entry
    if request.initial_stock > 0:
        log = StockUpdateLog(
            medicine_id=new_medicine.id,
            pharmacist_id=pharmacist.id,
            quantity_added=request.initial_stock,
            stock_before=0,
            stock_after=request.initial_stock,
            notes="Initial stock during registration"
        )
        db.add(log)
        
    db.commit()
    
    return {
        "status": "success", 
        "medicine_id": new_medicine.id,
        "message": f"Successfully registered {request.generic_name}"
    }

@router.get("/inventory/logs")
def get_inventory_logs(db: Session = Depends(get_db)):
    logs = db.query(StockUpdateLog).order_by(StockUpdateLog.created_at.desc()).limit(50).all()
    res = []
    for log in logs:
        med = db.query(Medicine).filter(Medicine.id == log.medicine_id).first()
        ph = db.query(Pharmacist).filter(Pharmacist.id == log.pharmacist_id).first() if log.pharmacist_id else None
        res.append({
            "id": log.id,
            "medicine_name": med.generic_name if med else "Unknown",
            "pharmacist_name": ph.name if ph else "Admin",
            "quantity_added": log.quantity_added,
            "stock_before": log.stock_before,
            "stock_after": log.stock_after,
            "notes": log.notes,
            "created_at": log.created_at
        })
    return res

@router.get("/inventory/analytics", response_model=AnalyticsResponse)
def get_inventory_analytics(is_demo: bool = Query(False), db: Session = Depends(get_db)):
    # Total Revenue & Sales for current month
    # For demo, we might want to look at Feb 2026 specifically if that's what we seeded
    from sqlalchemy import func
    
    # Calculate stats based on is_demo
    confirmed_bills = db.query(Bill).filter(Bill.status == "CONFIRMED", Bill.is_demo == is_demo)
    
    total_rev = db.query(func.sum(Bill.final_amount)).filter(Bill.status == "CONFIRMED", Bill.is_demo == is_demo).scalar() or 0
    total_items = db.query(func.sum(BillItem.quantity)).join(Bill).filter(Bill.status == "CONFIRMED", Bill.is_demo == is_demo).scalar() or 0
    
    low_stock = db.query(Medicine).filter(Medicine.current_stock < Medicine.min_stock_level, Medicine.is_demo == is_demo).count()
    active_meds = db.query(Medicine).filter(Medicine.is_active == True, Medicine.is_demo == is_demo).count()
    
    # Sales over time (group by day)
    # Using func.date(Bill.created_at) which works in SQLite/Postgres
    sales_query = db.query(
        func.date(Bill.created_at).label('date'),
        func.sum(Bill.final_amount).label('sales'),
        func.count(Bill.id).label('items_sold')
    ).filter(Bill.status == "CONFIRMED", Bill.is_demo == is_demo)\
     .group_by(func.date(Bill.created_at))\
     .order_by(func.date(Bill.created_at))\
     .all()
    
    sales_over_time = []
    for s in sales_query:
        # Use getattr or safeguard against None
        sales_over_time.append({
            "date": str(s.date) if s.date else "Unknown",
            "sales": float(s.sales or 0),
            "items_sold": int(s.items_sold or 0)
        })
        
    # If empty, add dummy
    if not sales_over_time:
        sales_over_time = [{"date": "2026-03-16", "sales": 0, "items_sold": 0}]
    
    # Category distribution (mocked categories as we don't have a category field yet, 
    # but we can group by common prefixes or generic names)
    category_dist = [
        {"category": "Antibiotics", "count": 25},
        {"category": "Analgesics", "count": 40},
        {"category": "Cardiac", "count": 10},
        {"category": "Others", "count": 25},
    ]
    
    return {
        "total_sales_month": float(total_rev),
        "total_items_sold_month": int(total_items),
        "low_stock_count": low_stock,
        "active_medicines_count": active_meds,
        "sales_over_time": sales_over_time,
        "category_distribution": category_dist
    }

@router.post("/bills/{bill_id}/confirm")
async def confirm_bill(
    bill_id: str,
    request: BillConfirmationRequest,
    db: Session = Depends(get_db)
):
    pharmacist = authenticate_pharmacist_by_pin(request.pharmacist_pin, db)
    if not pharmacist:
        raise HTTPException(status_code=401, detail="Invalid Pharmacist PIN")
        
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    if bill.status != "PENDING":
        return {"status": "success", "bill_number": bill.bill_number, "message": "Already processed"}
        
    # Verify stock again
    items = db.query(BillItem).filter(BillItem.bill_id == bill_id).all()
    for item in items:
        med = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if med.current_stock < item.quantity:
             raise HTTPException(status_code=400, detail=f"Insufficient stock for {med.generic_name}")
             
    # Process
    bill.status = "CONFIRMED"
    bill.confirmed_by = pharmacist.id
    bill.confirmation_notes = request.notes
    
    # Update patient details if provided (capturing any frontend edits)
    if request.patient_name:
        bill.patient_name = request.patient_name
    if request.patient_age:
        try:
            bill.patient_age = int(request.patient_age)
        except:
            pass
    
    for item in items:
        med = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        
        # Transaction
        tx = InventoryTransaction(
            medicine_id=med.id,
            transaction_type="DISPENSED",
            quantity_change=-item.quantity,
            stock_before=med.current_stock,
            stock_after=med.current_stock - item.quantity,
            bill_id=bill.id,
            performed_by=pharmacist.id
        )
        db.add(tx)
        
        # Update stock
        med.current_stock -= item.quantity

        # Create Stock History Log (Sales)
        stock_log = StockUpdateLog(
            medicine_id=med.id,
            pharmacist_id=pharmacist.id,
            quantity_added=-item.quantity, # Negative to show reduction
            stock_before=tx.stock_before,
            stock_after=tx.stock_after,
            notes=f"Sales - Bill #{bill.bill_number}"
        )
        db.add(stock_log)
        
    # Audit
    audit = AuditLog(
        pharmacist_id=pharmacist.id,
        action="BILL_CONFIRMED",
        resource_type="BILL",
        resource_id=bill.id,
        changes={"status": "CONFIRMED"}
    )
    db.add(audit)
    
    db.commit()
    
    return {"status": "success", "bill_number": bill.bill_number}

@router.get("/bills")
def get_bills(
    is_demo: bool = Query(False),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    bills = db.query(Bill).filter(Bill.is_demo == is_demo)\
        .order_by(Bill.created_at.desc()).limit(limit).all()
    
    res = []
    for b in bills:
        items = db.query(BillItem).filter(BillItem.bill_id == b.id).all()
        res.append({
            "id": b.id,
            "bill_number": b.bill_number,
            "patient_name": b.patient_name,
            "patient_age": b.patient_age,
            "subtotal": float(b.subtotal),
            "total_gst": float(b.total_gst),
            "final_amount": float(b.final_amount),
            "status": b.status,
            "items_count": len(items),
            "created_at": b.created_at
        })
    return res

@router.get("/inventory", response_model=dict)
def get_inventory(
    search: Optional[str] = None, 
    low_stock_only: bool = False,
    is_demo: bool = Query(False),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Medicine).filter(Medicine.is_demo == is_demo)
        
        if low_stock_only:
            query = query.filter(Medicine.current_stock < Medicine.min_stock_level)
            
        if search:
            search_term = f"%{search}%"
            # More compatible search for brand_names if it's JSON
            query = query.filter(
                or_(
                    Medicine.generic_name.ilike(search_term),
                    Medicine.brand_names.cast(String).ilike(search_term)
                )
            )
            
        medicines = query.all()
        
        res_list = []
        for m in medicines:
            # Handle brand_names correctly if it's a string/json
            brand_names = m.brand_names
            if isinstance(brand_names, str):
                import json
                try:
                    brand_names = json.loads(brand_names)
                except:
                    brand_names = [brand_names]

            res_list.append({
                "id": m.id,
                "generic_name": m.generic_name,
                "brand_names": brand_names,
                "strength": m.strength,
                "current_stock": m.current_stock,
                "min_stock_level": m.min_stock_level,
                "unit_price": float(m.unit_price),
                "shelf_position": m.shelf_position,
                "stock_status": "LOW" if m.current_stock < m.min_stock_level else "OK"
            })
            
        return {"medicines": res_list}
    except Exception as e:
        logger.exception("Error fetching inventory")
        raise HTTPException(status_code=500, detail=str(e))
