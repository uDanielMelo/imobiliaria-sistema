from django.db import models
from apps.usuarios.models import BaseModel
from django.conf import settings


class Contrato(BaseModel):

    class StatusChoices(models.TextChoices):
        ATIVO = 'ativo', 'Ativo'
        ENCERRADO = 'encerrado', 'Encerrado'
        CANCELADO = 'cancelado', 'Cancelado'
        PENDENTE = 'pendente', 'Pendente'

    imovel = models.ForeignKey(
        'imoveis.Imovel',
        on_delete=models.PROTECT,
        related_name='contratos'
    )
    inquilino = models.ForeignKey(
        'inquilinos.Inquilino',
        on_delete=models.PROTECT,
        related_name='contratos'
    )
    proprietario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='contratos'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    value = models.DecimalField(max_digits=10, decimal_places=2)
    due_day = models.IntegerField(default=10)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDENTE
    )
    observacoes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'contratos'
        verbose_name = 'Contrato'
        verbose_name_plural = 'Contratos'

    def __str__(self):
        return f'Contrato {self.id} - {self.imovel} / {self.inquilino}'


class Pagamento(BaseModel):

    class StatusChoices(models.TextChoices):
        PENDENTE = 'pendente', 'Pendente'
        PAGO = 'pago', 'Pago'
        ATRASADO = 'atrasado', 'Atrasado'
        CANCELADO = 'cancelado', 'Cancelado'

    contrato = models.ForeignKey(
        Contrato,
        on_delete=models.PROTECT,
        related_name='pagamentos'
    )
    value = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDENTE
    )
    observacoes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'pagamentos'
        verbose_name = 'Pagamento'
        verbose_name_plural = 'Pagamentos'

    def __str__(self):
        return f'Pagamento {self.due_date} - {self.status}'


class Anexo(BaseModel):

    class TipoChoices(models.TextChoices):
        CONTRATO = 'contrato', 'Contrato'
        FOTO = 'foto', 'Foto'
        LAUDO = 'laudo', 'Laudo'
        SEGURO = 'seguro', 'Seguro'
        OUTRO = 'outro', 'Outro'

    imovel = models.ForeignKey(
        'imoveis.Imovel',
        on_delete=models.PROTECT,
        related_name='anexos',
        null=True,
        blank=True
    )
    contrato = models.ForeignKey(
        Contrato,
        on_delete=models.PROTECT,
        related_name='anexos',
        null=True,
        blank=True
    )
    nome = models.CharField(max_length=255)
    tipo = models.CharField(max_length=20, choices=TipoChoices.choices)
    arquivo = models.FileField(upload_to='anexos/%Y/%m/')
    tamanho = models.IntegerField(null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='anexos'
    )

    class Meta:
        db_table = 'anexos'
        verbose_name = 'Anexo'
        verbose_name_plural = 'Anexos'

    def __str__(self):
        return f'{self.nome} ({self.tipo})'


class Mensagem(BaseModel):
    contrato = models.ForeignKey(
        Contrato,
        on_delete=models.PROTECT,
        related_name='mensagens'
    )
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='mensagens'
    )
    texto = models.TextField()
    lida = models.BooleanField(default=False)

    class Meta:
        db_table = 'mensagens'
        verbose_name = 'Mensagem'
        verbose_name_plural = 'Mensagens'
        ordering = ['created_at']

    def __str__(self):
        return f'Mensagem de {self.autor} em {self.created_at}'
    
class Lead(BaseModel):

    class TipoChoices(models.TextChoices):
        CONTATO = 'contato', 'Contato'
        VISITA = 'visita', 'Agendamento de Visita'
        PROPOSTA = 'proposta', 'Proposta'

    class StatusChoices(models.TextChoices):
        NOVO = 'novo', 'Novo'
        EM_ATENDIMENTO = 'em_atendimento', 'Em Atendimento'
        CONVERTIDO = 'convertido', 'Convertido'
        PERDIDO = 'perdido', 'Perdido'

    imovel = models.ForeignKey(
        'imoveis.Imovel',
        on_delete=models.PROTECT,
        related_name='leads'
    )
    nome = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    tipo = models.CharField(max_length=20, choices=TipoChoices.choices)
    mensagem = models.TextField(null=True, blank=True)
    data_visita = models.DateTimeField(null=True, blank=True)
    valor_proposta = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.NOVO
    )

    class Meta:
        db_table = 'leads'
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nome} - {self.tipo} - {self.imovel}'
