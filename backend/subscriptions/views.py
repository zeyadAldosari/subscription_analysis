from django.forms import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import SubscriptionSerializer
from .models import Subscription
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from .services import SubscriptionService


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_subscriptions(request):
    try:            
        if request.method == 'GET':
            subscriptions = Subscription.objects.filter(user=request.user)
            subscriptions = sorted(subscriptions, key=lambda x: x.renewal_date)
            serializer = SubscriptionSerializer(subscriptions, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = SubscriptionSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                instance = serializer.save(user=request.user)
                try:
                    instance.clean()
                except ValidationError as e:  
                    instance.delete()  
                    return Response({'error': str(e)}, status=400)     
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_subscription(request, id):
    try:
        subscription = Subscription.objects.get(id=id)
        if subscription.user != request.user:
            return Response({'error': 'No access'}, status=403)
        subscription.delete()
        return Response(status=204)
    except Subscription.DoesNotExist:
        return Response({'error': 'Subscription not found'}, status=404)\
            
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription_statistics(request):
    try:
        statistics = SubscriptionService.get_subscription_statistics(request.user)
        return Response(statistics, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def csv_bulk_upload(request):
    try:
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)
        if not file.name.endswith('.csv'):
            return Response({'error': 'File is not a CSV'}, status=400)
        
        processed_subscriptions = SubscriptionService.process_csv(file, request.user)
        return Response({
            'message': f'imported {len(processed_subscriptions)} subscriptions',
            'subscriptions': processed_subscriptions
        }, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)