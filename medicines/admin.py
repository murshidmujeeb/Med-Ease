from django.contrib import admin

from .models import Medicine, InventoryBatch, InventoryTransaction


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ("name", "generic_name", "dosage_form", "strength", "is_active")
    search_fields = ("name", "generic_name", "brand_name")


@admin.register(InventoryBatch)
class InventoryBatchAdmin(admin.ModelAdmin):
    list_display = ("medicine", "batch_number", "expiry_date", "current_quantity", "is_active")
    list_filter = ("medicine", "expiry_date", "is_active")
    search_fields = ("batch_number",)


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ("medicine", "batch", "transaction_type", "quantity_change", "created_at")
    list_filter = ("transaction_type", "created_at")
    search_fields = ("batch__batch_number", "medicine__name")
