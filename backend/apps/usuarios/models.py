import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class Plano(models.Model):

    class TipoChoices(models.TextChoices):
        GRATUITO = 'gratuito', 'Gratuito'
        BASICO = 'basico', 'Básico'
        PREMIUM = 'premium', 'Premium'

    tipo = models.CharField(max_length=20, choices=TipoChoices.choices, unique=True)
    nome = models.CharField(max_length=100)
    limite_imoveis = models.IntegerField(default=5)
    limite_contratos = models.IntegerField(default=3)
    vitrine_propria = models.BooleanField(default=False)
    marketplace = models.BooleanField(default=False)
    preco_mensal = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    class Meta:
        db_table = 'planos'
        verbose_name = 'Plano'
        verbose_name_plural = 'Planos'

    def __str__(self):
        return self.nome


class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    plano = models.ForeignKey(
        Plano,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )

    class PerfilChoices(models.TextChoices):
        PROPRIETARIO = 'proprietario', 'Proprietário'
        INQUILINO = 'inquilino', 'Inquilino'
        CORRETOR = 'corretor', 'Corretor'

    perfil = models.CharField(
        max_length=20,
        choices=PerfilChoices.choices,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f'{self.get_full_name()} ({self.perfil})'


class PerfilImobiliaria(BaseModel):
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil_imobiliaria'
    )
    slug = models.SlugField(max_length=100, unique=True)
    nome_fantasia = models.CharField(max_length=255)
    descricao = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to='imobiliarias/logos/', null=True, blank=True)
    telefone_publico = models.CharField(max_length=20, null=True, blank=True)
    whatsapp = models.CharField(max_length=20, null=True, blank=True)
    email_publico = models.EmailField(null=True, blank=True)
    site = models.URLField(null=True, blank=True)
    cidade = models.CharField(max_length=100, null=True, blank=True)
    estado = models.CharField(max_length=2, null=True, blank=True)

    class Meta:
        db_table = 'perfis_imobiliaria'
        verbose_name = 'Perfil da Imobiliária'
        verbose_name_plural = 'Perfis das Imobiliárias'

    def __str__(self):
        return self.nome_fantasia