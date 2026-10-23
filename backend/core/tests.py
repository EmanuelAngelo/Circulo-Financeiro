from datetime import timedelta
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Circle,Member,Account,Entry,Debt,Invite

class FinanceTests(TestCase):
    def setUp(self):
        self.u=get_user_model().objects.create_user(username='ana',password='UmaSenha!765432',first_name='Ana')
        self.other=get_user_model().objects.create_user(username='bia',password='OutraSenha!765432')
        self.c=Circle.objects.create(name='Família',owner=self.u)
        self.c2=Circle.objects.create(name='Outra família',owner=self.other)
        Member.objects.create(circle=self.c,user=self.u)
        Member.objects.create(circle=self.c2,user=self.other)
        self.cash=Account.objects.create(circle=self.c,name='Conta',kind='cash',opening_balance='100.00')
        self.benefit=Account.objects.create(circle=self.c,name='Alelo',kind='benefit')
        self.foreign=Account.objects.create(circle=self.c2,name='Outra conta',kind='cash')
        self.client=APIClient();self.client.force_authenticate(self.u)
        self.prefix=f'/api/circles/{self.c.id}/'
        self.date=timezone.localdate()
    def entry(self,amount,kind='expense',paid=True,account=None,dt=None):
        return Entry.objects.create(circle=self.c,account=account or self.cash,author=self.u,description='Registro',amount=amount,kind=kind,date=dt or self.date,paid=paid)
    def test_cash_and_benefit_are_separate_and_payroll_not_duplicated(self):
        self.entry('4200.00','income');self.entry('1000.00','income',account=self.benefit)
        self.entry('5000.00',paid=False);self.entry('300.00',account=self.benefit)
        Debt.objects.create(circle=self.c,name='Consignado',balance='10000',installment='500',payroll=True)
        r=self.client.get(self.prefix+'overview/',{'month':self.date.strftime('%Y-%m')});self.assertEqual(r.status_code,200)
        self.assertEqual(Decimal(str(r.data['income'])),Decimal('4200'))
        self.assertEqual(Decimal(str(r.data['result'])),Decimal('-800'))
        self.assertEqual(r.data['accounts'][0]['balance'],Decimal('4300'))
        self.assertEqual(r.data['accounts'][1]['balance'],Decimal('700'))
    def test_future_paid_entries_do_not_increase_current_balance(self):
        self.entry('50','income',dt=self.date+timedelta(days=10))
        r=self.client.get(self.prefix+'overview/');self.assertEqual(r.data['accounts'][0]['balance'],Decimal('100'))
    def test_every_resource_isolated(self):
        for resource in ['accounts/','entries/','debts/','goals/','budgets/','members/','overview/']:
            self.assertEqual(self.client.get(f'/api/circles/{self.c2.id}/'+resource).status_code,404)
    def test_foreign_account_rejected(self):
        r=self.client.post(self.prefix+'entries/',{'account':self.foreign.id,'description':'Teste','amount':'25.00','kind':'expense','date':str(self.date)},format='json')
        self.assertEqual(r.status_code,400)
    def test_account_cannot_move_circle_and_cannot_delete_with_entries(self):
        e=self.entry('10');r=self.client.patch(self.prefix+f'entries/{e.id}/',{'account':self.foreign.id},format='json')
        self.assertEqual(r.status_code,400)
        self.assertEqual(self.client.delete(self.prefix+f'accounts/{self.cash.id}/').status_code,400)
    def test_negative_and_zero_expense_rejected(self):
        for amount in ['0','-1','0.001']:
            r=self.client.post(self.prefix+'entries/',{'account':self.cash.id,'description':'Teste','amount':amount,'kind':'expense','date':str(self.date)},format='json')
            self.assertEqual(r.status_code,400)
    def test_invite_once_and_revoke_access(self):
        r=self.client.post(self.prefix+'members/',{},format='json');token=r.data['token']
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post('/api/join/',{'token':token}).status_code,200)
        self.assertEqual(self.client.post('/api/join/',{'token':token}).status_code,400)
        self.assertEqual(self.client.get(self.prefix+'accounts/').status_code,200)
        self.assertEqual(self.client.post(self.prefix+'members/',{}).status_code,403)
        self.client.force_authenticate(self.u)
        self.assertEqual(self.client.delete(self.prefix+'members/',{'user':self.other.id},format='json').status_code,200)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(self.prefix+'accounts/').status_code,404)
    def test_expired_invite(self):
        invite=Invite.objects.create(circle=self.c,expires_at=timezone.now()-timedelta(days=1))
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post('/api/join/',{'token':str(invite.token)}).status_code,400)
    def test_budget_unique_month_category(self):
        payload={'category':'Energia','month':self.date.replace(day=1).isoformat(),'limit':'200'}
        self.assertEqual(self.client.post(self.prefix+'budgets/',payload).status_code,201)
        self.assertEqual(self.client.post(self.prefix+'budgets/',payload).status_code,400)
    def test_exact_decimal_totals(self):
        self.entry('0.10');self.entry('0.20')
        r=self.client.get(self.prefix+'overview/');self.assertEqual(r.data['expense'],Decimal('0.30'))
    def test_anonymous_cannot_read(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.prefix+'accounts/').status_code,403)
    def test_session_registration_login_and_csrf(self):
        c=APIClient(enforce_csrf_checks=True)
        data={'name':'Caio','username':'caio','password':'Circulo!836205'}
        self.assertEqual(c.post('/api/register/',data,HTTP_ORIGIN='http://localhost:5173').status_code,403)
        token=c.get('/api/session/').data['csrf']
        self.assertEqual(c.post('/api/register/',data,HTTP_X_CSRFTOKEN=token,HTTP_ORIGIN='http://localhost:5173').status_code,201)
        token=c.get('/api/session/').data['csrf']
        self.assertEqual(c.post('/api/circles/',{'name':'Nosso lar'},HTTP_X_CSRFTOKEN=token,HTTP_ORIGIN='http://localhost:5173').status_code,200)
        self.assertEqual(c.post('/api/logout/',{},HTTP_X_CSRFTOKEN=token,HTTP_ORIGIN='http://localhost:5173').status_code,200)
        self.assertEqual(c.post('/api/login/',data,HTTP_ORIGIN='http://localhost:5173').status_code,403)
        token=c.get('/api/session/').data['csrf']
        self.assertEqual(c.post('/api/login/',data,HTTP_X_CSRFTOKEN=token,HTTP_ORIGIN='http://localhost:5173').status_code,200)
