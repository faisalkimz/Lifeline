from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Resignation, ExitInterview
from .serializers import ResignationSerializer, ExitInterviewSerializer

class ResignationViewSet(viewsets.ModelViewSet):
    serializer_class = ResignationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Resignation.objects.filter(company=user.company)
        
        if self.request.query_params.get('my_resignations'):
            if hasattr(user, 'employee'):
                queryset = queryset.filter(employee=user.employee)
                
        return queryset

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'employee'):
             serializer.save(company=self.request.user.company, employee=self.request.user.employee)

class ExitInterviewViewSet(viewsets.ModelViewSet):
    serializer_class = ExitInterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExitInterview.objects.filter(resignation__company=self.request.user.company)
