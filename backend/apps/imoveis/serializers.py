from rest_framework import serializers
from .models import Imovel, FotoImovel


class FotoImovelSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoImovel
        fields = ['id', 'arquivo', 'descricao', 'comodo', 'ordem', 'capa', 'created_at']
        read_only_fields = ['id', 'created_at']


class ImovelSerializer(serializers.ModelSerializer):
    proprietario_nome = serializers.CharField(source='proprietario.get_full_name', read_only=True)
    total_contratos = serializers.SerializerMethodField()
    fotos = FotoImovelSerializer(many=True, read_only=True)

    class Meta:
        model = Imovel
        fields = [
            'id', 'endereco', 'numero', 'complemento', 'bairro',
            'cidade', 'estado', 'cep', 'tipo', 'finalidade', 'descricao',
            'area_m2', 'quartos', 'suites', 'banheiros', 'vagas', 'andares',
            'valor_aluguel', 'valor_venda', 'valor_condominio', 'valor_iptu',
            'aceita_pets', 'mobiliado', 'tem_piscina', 'tem_academia',
            'tem_churrasqueira', 'tem_portaria',
            'status', 'slug', 'publicado', 'destaque',
            'proprietario', 'proprietario_nome',
            'total_contratos', 'fotos', 'created_at', 'updated_at',
            'tem_elevador', 'tem_sacada', 'tem_deposito',
            'tem_lavanderia', 'tem_ar_condicionado', 'prox_metro',
        ]
        read_only_fields = ['id', 'proprietario', 'slug', 'created_at', 'updated_at']

    def get_total_contratos(self, obj):
        return obj.contratos.count()


class ImovelListSerializer(serializers.ModelSerializer):
    foto_capa = serializers.SerializerMethodField()
    total_contratos = serializers.SerializerMethodField()

    class Meta:
        model = Imovel
        fields = [
            'id', 'endereco', 'numero', 'complemento', 'bairro',
            'cidade', 'estado', 'cep', 'tipo', 'finalidade', 'status',
            'area_m2', 'quartos', 'suites', 'banheiros', 'vagas',
            'valor_aluguel', 'valor_venda', 'valor_condominio', 'valor_iptu',
            'aceita_pets', 'mobiliado', 'tem_piscina', 'tem_academia',
            'tem_churrasqueira', 'tem_portaria', 'andares', 'descricao',
            'tem_elevador', 'tem_sacada', 'tem_deposito',
            'tem_lavanderia', 'tem_ar_condicionado', 'prox_metro',
            'slug', 'publicado', 'destaque',
            'foto_capa', 'total_contratos'
        ]

    def get_foto_capa(self, obj):
        foto = obj.fotos.filter(capa=True).first() or obj.fotos.first()
        if foto:
            request = self.context.get('request')
            return request.build_absolute_uri(foto.arquivo.url) if request else foto.arquivo.url
        return None

    def get_total_contratos(self, obj):
        return obj.contratos.count()