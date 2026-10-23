from django.urls import path,include
from rest_framework.routers import SimpleRouter
from core import views
router=SimpleRouter()
for name,view in [('accounts',views.AccountViewSet),('entries',views.EntryViewSet),('debts',views.DebtViewSet),('goals',views.GoalViewSet),('budgets',views.BudgetViewSet)]:
    router.register(name,view,basename=name)
urlpatterns=[path('api/session/',views.session),path('api/register/',views.register),path('api/login/',views.signin),path('api/logout/',views.signout),path('api/circles/',views.circles),path('api/join/',views.join),path('api/circles/<int:pk>/members/',views.members),path('api/circles/<int:pk>/overview/',views.overview),path('api/circles/<int:circle_pk>/',include(router.urls)),path('',views.index)]
