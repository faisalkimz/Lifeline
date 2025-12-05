import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, Company
from employees.models import Department, Employee

with open('debug_output.txt', 'w') as f:
    f.write("-" * 50 + "\n")
    f.write("COMPANIES:\n")
    for c in Company.objects.all():
        f.write(f"ID: {c.id} | Name: {c.name}\n")

    f.write("-" * 50 + "\n")
    f.write("USERS:\n")
    for u in User.objects.all():
        company_name = u.company.name if u.company else "NO COMPANY"
        f.write(f"ID: {u.id} | Username: {u.username} | Email: {u.email} | Company: {company_name} (ID: {u.company_id}) | Role: {u.role}\n")

    f.write("-" * 50 + "\n")
    f.write("DEPARTMENTS:\n")
    for d in Department.objects.all():
        company_name = d.company.name if d.company else "NO COMPANY"
        f.write(f"ID: {d.id} | Name: {d.name} | Company: {company_name} (ID: {d.company_id})\n")

    f.write("-" * 50 + "\n")
    f.write("EMPLOYEES:\n")
    for e in Employee.objects.all():
        company_name = e.company.name if e.company else "NO COMPANY"
        f.write(f"ID: {e.id} | Name: {e.full_name} | Company: {company_name} (ID: {e.company_id})\n")
