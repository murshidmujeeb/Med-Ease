from rest_framework import viewsets
from .models import Medicine, InventoryBatch, InventoryTransaction
from .serializers import (
    MedicineSerializer,
    InventoryBatchSerializer,
    InventoryTransactionSerializer,
)


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer


class InventoryBatchViewSet(viewsets.ModelViewSet):
    queryset = InventoryBatch.objects.select_related("medicine")
    serializer_class = InventoryBatchSerializer


class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryTransaction.objects.select_related("batch", "medicine")
    serializer_class = InventoryTransactionSerializer
