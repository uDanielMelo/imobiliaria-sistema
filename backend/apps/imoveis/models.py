from django.db import models
from apps.usuarios.models import BaseModel
from django.conf import settings
from django.utils.text import slugify
import uuid


class Imovel(BaseModel):

    class TipoChoices(models.TextChoices):
        APARTAMENTO = 'apartamento', 'Apartamento'
        CASA = 'casa', 'Casa'
        COMERCIAL = 'comercial', 'Comercial'
        TERRENO = 'terreno', 'Terreno'
        OUTRO = 'outro', 'Outro'

    class StatusChoices(models.TextChoices):
        DISPONIVEL = 'disponivel', 'Disponível'
        ALUGADO = 'alugado', 'Alugado'
        VENDIDO = 'vendido', 'Vendido'
        EM_MANUTENCAO = 'em_manutencao', 'Em Manutenção'
        INATIVO = 'inativo', 'Inativo'

    class FinalidadeChoices(models.TextChoices):
        ALUGUEL = 'aluguel', 'Aluguel'
        VENDA = 'venda', 'Venda'
        AMBOS = 'ambos', 'Aluguel e Venda'

    proprietario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='imoveis'
    )

    # Endereço
    endereco = models.CharField(max_length=255)
    numero = models.CharField(max_length=20)
    complemento = models.CharField(max_length=100, null=True, blank=True)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=9)

    # Tipo e finalidade
    tipo = models.CharField(max_length=20, choices=TipoChoices.choices)
    finalidade = models.CharField(
        max_length=10,
        choices=FinalidadeChoices.choices,
        default=FinalidadeChoices.ALUGUEL
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.DISPONIVEL
    )

    # Valores
    valor_aluguel = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_venda = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valor_condominio = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    valor_iptu = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Características
    area_m2 = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    quartos = models.IntegerField(default=0)
    suites = models.IntegerField(default=0)
    banheiros = models.IntegerField(default=0)
    vagas = models.IntegerField(default=0)
    andares = models.IntegerField(null=True, blank=True)

    # Detalhes
    descricao = models.TextField(null=True, blank=True)
    aceita_pets = models.BooleanField(default=False)
    mobiliado = models.BooleanField(default=False)
    tem_piscina = models.BooleanField(default=False)
    tem_academia = models.BooleanField(default=False)
    tem_churrasqueira = models.BooleanField(default=False)
    tem_portaria = models.BooleanField(default=False)
    tem_elevador = models.BooleanField(default=False)
    tem_sacada = models.BooleanField(default=False)
    tem_deposito = models.BooleanField(default=False)
    tem_lavanderia = models.BooleanField(default=False)
    tem_ar_condicionado = models.BooleanField(default=False)
    prox_metro = models.BooleanField(default=False)

    # Vitrine pública
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    publicado = models.BooleanField(default=False)
    destaque = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.endereco}-{self.numero}-{self.cidade}")
            self.slug = f"{base}-{str(self.id)[:8]}"
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'imoveis'
        verbose_name = 'Imóvel'
        verbose_name_plural = 'Imóveis'

    def __str__(self):
        return f'{self.endereco}, {self.numero} - {self.cidade}/{self.estado}'


class FotoImovel(BaseModel):

    class ComodoChoices(models.TextChoices):
        SALA = 'sala', 'Sala'
        COZINHA = 'cozinha', 'Cozinha'
        QUARTO = 'quarto', 'Quarto'
        SUITE = 'suite', 'Suíte'
        BANHEIRO = 'banheiro', 'Banheiro'
        AREA_SERVICO = 'area_servico', 'Área de Serviço'
        VARANDA = 'varanda', 'Varanda'
        GARAGEM = 'garagem', 'Garagem'
        FACHADA = 'fachada', 'Fachada'
        AREA_COMUM = 'area_comum', 'Área Comum'
        OUTRO = 'outro', 'Outro'

    imovel = models.ForeignKey(
        Imovel,
        on_delete=models.CASCADE,
        related_name='fotos'
    )
    arquivo = models.ImageField(upload_to='imoveis/fotos/%Y/%m/')
    descricao = models.CharField(max_length=255, null=True, blank=True)
    comodo = models.CharField(
        max_length=20,
        choices=ComodoChoices.choices,
        default=ComodoChoices.OUTRO
    )
    ordem = models.IntegerField(default=0)
    capa = models.BooleanField(default=False)

    class Meta:
        db_table = 'fotos_imovel'
        ordering = ['ordem', 'created_at']
        verbose_name = 'Foto do Imóvel'
        verbose_name_plural = 'Fotos dos Imóveis'

    def __str__(self):
        return f'Foto {self.comodo} - {self.imovel}'