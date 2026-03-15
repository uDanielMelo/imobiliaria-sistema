from rest_framework import viewsets, permissions
from .models import Inquilino
from .serializers import InquilinoSerializer


class InquilinoViewSet(viewsets.ModelViewSet):
    serializer_class = InquilinoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inquilino.objects.filter(deleted_at__isnull=True)