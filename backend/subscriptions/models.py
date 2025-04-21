from django.db import models
from users.models import User
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.core.exceptions import ValidationError


class Subscription(models.Model):
    name = models.CharField(max_length=150, null=False, blank=False)
    cost = models.DecimalField(max_digits=6, decimal_places=2, null=False)
    subscription_date = models.DateField(help_text="Start date of the subscription", null=False)
    renewal_type = models.CharField(max_length=50, choices=[
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ], null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions', null=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def renewal_date(self):
        if self.renewal_type == 'monthly':
            return self.subscription_date + relativedelta(months=1)
        elif self.renewal_type == 'yearly':
            return self.subscription_date + relativedelta(years=1)
    
    @property
    def monthly_cost(self):
        if self.renewal_type == 'monthly':
            return self.cost
        elif self.renewal_type == 'yearly':
            return self.cost / 12
    
    @property
    def yearly_cost(self):
        if self.renewal_type == 'monthly':
            return self.cost * 12
        elif self.renewal_type == 'yearly':
            return self.cost
        
    @property
    def renewing_in_7_days(self):
        return (self.renewal_date - timezone.now().date()).days <= 7
    
    def clean(self):
        if self.renewal_date and self.renewal_date < timezone.now().date():
            raise ValidationError("Renewal can't be in the past")
        return super().clean()
    
    class Meta:
        unique_together = ('user', 'name')