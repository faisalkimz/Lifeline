from rest_framework.routers import DefaultRouter
from .views import AssetCategoryViewSet, AssetViewSet, AssetAssignmentViewSet

router = DefaultRouter()
router.register(r'categories', AssetCategoryViewSet, basename='asset-category')
router.register(r'items', AssetViewSet, basename='asset')
router.register(r'assignments', AssetAssignmentViewSet, basename='asset-assignment')

urlpatterns = router.urls
