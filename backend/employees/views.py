"""
API Views for employees app.
Handles department and employee management.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Department, Employee
from .serializers import (
    DepartmentSerializer, DepartmentCreateSerializer,
    EmployeeSerializer, EmployeeCreateSerializer,
    EmployeeListSerializer, EmployeeUpdateSerializer
)
from accounts.permissions import IsCompanyUser, IsHRManagerOrAdmin


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Department management.
    
    GET    /api/departments/          - List departments (company-scoped)
    POST   /api/departments/          - Create department
    GET    /api/departments/:id/      - Retrieve department details
    PUT    /api/departments/:id/      - Update department
    DELETE /api/departments/:id/      - Delete department
    GET    /api/departments/:id/employees/ - List department employees
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """Filter departments by company"""
        user = self.request.user
        
        from django.db.models import Count, Q
        
        # Base queryset - employee_count is handled by the model property
        queryset = Department.objects.all()
        
        # Super admins see all departments
        if user.role == 'super_admin':
            return queryset.select_related('company', 'manager')
        
        # Regular users only see departments from their company
        return queryset.filter(company=user.company).select_related('company', 'manager')
    
    def get_serializer_class(self):
        """Use create serializer for POST"""
        if self.action == 'create':
            return DepartmentCreateSerializer
        return DepartmentSerializer
    
    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees in this department"""
        department = self.get_object()
        employees = department.employees.filter(employment_status='active')
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get department statistics"""
        department = self.get_object()
        
        stats = {
            'total_employees': department.employees.count(),
            'active_employees': department.employees.filter(employment_status='active').count(),
            'on_leave': department.employees.filter(employment_status='on_leave').count(),
            'manager': department.manager.full_name if department.manager else None,
        }
        
        return Response(stats)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Employee management.
    
    GET    /api/employees/          - List employees (company-scoped)
    POST   /api/employees/          - Create employee
    GET    /api/employees/:id/      - Retrieve employee details
    PUT    /api/employees/:id/      - Update employee
    DELETE /api/employees/:id/      - Delete employee
    GET    /api/employees/active/   - List active employees
    GET    /api/employees/search/   - Search employees
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'employment_status', 'employment_type', 'gender']
    search_fields = ['employee_number', 'first_name', 'last_name', 'email', 'national_id', 'job_title']
    ordering_fields = ['employee_number', 'first_name', 'last_name', 'join_date', 'created_at']
    ordering = ['employee_number']
    
    def get_queryset(self):
        """Filter employees by company"""
        user = self.request.user
        
        # Super admins see all employees
        if user.role == 'super_admin':
            queryset = Employee.objects.all()
        else:
            # Regular users only see employees from their company
            queryset = Employee.objects.filter(company=user.company)
        
        # Optimize queries
        return queryset.select_related('company', 'department', 'manager')
    
    def get_serializer_class(self):
        """Use appropriate serializer based on action"""
        if self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EmployeeUpdateSerializer
        elif self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's employee record"""
        print(f"DEBUG: me action called for user: {request.user}, authenticated: {request.user.is_authenticated}")

        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Try to find employee by email
            employee = Employee.objects.get(
                company=request.user.company,
                email=request.user.email
            )
            print(f"DEBUG: Found employee: {employee}")
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            print(f"DEBUG: No employee found for email: {request.user.email}, company: {request.user.company}")
            return Response(
                {'error': 'No employee record found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active employees"""
        employees = self.get_queryset().filter(employment_status='active')
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def on_probation(self, request):
        """Get all employees currently on probation"""
        from django.utils import timezone
        employees = self.get_queryset().filter(
            employment_status='active',
            probation_end_date__gte=timezone.now().date()
        )
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subordinates(self, request, pk=None):
        """Get all subordinates of this employee (if they're a manager)"""
        employee = self.get_object()
        subordinates = employee.subordinates.all()
        serializer = EmployeeListSerializer(subordinates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_department(self, request):
        """Get employee count grouped by department"""
        from django.db.models import Count
        
        departments = Department.objects.filter(
            company=request.user.company
        ).annotate(
            employee_count=Count('employees', filter={'employees__employment_status': 'active'})
        ).values('id', 'name', 'employee_count')
        
        return Response(list(departments))

    @action(detail=False, methods=['get'])
    def managers(self, request):
        """Get all managers with their subordinates"""
        # Get employees who have subordinates (managers)
        managers = self.get_queryset().filter(
            subordinates__isnull=False,
            employment_status='active'
        ).distinct().prefetch_related('subordinates', 'department')

        # Serialize with subordinates data using EmployeeListSerializer
        # which includes subordinates field for frontend compatibility
        serializer = EmployeeListSerializer(managers, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def promote_to_manager(self, request):
        """Promote employees to managerial positions"""
        from .models import Department

        employee_ids = request.data.get('employee_ids', [])
        manager_role = request.data.get('managerRole', 'Manager')
        assign_as_dept_head = request.data.get('assign_as_dept_head', False)
        department_id = request.data.get('department_id')

        if not employee_ids:
            return Response(
                {"error": "No employees selected for promotion"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get employees to promote
        employees = self.get_queryset().filter(
            id__in=employee_ids,
            employment_status='active'
        )

        if len(employees) != len(employee_ids):
            return Response(
                {"error": "Some selected employees were not found or are not active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if department assignment is valid
        department = None
        if assign_as_dept_head and department_id:
            try:
                department = Department.objects.get(
                    id=department_id,
                    company=request.user.company
                )
                # Check if department already has a manager
                if department.manager:
                    return Response(
                        {"error": f"Department '{department.name}' already has a manager"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Department.DoesNotExist:
                return Response(
                    {"error": "Selected department not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        promoted_employees = []
        for employee in employees:
            # Update job title to include manager designation
            if manager_role and manager_role.lower() not in employee.job_title.lower():
                employee.job_title = f"{employee.job_title} - {manager_role}"

            # Assign as department head if requested
            if assign_as_dept_head and department:
                employee.managed_departments.add(department)

            employee.save()
            promoted_employees.append(employee)

        # Serialize the promoted employees
        serializer = EmployeeListSerializer(
            promoted_employees,
            many=True,
            context={'request': request}
        )

        return Response({
            "message": f"Successfully promoted {len(promoted_employees)} employee(s) to {manager_role}",
            "promoted_employees": serializer.data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get employee statistics"""
        queryset = self.get_queryset()
        
        from django.utils import timezone
        from datetime import timedelta
        
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        
        # Recent Hires (Last 5)
        recent_hires_list = queryset.order_by('-join_date')[:5]
        
        # Upcoming Events (Next 30 days)
        today = timezone.now().date()
        next_30_days = today + timedelta(days=30)
        
        # Birthdays logic (ignoring year)
        # This is tricky in standard SQL/ORM across years. 
        # For simplicity in this phase, we'll fetch active employees and filter in python 
        # or use a raw query if performance matters. 
        # Python filter for MVP:
        active_employees = queryset.filter(employment_status='active')
        upcoming_birthdays = []
        upcoming_anniversaries = []
        
        for emp in active_employees:
            # Birthday check
            if emp.date_of_birth:
                try:
                    bday_this_year = emp.date_of_birth.replace(year=today.year)
                    if bday_this_year < today:
                        bday_this_year = bday_this_year.replace(year=today.year + 1)

                    if today <= bday_this_year <= next_30_days:
                        upcoming_birthdays.append({
                            'id': emp.id,
                            'name': emp.full_name,
                            'date': bday_this_year,
                            'type': 'Birthday',
                            'original_date': emp.date_of_birth
                        })
                except ValueError:
                    # Handle leap year birthdays (Feb 29) in non-leap years
                    # Use March 1st as fallback
                    try:
                        fallback_date = emp.date_of_birth.replace(year=today.year, month=3, day=1)
                        if fallback_date < today:
                            fallback_date = fallback_date.replace(year=today.year + 1)

                        if today <= fallback_date <= next_30_days:
                            upcoming_birthdays.append({
                                'id': emp.id,
                                'name': emp.full_name,
                                'date': fallback_date,
                                'type': 'Birthday (Mar 1)',
                                'original_date': emp.date_of_birth
                            })
                    except ValueError:
                        # Skip if even March 1st causes issues
                        pass

            # Anniversary check
            if emp.join_date:
                try:
                    anniv_this_year = emp.join_date.replace(year=today.year)
                    if anniv_this_year < today:
                        anniv_this_year = anniv_this_year.replace(year=today.year + 1)

                    if today <= anniv_this_year <= next_30_days:
                        years = anniv_this_year.year - emp.join_date.year
                        if years > 0:
                            upcoming_anniversaries.append({
                                'id': emp.id,
                                'name': emp.full_name,
                                'date': anniv_this_year,
                                'type': 'Work Anniversary',
                                'years': years
                            })
                except ValueError:
                    # Skip anniversaries with invalid dates
                    pass
        
        # Sort events by date
        upcoming_events = sorted(upcoming_birthdays + upcoming_anniversaries, key=lambda x: x['date'])[:5]

        stats = {
            'total': queryset.count(),
            'active': queryset.filter(employment_status='active').count(),
            'on_leave': queryset.filter(employment_status='on_leave').count(),
            'suspended': queryset.filter(employment_status='suspended').count(),
            'terminated': queryset.filter(employment_status='terminated').count(),
            'resigned': queryset.filter(employment_status='resigned').count(),
            'new_hires': queryset.filter(join_date__gte=thirty_days_ago).count(),
            'departments_count': Department.objects.filter(company=request.user.company).count(),
            'recent_hires_list': EmployeeListSerializer(recent_hires_list, many=True, context={'request': request}).data,
            'upcoming_events': upcoming_events,
            'by_type': {
                'full_time': queryset.filter(employment_type='full_time').count(),
                'part_time': queryset.filter(employment_type='part_time').count(),
                'contract': queryset.filter(employment_type='contract').count(),
                'intern': queryset.filter(employment_type='intern').count(),
                'casual': queryset.filter(employment_type='casual').count(),
            },
            'by_gender': {
                'male': queryset.filter(gender='male').count(),
                'female': queryset.filter(gender='female').count(),
                'other': queryset.filter(gender='other').count(),
            }
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate employee"""
        employee = self.get_object()
        
        # Only HR managers and admins can terminate
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin']:
            return Response(
                {'error': 'Only HR managers or administrators can terminate employees'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.utils import timezone
        employee.employment_status = 'terminated'
        employee.last_working_date = timezone.now().date()
        employee.save()
        
        return Response({
            'message': f'Employee {employee.employee_number} terminated successfully',
            'employee': EmployeeSerializer(employee).data
        })
    
    @action(detail=True, methods=['post'])
    def resign(self, request, pk=None):
        """Mark employee as resigned"""
        employee = self.get_object()
        
        # Only HR managers and admins can process resignations
        if request.user.role not in ['hr_manager', 'company_admin', 'super_admin']:
            return Response(
                {'error': 'Only HR managers or administrators can process resignations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        resignation_date = request.data.get('resignation_date')
        last_working_date = request.data.get('last_working_date')
        
        if not resignation_date or not last_working_date:
            return Response(
                {'error': 'resignation_date and last_working_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee.employment_status = 'resigned'
        employee.resignation_date = resignation_date
        employee.last_working_date = last_working_date
        employee.save()
        
        return Response({
            'message': f'Employee {employee.employee_number} resignation processed',
            'employee': EmployeeSerializer(employee).data
        })
