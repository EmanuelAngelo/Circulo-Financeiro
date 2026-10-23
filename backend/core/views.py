from datetime import timedelta,date
from decimal import Decimal
from django.contrib.auth import authenticate,login,logout,get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models.deletion import ProtectedError
from django.http import FileResponse
from django.conf import settings
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view,permission_classes,authentication_classes,action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied,ValidationError as ApiError
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from .models import Circle,Member,Invite,Account,Entry,Debt,Goal,Budget
from .serializers import AccountSerializer,EntrySerializer,DebtSerializer,GoalSerializer,BudgetSerializer
User=get_user_model()
@api_view(['GET'])
@permission_classes([AllowAny])
def session(request):
    return Response({'csrf':get_token(request),'user': {'id':request.user.id,'name':request.user.first_name,'username':request.user.username} if request.user.is_authenticated else None})
@csrf_protect
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register(request):
    SessionAuthentication().enforce_csrf(request)
    username=str(request.data.get('username','')).strip().lower()
    password=request.data.get('password','')
    name=str(request.data.get('name','')).strip()
    if not name or len(name)>80 or not username or len(username)>150 or not all(c.isalnum() or c in '._-' for c in username):
        return Response({'detail':'Informe nome e usuário válido (letras, números, ponto ou traço).'},status=400)
    if User.objects.filter(username=username).exists():return Response({'detail':'Usuário já cadastrado.'},status=400)
    try:validate_password(password,User(username=username,first_name=name))
    except ValidationError as e:return Response({'detail':' '.join(e.messages)},status=400)
    try:
        with transaction.atomic():
            user=User.objects.create_user(username=username,password=password,first_name=name)
    except IntegrityError:
        raise ApiError('Usuário já cadastrado.')
    login(request,user)
    return Response({'ok':True},status=201)
@csrf_protect
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def signin(request):
    SessionAuthentication().enforce_csrf(request)
    user=authenticate(request,username=str(request.data.get('username','')).lower().strip(),password=request.data.get('password',''))
    if not user:return Response({'detail':'Usuário ou senha incorretos.'},status=400)
    login(request,user)
    return Response({'ok':True})
@api_view(['POST'])
def signout(request):
    logout(request)
    return Response({'ok':True})
def circle_for(request,pk):
    return get_object_or_404(Circle,pk=pk,members__user=request.user)
@api_view(['GET','POST'])
def circles(request):
    if request.method=='POST':
        name=str(request.data.get('name','')).strip()
        if not name or len(name)>80:raise ApiError('Nome do círculo deve ter de 1 a 80 caracteres.')
        with transaction.atomic():
            c=Circle.objects.create(name=name,owner=request.user)
            Member.objects.create(circle=c,user=request.user)
            Account.objects.create(circle=c,name='Conta do dia a dia',kind='cash')
            Account.objects.create(circle=c,name='Alelo / alimentação',kind='benefit')
    return Response(list(Circle.objects.filter(members__user=request.user).order_by('id').values('id','name','owner_id')))
@api_view(['GET','POST','DELETE'])
def members(request,pk):
    c=circle_for(request,pk)
    if request.method=='POST':
        if c.owner_id!=request.user.id:raise PermissionDenied('Só o responsável cria convites.')
        i=Invite.objects.create(circle=c,expires_at=timezone.now()+timedelta(days=7))
        return Response({'token':str(i.token),'expires_at':i.expires_at})
    if request.method=='DELETE':
        if c.owner_id!=request.user.id:raise PermissionDenied()
        if str(request.data.get('user'))==str(c.owner_id):raise ApiError('O responsável não pode ser removido.')
        Member.objects.filter(circle=c,user_id=request.data.get('user')).delete()
    return Response(list(Member.objects.filter(circle=c).values('user_id','user__first_name','user__username')))
@api_view(['POST'])
def join(request):
    try:
        with transaction.atomic():
            i=Invite.objects.select_for_update().get(token=request.data.get('token'),used=False,expires_at__gt=timezone.now())
            Member.objects.get_or_create(circle=i.circle,user=request.user)
            i.used=True;i.save()
    except (Invite.DoesNotExist,ValidationError,ValueError):raise ApiError('Convite inválido, usado ou expirado.')
    return Response({'ok':True})
class ScopedViewSet(viewsets.ModelViewSet):
    def get_circle(self):return circle_for(self.request,self.kwargs['circle_pk'])
    def get_queryset(self):return self.queryset.filter(circle=self.get_circle()).order_by('id')
    def get_serializer_context(self):return {**super().get_serializer_context(),'circle':self.get_circle()}
    def perform_create(self,serializer):
        extra={'author':self.request.user} if self.queryset.model is Entry else {}
        serializer.save(circle=self.get_circle(),**extra)
    def destroy(self,request,*args,**kwargs):
        try:return super().destroy(request,*args,**kwargs)
        except ProtectedError:raise ApiError('Conta com lançamentos não pode ser excluída.')
class AccountViewSet(ScopedViewSet):queryset=Account.objects.all();serializer_class=AccountSerializer
class EntryViewSet(ScopedViewSet):queryset=Entry.objects.all();serializer_class=EntrySerializer
class DebtViewSet(ScopedViewSet):queryset=Debt.objects.all();serializer_class=DebtSerializer
class GoalViewSet(ScopedViewSet):queryset=Goal.objects.all();serializer_class=GoalSerializer
class BudgetViewSet(ScopedViewSet):queryset=Budget.objects.all();serializer_class=BudgetSerializer
@api_view(['GET'])
def overview(request,pk):
    c=circle_for(request,pk)
    try:
        month=date.fromisoformat(request.query_params.get('month',timezone.localdate().strftime('%Y-%m'))+'-01')
    except ValueError:raise ApiError('Mês inválido.')
    all_entries=Entry.objects.filter(circle=c).select_related('account')
    monthly=all_entries.filter(date__year=month.year,date__month=month.month)
    def total(q):return sum((e.amount for e in q),Decimal('0'))
    cash=monthly.filter(account__kind='cash')
    benefit=monthly.filter(account__kind='benefit')
    income=total(cash.filter(kind='income'));expense=total(cash.filter(kind='expense'))
    accounts=[]
    for a in Account.objects.filter(circle=c):
        q=all_entries.filter(account=a,paid=True,date__lte=timezone.localdate())
        accounts.append({'id':a.id,'name':a.name,'kind':a.kind,'balance':a.opening_balance+total(q.filter(kind='income'))-total(q.filter(kind='expense'))})
    return Response({'income':income,'expense':expense,'result':income-expense,'pending':total(cash.filter(kind='expense',paid=False)), 'benefit_income':total(benefit.filter(kind='income')),'benefit_expense':total(benefit.filter(kind='expense')), 'debt_total':sum((d.balance for d in Debt.objects.filter(circle=c)),Decimal('0')),'accounts':accounts})
def index(request):
    path=settings.BASE_DIR.parent/'frontend'/'dist'/'index.html'
    if not path.exists():
        from django.http import HttpResponse
        return HttpResponse('Compile o frontend: npm install && npm run build',status=503)
    return FileResponse(path.open('rb'),content_type='text/html')
