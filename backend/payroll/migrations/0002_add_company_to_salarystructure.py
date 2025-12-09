# Generated manually to add company field to SalaryStructure

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_initial'),
        ('payroll', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='salarystructure',
            name='company',
            field=models.ForeignKey(
                default=1,  # Default to first company, adjust as needed
                on_delete=django.db.models.deletion.CASCADE,
                related_name='salary_structures',
                to='accounts.company'
            ),
        ),
    ]
