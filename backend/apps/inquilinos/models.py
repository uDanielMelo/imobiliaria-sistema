from django.db import models
from apps.usuarios.models import BaseModel
from django.conf import settings


class Inquilino(BaseModel):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='inquilino_perfil',
        null=True,
        blank=True
    )
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True)
    rg = models.CharField(max_length=20, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    profissao = models.CharField(max_length=100, null=True, blank=True)
    renda_mensal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'inquilinos'
        verbose_name = 'Inquilino'
        verbose_name_plural = 'Inquilinos'

    def __str__(self):
        return f'{self.nome} - CPF: {self.cpf}'