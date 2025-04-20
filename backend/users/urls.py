from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.example_view, name='example'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
]