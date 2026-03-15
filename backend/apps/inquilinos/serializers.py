from rest_framework import serializers
from .models import Inquilino

class InquilinoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquilino
        fields = [
            'id', 'nome', 'cpf', 'rg', 'telefone', 'email',
            'data_nascimento', 'profissao', 'renda_mensal',
            'usuario', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usuario', 'created_at', 'updated_at']