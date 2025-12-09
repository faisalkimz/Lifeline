# Generated manually to add is_active field to SalaryStructure

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0002_add_company_to_salarystructure'),
    ]

    operations = [
        migrations.AddField(
            model_name='salarystructure',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
