from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid
User = settings.AUTH_USER_MODEL
positive = MinValueValidator(Decimal('0.01'))
nonnegative = MinValueValidator(0)
class Circle(models.Model):
    name = models.CharField(max_length=80)
    owner = models.ForeignKey(User,on_delete=models.CASCADE)
class Member(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE,related_name='members')
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['circle','user'],name='unique_member')]
class Invite(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4,unique=True,editable=False)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
class Account(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE)
    name = models.CharField(max_length=80)
    kind = models.CharField(max_length=12,choices=[('cash','Dinheiro'),('benefit','Benefício')])
    opening_balance = models.DecimalField(max_digits=12,decimal_places=2,default=0)
class Entry(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE)
    account = models.ForeignKey(Account,on_delete=models.PROTECT)
    author = models.ForeignKey(User,on_delete=models.PROTECT)
    description = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=12,decimal_places=2,validators=[positive])
    kind = models.CharField(max_length=8,choices=[('income','Entrada'),('expense','Saída')])
    category = models.CharField(max_length=50,default='Outros')
    date = models.DateField()
    paid = models.BooleanField(default=False)
    essential = models.BooleanField(default=False)
    note = models.CharField(max_length=500,blank=True)
    class Meta:
        ordering = ['-date','-id']
class Debt(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=12,decimal_places=2,validators=[nonnegative])
    installment = models.DecimalField(max_digits=12,decimal_places=2,validators=[nonnegative])
    monthly_rate = models.DecimalField(max_digits=6,decimal_places=2,null=True,blank=True,validators=[nonnegative,MaxValueValidator(100)])
    payroll = models.BooleanField(default=False)
    priority = models.CharField(max_length=10,choices=[('normal','Normal'),('urgent','Urgente')],default='normal')
    note = models.CharField(max_length=500,blank=True)
class Goal(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    target = models.DecimalField(max_digits=12,decimal_places=2,validators=[positive])
    saved = models.DecimalField(max_digits=12,decimal_places=2,default=0,validators=[nonnegative])
class Budget(models.Model):
    circle = models.ForeignKey(Circle,on_delete=models.CASCADE)
    category = models.CharField(max_length=50)
    month = models.DateField()
    limit = models.DecimalField(max_digits=12,decimal_places=2,validators=[positive])
    class Meta:
        constraints = [models.UniqueConstraint(fields=['circle','category','month'],name='unique_budget')]
