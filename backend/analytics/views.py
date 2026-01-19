from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ReportSchedule
from accounts.permissions import IsCompanyUser

class ReportScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSchedule
        fields = '__all__'
        read_only_fields = ['company', 'created_by', 'last_run']

class ReportScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ReportScheduleSerializer
    permission_classes = [IsCompanyUser]

    def get_queryset(self):
        return ReportSchedule.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user
        )

    @action(detail=False, methods=['get'])
    def dashboard_predictions(self, request):
        """Get company-wide predictive insights"""
        from .services.predictive_service import PredictiveAnalyticsService
        predictions = PredictiveAnalyticsService.get_company_wide_predictions(request.user.company)
        return Response(predictions)
