from django.db import migrations, models
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0008_payslip_pdf_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='payrollrun',
            name='total_lst',
            field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=15),
        ),
        migrations.AddField(
            model_name='payslip',
            name='local_service_tax',
            field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=15),
        ),
    ]
