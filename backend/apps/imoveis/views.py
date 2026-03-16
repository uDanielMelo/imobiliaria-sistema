from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Imovel, FotoImovel
from .serializers import ImovelSerializer, ImovelListSerializer, FotoImovelSerializer
from apps.contratos.serializers import ContratoSerializer, AnexoSerializer


class ImovelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return ImovelListSerializer
        return ImovelSerializer

    def get_queryset(self):
        return Imovel.objects.filter(
            proprietario=self.request.user,
            deleted_at__isnull=True
        ).prefetch_related('fotos')

    def perform_create(self, serializer):
        serializer.save(proprietario=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        from django.utils import timezone
        instance.deleted_at = timezone.now()
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

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

    @action(detail=True, methods=['post'], url_path='fotos')
    def upload_foto(self, request, pk=None):
        imovel = self.get_object()
        serializer = FotoImovelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(imovel=imovel)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='fotos/(?P<foto_id>[^/.]+)')
    def deletar_foto(self, request, pk=None, foto_id=None):
        imovel = self.get_object()
        try:
            foto = imovel.fotos.get(id=foto_id)
            foto.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except FotoImovel.DoesNotExist:
            return Response({'error': 'Foto não encontrada'}, status=status.HTTP_404_NOT_FOUND)