from rest_framework import serializers
from .models import Contrato, Pagamento, Anexo, Mensagem
from apps.imoveis.serializers import ImovelSerializer
from apps.inquilinos.serializers import InquilinoSerializer


class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        fields = [
            'id', 'contrato', 'value', 'due_date',
            'payment_date', 'status', 'observacoes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnexoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anexo
        fields = [
            'id', 'nome', 'tipo', 'arquivo', 'tamanho',
            'imovel', 'contrato', 'uploaded_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'tamanho', 'created_at', 'updated_at']


class MensagemSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source='autor.get_full_name', read_only=True)

    class Meta:
        model = Mensagem
        fields = ['id', 'contrato', 'autor', 'autor_nome', 'texto', 'lida', 'created_at']
        read_only_fields = ['id', 'autor', 'created_at']


class ContratoSerializer(serializers.ModelSerializer):
    imovel_detalhes = ImovelSerializer(source='imovel', read_only=True)
    inquilino_detalhes = InquilinoSerializer(source='inquilino', read_only=True)
    pagamentos = PagamentoSerializer(many=True, read_only=True)
    total_pagamentos = serializers.SerializerMethodField()
    pagamentos_atrasados = serializers.SerializerMethodField()

    class Meta:
        model = Contrato
        fields = [
            'id', 'imovel', 'imovel_detalhes',
            'inquilino', 'inquilino_detalhes',
            'proprietario', 'start_date', 'end_date',
            'value', 'due_day', 'status', 'observacoes',
            'pagamentos', 'total_pagamentos', 'pagamentos_atrasados',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'proprietario', 'created_at', 'updated_at']

    def get_total_pagamentos(self, obj):
        return obj.pagamentos.count()

    def get_pagamentos_atrasados(self, obj):
        return obj.pagamentos.filter(status='atrasado').count()