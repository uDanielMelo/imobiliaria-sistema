from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from dateutil.relativedelta import relativedelta
from datetime import date
from .models import Contrato, Pagamento, Anexo
from .serializers import ContratoSerializer, PagamentoSerializer, AnexoSerializer


class ContratoViewSet(viewsets.ModelViewSet):
    serializer_class = ContratoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contrato.objects.filter(
            proprietario=self.request.user,
            deleted_at__isnull=True
        )

    def perform_create(self, serializer):
        contrato = serializer.save(proprietario=self.request.user)
        self._gerar_pagamentos(contrato)
        contrato.imovel.status = 'alugado'
        contrato.imovel.save()

    def _gerar_pagamentos(self, contrato):
        pagamentos = []
        data_atual = contrato.start_date.replace(day=contrato.due_day)
        while data_atual <= contrato.end_date:
            pagamentos.append(Pagamento(
                contrato=contrato,
                value=contrato.value,
                due_date=data_atual,
                status='pendente'
            ))
            data_atual += relativedelta(months=1)
        Pagamento.objects.bulk_create(pagamentos)


class PagamentoViewSet(viewsets.ModelViewSet):
    serializer_class = PagamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Pagamento.objects.filter(
            contrato__proprietario=self.request.user,
            deleted_at__isnull=True
        ).order_by('due_date')

    @action(detail=False, methods=['get'])
    def vencimentos(self, request):
        hoje = date.today()
        pagamentos = self.get_queryset().filter(
            status__in=['pendente', 'atrasado']
        ).order_by('due_date')[:20]
        serializer = self.get_serializer(pagamentos, many=True)
        return Response(serializer.data)


class AnexoViewSet(viewsets.ModelViewSet):
    serializer_class = AnexoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Anexo.objects.filter(
            uploaded_by=self.request.user,
            deleted_at__isnull=True
        )

    def perform_create(self, serializer):
        arquivo = self.request.FILES.get('arquivo')
        tamanho = arquivo.size if arquivo else None
        serializer.save(uploaded_by=self.request.user, tamanho=tamanho)