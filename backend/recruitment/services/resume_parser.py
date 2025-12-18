import PyPDF2
import re
import io

class ResumeParsingService:
    @staticmethod
    def extract_text_from_pdf(pdf_file):
        try:
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    @staticmethod
    def parse_resume_text(text):
        """
        A rule-based parser to extract basic info from resume text.
        In a production environment, this would use NLP (SpaCy, NLTK) or LLM APIs.
        """
        # Basic patterns
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'\+?\d[\d\s-]{8,}\d'
        
        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        
        email = email_match.group(0) if email_match else ""
        phone = phone_match.group(0) if phone_match else ""
        
        # Extract name (very basic heuristic: search for uppercase words at the start)
        # Assuming the first line or first few words might be the name
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        name = ""
        if lines:
            # Take the first line as a potential name if it's not too long
            first_line = lines[0]
            if len(first_line.split()) <= 4:
                name = first_line

        # Extract skills (simple keyword matching)
        skill_keywords = [
            'Python', 'Django', 'React', 'JavaScript', 'TypeScript', 'Node.js', 
            'SQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Project Management',
            'HR', 'Accounting', 'Sales', 'Marketing', 'UI/UX', 'Figma'
        ]
        found_skills = []
        for skill in skill_keywords:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                found_skills.append(skill)

        # Split name into first and last
        first_name = ""
        last_name = ""
        if name:
            name_parts = name.split()
            first_name = name_parts[0]
            if len(name_parts) > 1:
                last_name = " ".join(name_parts[1:])

        return {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "skills": found_skills,
            "raw_text_preview": text[:500] + "..." if len(text) > 500 else text
        }
