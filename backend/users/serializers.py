from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'is_staff', 'is_active', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)

        dealer = User.objects.create_user(password=password, **validated_data)
        if password:
            dealer.set_password(password)           
        return dealer        