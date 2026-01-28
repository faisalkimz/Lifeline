from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FormTemplate, FormSubmission
from .serializers import FormTemplateSerializer, FormSubmissionSerializer
from employees.models import Employee

class FormTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = FormTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return FormTemplate.objects.all()
        return FormTemplate.objects.filter(company=user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class FormSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = FormSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['template', 'status', 'employee']

    def get_queryset(self):
        # Admin/SuperAdmin see all for company, employees see their own
        user = self.request.user
        if user.role == 'super_admin':
            return FormSubmission.objects.all()
        if user.role in ['admin', 'manager', 'company_admin', 'hr_manager']:
            return FormSubmission.objects.filter(template__company=user.company)
        
        if user.employee:
            return FormSubmission.objects.filter(employee=user.employee)
        return FormSubmission.objects.none()

    def perform_create(self, serializer):
        # Allow submission even if no employee record exists (e.g. for super_admins)
        employee = getattr(self.request.user, 'employee', None)
        serializer.save(employee=employee)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        # Allow super_admin, company_admin, hr_manager to review
        if request.user.role not in ['super_admin', 'company_admin', 'hr_manager']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to review forms.")
        
        submission = self.get_object()
        submission.status = request.data.get('status', submission.status)
        submission.review_notes = request.data.get('review_notes', '')
        submission.reviewed_by = request.user
        submission.save()
        return Response(FormSubmissionSerializer(submission).data)
