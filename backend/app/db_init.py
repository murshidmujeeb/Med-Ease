from app.core.database import SessionLocal, engine, Base
from app.models.all_models import Medicine, Pharmacist
from sqlalchemy.orm import Session

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if data exists
    if db.query(Medicine).first():
        print("Data already exists.")
        return

    print("Seeding medicines...")
    meds = [
        Medicine(
            generic_name="Paracetamol",
            brand_names=["Crocin", "Dolo"],
            strength="500mg",
            form="tablet",
            unit_price=2.50,
            gst_rate=5.0,
            current_stock=150,
            min_stock_level=10,
            is_demo=True,
            shelf_position="A-1-12"
        ),
        Medicine(
            generic_name="Aspirin",
            brand_names=["Disprin"],
            strength="75mg",
            form="tablet",
            unit_price=0.75,
            gst_rate=5.0,
            current_stock=200,
            min_stock_level=20,
            is_demo=True,
            shelf_position="B-2-05"
        ),
        Medicine(
            generic_name="Amoxicillin",
            brand_names=["Mox"],
            strength="500mg",
            form="capsule",
            unit_price=10.00,
            gst_rate=12.0,
            current_stock=5, # LOW STOCK
            min_stock_level=20,
            is_demo=True,
            shelf_position="C-1-08"
        ),
        Medicine(
            generic_name="Metformin",
            brand_names=["Glycomet"],
            strength="500mg",
            form="tablet",
            unit_price=3.00,
            gst_rate=5.0,
            current_stock=100,
            min_stock_level=10,
            is_demo=True,
            shelf_position="D-3-02"
        ),
        Medicine(
            generic_name="Atorvastatin",
            brand_names=["Lipitor"],
            strength="10mg",
            form="tablet",
            unit_price=15.00,
            gst_rate=12.0,
            current_stock=80,
            min_stock_level=15
        )
    ]
    db.add_all(meds)
    
    print("Seeding pharmacists...")
    # PIN: 1234
    admin = Pharmacist(
        name="Admin Pharmacist",
        license_number="PHARM-001",
        pin_hash="1234", 
        is_active=True
    )
    db.add(admin)
    
    db.commit()
    db.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
