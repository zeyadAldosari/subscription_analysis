from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_create_subscriptions, name='list_create_subscriptions'),
    path('delete/<int:id>/', views.delete_subscription, name='delete_subscription'),
    path('stats/', views.get_subscription_statistics, name='get_subscription_statistics'),    
]