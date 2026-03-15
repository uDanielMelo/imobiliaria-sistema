from django.db import models
from apps.usuarios.models import BaseModel
from django.conf import settings


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
        EM_MANUTENCAO = 'em_manutencao', 'Em Manutenção'
        INATIVO = 'inativo', 'Inativo'

    proprietario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='imoveis'
    )
    endereco = models.CharField(max_length=255)
    numero = models.CharField(max_length=20)
    complemento = models.CharField(max_length=100, null=True, blank=True)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=9)
    tipo = models.CharField(max_length=20, choices=TipoChoices.choices)
    descricao = models.TextField(null=True, blank=True)
    area_m2 = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    valor_aluguel = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.DISPONIVEL
    )

    class Meta:
        db_table = 'imoveis'
        verbose_name = 'Imóvel'
        verbose_name_plural = 'Imóveis'

    def __str__(self):
        return f'{self.endereco}, {self.numero} - {self.cidade}/{self.estado}'