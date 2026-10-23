from rest_framework import serializers
from .models import Account,Entry,Debt,Goal,Budget
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model=Account
        fields=['id','name','kind','opening_balance']
    def validate(self, data):
        if self.instance and self.instance.entry_set.exists():
            if data.get('kind',self.instance.kind)!=self.instance.kind or data.get('opening_balance',self.instance.opening_balance)!=self.instance.opening_balance:
                raise serializers.ValidationError('Conta com lançamentos: tipo e saldo inicial não podem ser alterados.')
        return data
class EntrySerializer(serializers.ModelSerializer):
    author_name=serializers.CharField(source='author.first_name',read_only=True)
    class Meta:
        model=Entry
        fields=['id','account','description','amount','kind','category','date','paid','essential','note','author_name']
    def validate_account(self,value):
        if value.circle_id != self.context['circle'].id:
            raise serializers.ValidationError('Conta não pertence ao círculo.')
        return value
class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model=Debt
        fields=['id','name','balance','installment','monthly_rate','payroll','priority','note']
class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model=Goal
        fields=['id','name','target','saved']
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model=Budget
        fields=['id','category','month','limit']
        validators=[]
    def validate(self,data):
        month=data.get('month',getattr(self.instance,'month',None))
        if month and month.day!=1:
            raise serializers.ValidationError('Use o primeiro dia do mês.')
        q=Budget.objects.filter(circle=self.context['circle'],month=month,category=data.get('category',getattr(self.instance,'category',None)))
        if self.instance:q=q.exclude(pk=self.instance.pk)
        if q.exists():raise serializers.ValidationError('Já existe limite para essa categoria no mês.')
        return data
