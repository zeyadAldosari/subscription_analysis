from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_user_info, name='user_info'),
    path('test/', views.example_view, name='example'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
]