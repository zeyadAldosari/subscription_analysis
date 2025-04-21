from .models import Subscription
from rest_framework import serializers


class SubscriptionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'name', 'cost', 'subscription_date', 
            'renewal_type', 'renewal_date', 'created_at', 'updated_at', 'renewing_in_7_days'
            ]
