from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import datetime, date, timedelta
from .models import AttendancePolicy, Attendance, OvertimeRequest, AttendanceReport, WorkLocation
from .serializers import (
    AttendancePolicySerializer, AttendanceSerializer,
    ClockInSerializer, ClockOutSerializer,
    OvertimeRequestSerializer, AttendanceReportSerializer,
    WorkLocationSerializer
)
from .utils import calculate_distance


class AttendancePolicyViewSet(viewsets.ModelViewSet):
    serializer_class = AttendancePolicySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        company = self.request.user.company
        # Ensure policy exists
        AttendancePolicy.objects.get_or_create(company=company)
        return AttendancePolicy.objects.filter(company=company)
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class WorkLocationViewSet(viewsets.ModelViewSet):
    serializer_class = WorkLocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkLocation.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def refresh_qr(self, request, pk=None):
        location = self.get_object()
        location.refresh_qr_token()
        return Response({"qr_token": location.qr_token})


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.filter(
            employee__company=user.company
        ).select_related('employee', 'approved_by')
        
        # Filter by employee
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-date', 'employee__first_name')
    
    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        """Clock in for the day"""
        if not getattr(request.user, 'employee', None):
            return Response(
                {"error": "User does not have an employee record"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ClockInSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        today = date.today()
        now = timezone.now()
        
        # 1. Get today's attendance record (or create one with default status)
        attendance, created = Attendance.objects.get_or_create(
            employee=request.user.employee,
            date=today,
            defaults={'status': 'absent'}
        )
        
        if attendance.clock_in:
            return Response(
                {"error": "Already clocked in today"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Verification Logic
        # Ensure policy exists
        policy, _ = AttendancePolicy.objects.get_or_create(company=request.user.company)
        
        lat = serializer.validated_data.get('latitude')
        lng = serializer.validated_data.get('longitude')
        qr_token = serializer.validated_data.get('qr_token')

        # Geofencing
        if policy.enable_geofencing:
            if not lat or not lng:
                return Response({"error": "Location coordinates are required for clock-in"}, status=400)
            
            # Check against all work locations
            locations = WorkLocation.objects.filter(company=request.user.company, is_active=True)
            within_range = False
            for loc in locations:
                dist = calculate_distance(lat, lng, loc.latitude, loc.longitude)
                if dist <= loc.radius_meters:
                    within_range = True
                    attendance.work_location = loc
                    break
            
            if not within_range:
                return Response({"error": "You are outside the allowed work area"}, status=400)

        # QR Code
        if policy.enable_qr_clock_in:
            if not qr_token:
                return Response({"error": "QR code scan is required for clock-in"}, status=400)
            
            loc = WorkLocation.objects.filter(company=request.user.company, qr_token=qr_token).first()
            if not loc:
                return Response({"error": "Invalid or expired QR code"}, status=400)
            attendance.work_location = loc

        # 3. Successful verification - Update the record
        attendance.clock_in = now
        attendance.clock_in_lat = lat
        attendance.clock_in_lng = lng
        attendance.status = 'present'
        attendance.notes = serializer.validated_data.get('notes', '')
        attendance.save()
        
        # Check if late
        attendance.check_late_arrival()
        
        response_serializer = AttendanceSerializer(attendance)
        return Response({
            "message": "Clocked in successfully",
            "attendance": response_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        """Clock out for the day"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {"error": "User does not have an employee record"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ClockOutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        today = date.today()
        now = timezone.now()
        
        try:
            attendance = Attendance.objects.get(
                employee=request.user.employee,
                date=today,
                clock_in__isnull=False,
                clock_out__isnull=True
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "No active clock-in found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance.clock_out = now
        attendance.clock_out_lat = serializer.validated_data.get('latitude')
        attendance.clock_out_lng = serializer.validated_data.get('longitude')
        
        if serializer.validated_data.get('notes'):
            attendance.notes += f"\nClock out: {serializer.validated_data['notes']}"
        attendance.save()
        
        # Calculate hours
        attendance.calculate_hours()
        
        response_serializer = AttendanceSerializer(attendance)
        return Response({
            "message": "Clocked out successfully",
            "attendance": response_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        """Get current user's attendance records"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {"error": "User does not have an employee record"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get date range (default: current month)
        today = date.today()
        start_date = request.query_params.get('start_date', date(today.year, today.month, 1))
        end_date = request.query_params.get('end_date', today)
        
        attendances = Attendance.objects.filter(
            employee=request.user.employee,
            date__range=[start_date, end_date]
        ).order_by('-date')
        
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today_status(self, request):
        """Get today's attendance status"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {"error": "User does not have an employee record"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        today = date.today()
        attendance = Attendance.objects.filter(
            employee=request.user.employee,
            date=today
        ).first()
        
        if attendance:
            serializer = self.get_serializer(attendance)
            return Response(serializer.data)
        
        return Response({
            "message": "No attendance record for today",
            "is_clocked_in": False
        })
    
    @action(detail=False, methods=['get'])
    def team_attendance(self, request):
        """Get team attendance for managers"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {"error": "User does not have an employee record"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        today = date.today()
        
        # Get team members
        team_members = request.user.employee.subordinates.all()
        
        attendances = Attendance.objects.filter(
            employee__in=team_members,
            date=today
        ).select_related('employee')
        
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)


class OvertimeRequestViewSet(viewsets.ModelViewSet):
    serializer_class = OvertimeRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = OvertimeRequest.objects.filter(
            employee__company=user.company
        ).select_related('employee', 'approved_by')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's overtime requests"""
        if not hasattr(request.user, 'employee'):
            return Response(
                {"error": "User does not have an employee record"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        requests = OvertimeRequest.objects.filter(
            employee=request.user.employee
        ).order_by('-created_at')
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve overtime request"""
        overtime = self.get_object()
        
        if overtime.status != 'pending':
            return Response(
                {"error": "Only pending requests can be approved"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permission
        user = request.user
        if user.role not in ['admin', 'hr_manager']:
            if not hasattr(user, 'employee') or overtime.employee.manager != user.employee:
                return Response(
                    {"error": "You don't have permission to approve this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        overtime.status = 'approved'
        overtime.approved_by = user.employee if hasattr(user, 'employee') else None
        overtime.approved_at = timezone.now()
        overtime.save()
        
        # Update attendance record if exists
        try:
            attendance = Attendance.objects.get(
                employee=overtime.employee,
                date=overtime.date
            )
            attendance.overtime_hours = overtime.hours_requested
            attendance.save()
        except Attendance.DoesNotExist:
            pass
        
        serializer = self.get_serializer(overtime)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject overtime request"""
        overtime = self.get_object()
        
        if overtime.status != 'pending':
            return Response(
                {"error": "Only pending requests can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permission
        user = request.user
        if user.role not in ['admin', 'hr_manager']:
            if not hasattr(user, 'employee') or overtime.employee.manager != user.employee:
                return Response(
                    {"error": "You don't have permission to reject this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        overtime.status = 'rejected'
        overtime.rejection_reason = request.data.get('reason', '')
        overtime.approved_by = user.employee if hasattr(user, 'employee') else None
        overtime.approved_at = timezone.now()
        overtime.save()
        
        serializer = self.get_serializer(overtime)
        return Response(serializer.data)


class AttendanceReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AttendanceReport.objects.filter(
            employee__company=self.request.user.company
        ).select_related('employee')
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate attendance report for a month"""
        year = request.data.get('year', date.today().year)
        month = request.data.get('month', date.today().month)
        employee_id = request.data.get('employee_id')
        
        if employee_id:
            employees = [request.user.company.employees.get(id=employee_id)]
        else:
            employees = request.user.company.employees.filter(employment_status='active')
        
        reports = []
        for employee in employees:
            report, created = AttendanceReport.objects.get_or_create(
                employee=employee,
                year=year,
                month=month
            )
            
            # Calculate statistics
            attendances = Attendance.objects.filter(
                employee=employee,
                date__year=year,
                date__month=month
            )
            
            report.days_present = attendances.filter(status='present').count()
            report.days_absent = attendances.filter(status='absent').count()
            report.days_on_leave = attendances.filter(status='on_leave').count()
            report.late_arrivals = attendances.filter(is_late=True).count()
            
            report.total_hours_worked = attendances.aggregate(
                total=Sum('hours_worked')
            )['total'] or 0
            
            report.total_overtime_hours = attendances.aggregate(
                total=Sum('overtime_hours')
            )['total'] or 0
            
            # Calculate working days in month
            import calendar
            _, days_in_month = calendar.monthrange(year, month)
            working_days = 0
            for day in range(1, days_in_month + 1):
                dt = date(year, month, day)
                if dt.weekday() < 5:  # Monday-Friday
                    working_days += 1
            
            report.total_working_days = working_days
            
            # Calculate attendance rate
            if working_days > 0:
                report.attendance_rate = round(
                    (report.days_present / working_days) * 100, 2
                )
            
            report.save()
            reports.append(report)
        
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
