import os
import qrcode
from io import BytesIO
from django.conf import settings
from django.core.files import File
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.units import inch

class PayslipGenerator:
    @staticmethod
    def generate_pdf(payslip):
        """
        Generate a professional PDF for a payslip
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        styles = getSampleStyleSheet()
        
        # Custom Styles
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor("#2563eb"),
            spaceAfter=10,
            alignment=1
        )
        
        normal_style = ParagraphStyle(
            'NormalStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14
        )
        
        bold_style = ParagraphStyle(
            'BoldStyle',
            parent=normal_style,
            fontName='Helvetica-Bold'
        )

        elements = []

        # 1. Company Logo and Name
        company = payslip.payroll_run.company
        if company.logo:
            try:
                logo_path = company.logo.path
                img = Image(logo_path, width=1.5*inch, height=0.5*inch)
                img.hAlign = 'LEFT'
                elements.append(img)
            except:
                pass
        
        elements.append(Paragraph(company.name.upper(), bold_style))
        elements.append(Spacer(1, 0.2*inch))

        # 2. Header
        elements.append(Paragraph("PAYSLIP", header_style))
        elements.append(Paragraph(f"Period: {payslip.payroll_run.month:02d}/{payslip.payroll_run.year}", ParagraphStyle('SubHeader', parent=normal_style, alignment=1)))
        elements.append(Spacer(1, 0.4*inch))

        # 3. Employee Info
        employee = payslip.employee
        info_data = [
            [Paragraph("Employee Name:", bold_style), Paragraph(employee.full_name, normal_style), 
             Paragraph("Employee ID:", bold_style), Paragraph(str(employee.employee_number), normal_style)],
            [Paragraph("Bank:", bold_style), Paragraph("Bank Transfer", normal_style), 
             Paragraph("Payment Method:", bold_style), Paragraph(payslip.get_payment_method_display(), normal_style)],
        ]
        
        info_table = Table(info_data, colWidths=[1.2*inch, 1.8*inch, 1.2*inch, 1.8*inch])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.3*inch))

        # 4. Earnings and Deductions Table
        earnings = [
            [Paragraph("EARNINGS", bold_style), Paragraph("AMOUNT", bold_style)],
            ["Basic Salary", f"{payslip.basic_salary:,.2f}"],
            ["Allowances", f"{payslip.housing_allowance + payslip.transport_allowance + payslip.medical_allowance + payslip.lunch_allowance + payslip.other_allowances:,.2f}"],
            ["Bonus", f"{payslip.bonus:,.2f}"],
        ]
        
        deductions = [
            [Paragraph("DEDUCTIONS", bold_style), Paragraph("AMOUNT", bold_style)],
            ["PAYE Tax", f"{payslip.paye_tax:,.2f}"],
            ["NSSF (Employee)", f"{payslip.nssf_employee:,.2f}"],
            ["Other Deductions", f"{payslip.other_deductions + payslip.loan_deduction + payslip.advance_deduction:,.2f}"],
        ]
        
        # Combine into one table
        data = [
            [Table(earnings, colWidths=[1.8*inch, 1*inch]), Table(deductions, colWidths=[1.8*inch, 1*inch])]
        ]
        
        main_table = Table(data, colWidths=[3*inch, 3*inch])
        main_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ]))
        elements.append(main_table)
        elements.append(Spacer(1, 0.3*inch))

        # 5. Net Pay Summary
        summary_data = [
            [Paragraph("GROSS PAY", bold_style), f"{payslip.gross_salary:,.2f}"],
            [Paragraph("TOTAL DEDUCTIONS", bold_style), f"{payslip.total_deductions:,.2f}"],
            [Paragraph("NET PAY", ParagraphStyle('NetStyle', parent=bold_style, fontSize=14, textColor=colors.HexColor("#059669"))), 
             f"{payslip.net_salary:,.2f}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[4*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('LINEABOVE', (0,2), (1,2), 1, colors.black),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.5*inch))

        # 6. QR Code for Verification
        qr_data = f"Verifier: Lifeline HRMS\nPayslip ID: {payslip.id}\nEmployee: {employee.full_name}\nNet Pay: {payslip.net_salary:,.2f}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer)
        qr_buffer.seek(0)
        
        qr_platypus_img = Image(qr_buffer, width=1*inch, height=1*inch)
        qr_platypus_img.hAlign = 'RIGHT'
        elements.append(qr_platypus_img)
        elements.append(Paragraph("Scan to Verify", ParagraphStyle('QRLabel', parent=normal_style, alignment=2, fontSize=8)))

        # Build PDF
        doc.build(elements)
        
        # Save to FileField
        filename = f"Payslip_{employee.last_name}_{payslip.payroll_run.month}_{payslip.payroll_run.year}.pdf"
        payslip.pdf_file.save(filename, File(buffer), save=True)
        buffer.close()
        
        return payslip.pdf_file.url
