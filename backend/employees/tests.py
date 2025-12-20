from django.test import TestCase
from datetime import date
from rest_framework.test import APIClient

from accounts.models import Company
from .models import Employee


class EmployeeModelTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="TestCo", slug="testco")

    def _create_employee(self, join_date, last_working_date=None, national_id='NID', email='test@example.com'):
        return Employee.objects.create(
            company=self.company,
            first_name='Test',
            last_name='User',
            date_of_birth=date(1990, 1, 1),
            gender='male',
            national_id=national_id,
            email=email,
            phone='0700000000',
            job_title='Engineer',
            join_date=join_date,
            last_working_date=last_working_date
        )

    def test_years_of_service_same_day(self):
        e = self._create_employee(join_date=date(2020, 1, 15), last_working_date=date(2020, 1, 15))
        self.assertEqual(e.years_of_service, 0)

    def test_years_of_service_anniversary_passed(self):
        e = self._create_employee(join_date=date(2020, 1, 15), last_working_date=date(2021, 1, 15), national_id='NID2', email='b@example.com')
        self.assertEqual(e.years_of_service, 1)

    def test_years_of_service_before_anniversary(self):
        e = self._create_employee(join_date=date(2020, 6, 1), last_working_date=date(2021, 5, 31), national_id='NID3', email='c@example.com')
        self.assertEqual(e.years_of_service, 0)

    def test_leap_year_join_before_anniversary(self):
        e = self._create_employee(join_date=date(2020, 2, 29), last_working_date=date(2021, 2, 28), national_id='NID4', email='d@example.com')
        self.assertEqual(e.years_of_service, 0)

    def test_leap_year_join_after_anniversary(self):
        e = self._create_employee(join_date=date(2020, 2, 29), last_working_date=date(2021, 3, 1), national_id='NID5', email='e@example.com')
        self.assertEqual(e.years_of_service, 1)


class EmployeeManagersEndpointTests(TestCase):
    def setUp(self):
        from accounts.models import User
        self.company = Company.objects.create(name="OrgCo", slug="orgco")

        # Create an admin user who can promote
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@orgco.test',
            password='secret',
            company=self.company,
            role='company_admin'
        )

        # Create a regular employee
        self.employee = Employee.objects.create(
            company=self.company,
            first_name='Promo',
            last_name='Person',
            date_of_birth=date(1992, 4, 1),
            gender='female',
            national_id='PROMO1',
            email='promo@orgco.test',
            phone='0777000001',
            job_title='Engineer',
            join_date=date(2022, 1, 1)
        )

        # Use DRF APIClient and force-authenticate using JWT auth equivalent
        # (project uses JWT auth by default, so Django's force_login won't work for API endpoints)
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)

    def test_promoted_employee_appears_in_managers_list(self):
        # Force-login as admin and promote
        self.client.force_login(self.admin_user)

        resp = self.client.post('/api/employees/promote_to_manager/', {
            'employee_ids': [self.employee.id],
            'managerRole': 'Manager',
            'assign_as_dept_head': False
        }, content_type='application/json')

        self.assertEqual(resp.status_code, 200, msg=f"Promotion failed: {resp.content}")
        data = resp.json()
        self.assertIn('promoted_employees', data)
        promoted = data['promoted_employees']
        self.assertTrue(any(int(p.get('id')) == self.employee.id for p in promoted))

        # Now query managers endpoint
        mgr_resp = self.client.get('/api/employees/managers/')
        self.assertEqual(mgr_resp.status_code, 200)
        mgrs = mgr_resp.json()
        # Should include the newly promoted employee (job_title contains 'Manager')
        self.assertTrue(any(int(m.get('id')) == self.employee.id for m in mgrs), msg=f"Managers list missing promoted employee: {mgrs}")

