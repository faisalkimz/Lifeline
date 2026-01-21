import logging
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

class PayrollEmailService:
    @staticmethod
    def send_payslip_email(payslip):
        """
        Send payslip PDF to employee via email
        """
        try:
            employee = payslip.employee
            if not employee.email:
                logger.error(f"Employee {employee.full_name} has no email address.")
                return False, "Employee has no email address."

            subject = f"Payslip for {payslip.payroll_run.month:02d}/{payslip.payroll_run.year} - {employee.full_name}"
            
            context = {
                'employee_name': employee.full_name,
                'period': f"{payslip.payroll_run.month:02d}/{payslip.payroll_run.year}",
                'company_name': payslip.payroll_run.company.name,
            }
            
            # Simple HTML template for email body
            html_message = f"""
            <html>
                <body>
                    <p>Dear {employee.full_name},</p>
                    <p>Please find attached your payslip for the period {payslip.payroll_run.month:02d}/{payslip.payroll_run.year}.</p>
                    <p>Best regards,<br>{payslip.payroll_run.company.name} Payroll Team</p>
                </body>
            </html>
            """
            
            email = EmailMessage(
                subject,
                html_message,
                settings.DEFAULT_FROM_EMAIL,
                [employee.email],
            )
            email.content_subtype = "html"
            
            # Attach PDF
            if payslip.pdf_file:
                email.attach(
                    f"Payslip_{employee.last_name}_{payslip.payroll_run.month}_{payslip.payroll_run.year}.pdf",
                    payslip.pdf_file.read(),
                    "application/pdf"
                )
            else:
                # Generate PDF if it doesn't exist
                from .payslip_generator import PayslipGenerator
                PayslipGenerator.generate_pdf(payslip)
                payslip.refresh_from_db()
                if payslip.pdf_file:
                    email.attach(
                        f"Payslip_{employee.last_name}_{payslip.payroll_run.month}_{payslip.payroll_run.year}.pdf",
                        payslip.pdf_file.read(),
                        "application/pdf"
                    )
                else:
                    return False, "Could not generate or find payslip PDF."

            email.send()
            return True, "Email sent successfully."

        except Exception as e:
            logger.error(f"Error sending payslip email: {str(e)}")
            return False, str(e)
