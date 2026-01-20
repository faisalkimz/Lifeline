from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Survey, SurveyResponse
from .serializers import SurveySerializer, SurveyResponseSerializer
from employees.models import Employee

class SurveyViewSet(viewsets.ModelViewSet):
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return Survey.objects.all()
        return Survey.objects.filter(company=user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        survey = self.get_object()
        responses = survey.responses.all()
        
        # Simple analytics: count answers for each question
        stats = {}
        for question in survey.questions_config:
            q_id = question.get('id')
            q_results = {}
            for resp in responses:
                ans = resp.answers_data.get(q_id)
                if ans is not None:
                    q_results[str(ans)] = q_results.get(str(ans), 0) + 1
            stats[q_id] = q_results

        return Response({
            'total_responses': responses.count(),
            'question_stats': stats
        })

class SurveyResponseViewSet(viewsets.ModelViewSet):
    serializer_class = SurveyResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return SurveyResponse.objects.all()
        if user.role in ['admin', 'manager', 'company_admin', 'hr_manager']:
            return SurveyResponse.objects.filter(survey__company=user.company)
        
        if user.employee:
            return SurveyResponse.objects.filter(employee=user.employee)
        return SurveyResponse.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        employee = getattr(user, 'employee', None)
        # Handle anonymity in perform_create or model logic
        serializer.save(employee=employee)
