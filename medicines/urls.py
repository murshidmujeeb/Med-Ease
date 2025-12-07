from rest_framework.routers import DefaultRouter
from .views import (
    MedicineViewSet,
    InventoryBatchViewSet,
    InventoryTransactionViewSet,
)

router = DefaultRouter()
router.register(r"medicines", MedicineViewSet)
router.register(r"batches", InventoryBatchViewSet)
router.register(r"transactions", InventoryTransactionViewSet)

urlpatterns = router.urls
