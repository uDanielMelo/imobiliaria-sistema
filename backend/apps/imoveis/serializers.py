from rest_framework import serializers
from .models import Imovel

class ImovelSerializer(serializers.ModelSerializer):
    proprietario_nome = serializers.CharField(source='proprietario.get_full_name', read_only=True)
    total_contratos = serializers.SerializerMethodField()

    class Meta:
        model = Imovel
        fields = [
            'id', 'endereco', 'numero', 'complemento', 'bairro',
            'cidade', 'estado', 'cep', 'tipo', 'descricao',
            'area_m2', 'valor_aluguel', 'status',
            'proprietario', 'proprietario_nome',
            'total_contratos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_contratos(self, obj):
        return obj.contratos.count()