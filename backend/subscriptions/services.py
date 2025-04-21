from django.db.models import When, F, Case, DecimalField, Sum, QuerySet
from typing import Optional
from .models import Subscription
from decimal import Decimal

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
        