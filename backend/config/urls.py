from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.imoveis.views import ImovelViewSet
from apps.inquilinos.views import InquilinoViewSet
from apps.contratos.views import ContratoViewSet, PagamentoViewSet, AnexoViewSet

router = DefaultRouter()
router.register(r'imoveis', ImovelViewSet, basename='imoveis')
router.register(r'inquilinos', InquilinoViewSet, basename='inquilinos')
router.register(r'contratos', ContratoViewSet, basename='contratos')
router.register(r'pagamentos', PagamentoViewSet, basename='pagamentos')
router.register(r'anexos', AnexoViewSet, basename='anexos')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
