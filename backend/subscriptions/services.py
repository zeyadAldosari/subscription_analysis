from io import TextIOWrapper
from django.db.models import When, F, Case, DecimalField, Sum, QuerySet
from typing import Optional
from .models import Subscription
from .serializers import SubscriptionSerializer
from decimal import Decimal
import csv
from django.core.exceptions import ValidationError
from django.db import transaction

class SubscriptionService:
    
    @staticmethod
    def get_subscription_statistics(user):
        try:
            subscriptions = Subscription.objects.filter(user=user)
            monthly_cost = SubscriptionService.get_monthly_costs(subscriptions)
            yearly_cost = SubscriptionService.get_yearly_costs(subscriptions)
            service_costs = SubscriptionService.get_cost_by_service(subscriptions)
            if monthly_cost is None:
                monthly_cost = 0
            subscription_count = subscriptions.count()
            return {
                'monthly_cost': monthly_cost,
                'yearly_cost': yearly_cost,
                'service_costs': service_costs,
                'subscription_count': subscription_count
            }
        except Exception as e:
            raise Exception(f"Error: {str(e)}")
        
    @staticmethod
    def get_monthly_costs(subscriptions: QuerySet[Subscription]) -> Optional[Decimal]:
            monthly_cost = subscriptions.annotate(
                monthly_cost=Case(
                    When(renewal_type='monthly', then=F('cost')),
                    When(renewal_type='yearly' , then=F('cost')/12),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            ).aggregate(total=Sum('monthly_cost'))['total']
            return monthly_cost
    
    @staticmethod
    def get_yearly_costs(subscriptions: QuerySet[Subscription]) -> Optional[Decimal]:
            yearly_cost = subscriptions.annotate(
                yearly_cost=Case(
                    When(renewal_type='monthly', then=F('cost')*12),
                    When(renewal_type='yearly' , then=F('cost')),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            ).aggregate(total=Sum('yearly_cost'))['total']
            return yearly_cost
        
    def get_cost_by_service(subscriptions: QuerySet[Subscription]) -> list[dict]:
        services_costs = subscriptions.values('name').annotate(
                monthly_cost=Case(
                    When(renewal_type='monthly', then=F('cost')),
                    When(renewal_type='yearly' , then=F('cost')/12),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                yearly_cost=Case(
                    When(renewal_type='monthly', then=F('cost')*12),
                    When(renewal_type='yearly' , then=F('cost')),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )                
        )
        return services_costs
        
    @staticmethod
    def process_csv(file, user):
        processed_subscriptions = []
        with transaction.atomic():
            text_file = TextIOWrapper(file, encoding='utf-8-sig')            
            reader = csv.DictReader(text_file)
            for i, row in enumerate(reader, start=1):
                clean_row = {k: v.strip() for k, v in row.items()}
                clean_row['renewal_type'] = clean_row['renewal_type'].lower()
                subscription = SubscriptionSerializer(data=clean_row)
                if not subscription.is_valid():
                    raise Exception(f"Invalid data in row {i}: {subscription.errors}")
                instance = subscription.save(user=user)
                try:
                    instance.clean()
                except ValidationError as e:
                    instance.delete()
                    raise Exception(f"Validation error in row {i}: {str(e)}")                
                processed_subscriptions.append(SubscriptionSerializer(instance).data)
        return processed_subscriptions