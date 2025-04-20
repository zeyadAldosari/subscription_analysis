from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from .models import User
from .serializers import UserSerializer

@api_view(['GET'])
def example_view(request):
    data = {
        'message': 'Hello, this is a test response from the users app!'
    }
    return Response(data)

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        access = AccessToken.for_user(user)
        return Response({'access': str(access)}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=400)
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=400)

    if user.check_password(password):
        access = AccessToken.for_user(user)
        return Response({'access': str(access)}, status=200)
    return Response({'error': 'Invalid credentials'}, status=400)