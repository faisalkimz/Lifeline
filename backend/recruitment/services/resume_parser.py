import re
import io
import pdfplumber
import docx
import spacy
from spacy.matcher import Matcher

# Load spacy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if model not downloaded
    nlp = None

class ResumeParsingService:
    @staticmethod
    def extract_text_from_pdf(pdf_file):
        try:
            text = ""
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    @staticmethod
    def extract_text_from_docx(docx_file):
        try:
            doc = docx.Document(docx_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return ""

    @staticmethod
    def parse_resume_text(text):
        """
        An NLP-based parser to extract info from resume text.
        """
        parsed_data = {
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": "",
            "skills": [],
            "experience_years": 0,
            "raw_text_preview": text[:500] + "..." if len(text) > 500 else text
        }

        # 1. Regex for Email and Phone
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'\+?\d[\d\s-]{8,}\d'
        
        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        
        parsed_data["email"] = email_match.group(0) if email_match else ""
        parsed_data["phone"] = phone_match.group(0) if phone_match else ""

        # 2. NLP part (Name and Skills)
        if nlp:
            doc = nlp(text)
            
            # Extract Name (PERSON entities)
            person_entities = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
            if person_entities:
                full_name = person_entities[0]
                name_parts = full_name.split()
                if len(name_parts) >= 1:
                    parsed_data["first_name"] = name_parts[0]
                    if len(name_parts) > 1:
                        parsed_data["last_name"] = " ".join(name_parts[1:])

            # Extract Skills
            skill_keywords = [
                'Python', 'Django', 'React', 'JavaScript', 'TypeScript', 'Node.js', 
                'SQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Project Management',
                'HR', 'Accounting', 'Sales', 'Marketing', 'UI/UX', 'Figma', 'Java', 'C++',
                'PHP', 'Laravel', 'Vue.js', 'Angular', 'DevOps', 'Agile', 'Scrum'
            ]
            found_skills = []
            for skill in skill_keywords:
                if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                    found_skills.append(skill)
            parsed_data["skills"] = list(set(found_skills))

        else:
            # Fallback simple parsing if NLP fails
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            if lines:
                name = lines[0]
                if len(name.split()) <= 4:
                    name_parts = name.split()
                    parsed_data["first_name"] = name_parts[0]
                    if len(name_parts) > 1:
                        parsed_data["last_name"] = " ".join(name_parts[1:])

        return parsed_data
