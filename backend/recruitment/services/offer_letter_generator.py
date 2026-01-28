import os
from io import BytesIO
from django.conf import settings
from django.core.files import File
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.units import inch

class OfferLetterGenerator:
    @staticmethod
    def generate_pdf(offer_letter):
        """
        Generate a professional PDF for an offer letter
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor("#2563eb"),  # Primary Blue
            spaceAfter=20,
            alignment=1 # Center
        )
        
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            spaceAfter=12
        )
        
        label_style = ParagraphStyle(
            'LabelStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            fontName='Helvetica-Bold'
        )

        elements = []

        # 1. Company Logo (if exists)
        company = offer_letter.application.job.company
        if company.logo:
            try:
                logo_path = company.logo.path
                img = Image(logo_path, width=1.5*inch, height=0.5*inch)
                img.hAlign = 'LEFT'
                elements.append(img)
            except:
                pass
        
        elements.append(Spacer(1, 0.5*inch))

        # 2. Header
        elements.append(Paragraph("OFFER OF EMPLOYMENT", title_style))
        elements.append(Spacer(1, 0.2*inch))

        # 3. Date and Candidate Info
        elements.append(Paragraph(f"Date: {offer_letter.created_at.strftime('%B %d, %Y')}", body_style))
        elements.append(Paragraph(f"To: {offer_letter.application.candidate.full_name}", body_style))
        elements.append(Paragraph(f"Email: {offer_letter.application.candidate.email}", body_style))
        elements.append(Spacer(1, 0.3*inch))

        # 4. Content
        elements.append(Paragraph(offer_letter.content, body_style))
        elements.append(Spacer(1, 0.3*inch))

        # 5. Financials Table
        data = [
            [Paragraph("Position", label_style), Paragraph(offer_letter.application.job.title, body_style)],
            [Paragraph("Annual Base Salary", label_style), Paragraph(f"{offer_letter.salary_offered:,.2f} {offer_letter.application.job.currency}", body_style)],
            [Paragraph("Start Date", label_style), Paragraph(offer_letter.start_date.strftime('%B %d, %Y'), body_style)],
        ]
        
        t = Table(data, colWidths=[2*inch, 3*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),
            ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.grey),
            ('BOX', (0, 0), (-1, -1), 0.25, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.5*inch))

        # 6. Conclusion
        elements.append(Paragraph("We are excited about the possibility of you joining our team. Please don't hesitate to reach out if you have any questions.", body_style))
        elements.append(Spacer(1, 0.5*inch))

        # 7. Signature Line
        elements.append(Paragraph("__________________________", body_style))
        elements.append(Paragraph(f"Hiring Manager / HR", body_style))
        elements.append(Paragraph(f"{company.name}", body_style))

        # Build PDF
        try:
            doc.build(elements)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error building PDF for offer letter {offer_letter.id}: {str(e)}")
            raise e
        
        # Save to FileField
        filename = f"Offer_{offer_letter.application.candidate.last_name}_{offer_letter.id}.pdf"
        offer_letter.pdf_file.save(filename, File(buffer), save=True)
        buffer.close()
        
        return offer_letter.pdf_file.url
