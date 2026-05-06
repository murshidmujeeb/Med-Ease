import sys
import os
from sqlalchemy.orm import Session

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from app.core.database import SessionLocal, engine
from app.models.all_models import Base, Medicine, Pharmacist
from app.data.medicines_data import MEDICINES_DATA
import uuid

def seed_big_pharma():
    db = SessionLocal()
    try:
        print("SEEDING BIG PHARMACY DATABASE...")
        print(f"Preparing to add {len(MEDICINES_DATA)} medicines...")

        count_added = 0
        count_skipped = 0

        for med_data in MEDICINES_DATA:
            # Check if exists
            exists = db.query(Medicine).filter(Medicine.generic_name == med_data["generic_name"]).first()
            if exists:
                print(f"Skipping {med_data['generic_name']} (Already Exists)")
                count_skipped += 1
                continue
            
            # Add new medicine
            new_med = Medicine(
                id=str(uuid.uuid4()),
                generic_name=med_data["generic_name"],
                brand_names=med_data["brand_names"],  # Handles list->JSON automatically
                strength=med_data["strength"],
                form=med_data["form"],
                unit_price=med_data["unit_price"],
                gst_rate=12.0 if med_data["category"] == "Supplement" else 5.0, # Simple logic
                current_stock=1000, # Large stock for big pharma
                min_stock_level=50,
                reorder_quantity=200,
                manufacturer="Generic Pharma Co",
                is_active=True,
                is_demo=True,
                shelf_position=f"Rack {med_data['category'][0]}-{count_added % 10 + 1}"
            )
            db.add(new_med)
            count_added += 1

        db.commit()
        print("------------------------------------------------")
        print(f"SUCCESS: Added {count_added} new medicines.")
        print(f"SKIPPED: {count_skipped} existing medicines.")
        print("------------------------------------------------")
        print("Database is now huge!")

    except Exception as e:
        print(f"ERROR SEEDING DATA: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_big_pharma()
