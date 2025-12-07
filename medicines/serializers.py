from rest_framework import serializers
from .models import Medicine, InventoryBatch, InventoryTransaction


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class InventoryBatchSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name", read_only=True)

    class Meta:
        model = InventoryBatch
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "current_quantity",
        )


class InventoryTransactionSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name", read_only=True)
    batch_number = serializers.CharField(source="batch.batch_number", read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "medicine",
            "batch",
            "quantity_change",
            "transaction_type",
            "related_order",
            "created_by",
        )
