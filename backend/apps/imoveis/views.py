from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Imovel
from .serializers import ImovelSerializer
from apps.contratos.serializers import ContratoSerializer, AnexoSerializer


class ImovelViewSet(viewsets.ModelViewSet):
    serializer_class = ImovelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Imovel.objects.filter(
            proprietario=self.request.user,
            deleted_at__isnull=True
        )

    def perform_create(self, serializer):
        serializer.save(proprietario=self.request.user)

    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        imovel = self.get_object()
        contratos = imovel.contratos.all().order_by('-start_date')
        serializer = ContratoSerializer(contratos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def anexos(self, request, pk=None):
        imovel = self.get_object()
        anexos = imovel.anexos.filter(deleted_at__isnull=True)
        serializer = AnexoSerializer(anexos, many=True)
        return Response(serializer.data)