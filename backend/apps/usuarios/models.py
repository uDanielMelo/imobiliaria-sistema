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


class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

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