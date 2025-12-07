from django.db import models
from django.conf import settings

from core.models import TimeStampedModel


class Medicine(TimeStampedModel):
    """
    Master data for each medicine/product.
    """
    name = models.CharField(max_length=255)  # e.g. "Paracetamol 500mg Tablet"
    generic_name = models.CharField(max_length=255, blank=True)
    brand_name = models.CharField(max_length=255, blank=True)
    strength = models.CharField(max_length=100, blank=True)       # e.g. "500mg"
    dosage_form = models.CharField(max_length=100, blank=True)    # e.g. "Tablet"
    pack_size = models.CharField(max_length=100, blank=True)      # e.g. "10 tablets"
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["generic_name"]),
        ]
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class InventoryBatch(TimeStampedModel):
    """
    Represents a single batch of a medicine in stock.
    """
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name="batches",
    )
    batch_number = models.CharField(max_length=100)  # e.g. "ABC123"
    expiry_date = models.DateField()
    current_quantity = models.PositiveIntegerField(default=0)  # units in stock
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # per unit
    mrp = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # per unit
    location = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("medicine", "batch_number")
        ordering = ["expiry_date"]

    def __str__(self) -> str:
        return f"{self.medicine.name} - {self.batch_number}"


class InventoryTransaction(TimeStampedModel):
    """
    Immutable log of every change in batch quantity.
    """
    class TransactionType(models.TextChoices):
        INITIAL = "INITIAL", "Initial Stock"
        PURCHASE = "PURCHASE", "Purchase"
        SALE = "SALE", "Sale"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"

    batch = models.ForeignKey(
        InventoryBatch,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    # denormalized for convenience; always equals batch.medicine
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name="inventory_transactions",
    )
    quantity_change = models.IntegerField()  # +ve or -ve
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
    )
    note = models.TextField(blank=True)
    """
    # these will be wired later once orders & users exist
    related_order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_transactions",
    )"""
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_transactions",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.transaction_type} {self.quantity_change} for {self.batch}"
