# Resume Parser Utility
# Extracts structured data from PDF and DOCX resumes

import re
import pdfplumber
import docx
from datetime import datetime

class ResumeParser:
    """
    Parse resumes in PDF or DOCX format and extract structured information
    """
    
    def __init__(self, file_path):
        self.file_path = file_path
        self.text = ""
        self.parsed_data = {
            'name': '',
            'email': '',
            'phone': '',
            'skills': [],
            'experience': [],
            'education': [],
            'summary': ''
        }
    
    def extract_text(self):
        """Extract text from PDF or DOCX file"""
        if self.file_path.endswith('.pdf'):
            return self._extract_from_pdf()
        elif self.file_path.endswith('.docx'):
            return self._extract_from_docx()
        else:
            raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")
    
    def _extract_from_pdf(self):
        """Extract text from PDF using pdfplumber"""
        text = ""
        try:
            with pdfplumber.open(self.file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            raise Exception(f"Error extracting PDF: {str(e)}")
        return text
    
    def _extract_from_docx(self):
        """Extract text from DOCX"""
        text = ""
        try:
            doc = docx.Document(self.file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting DOCX: {str(e)}")
        return text
    
    def extract_email(self, text):
        """Extract email address using regex"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails[0] if emails else ''
    
    def extract_phone(self, text):
        """Extract phone number using regex"""
        # Matches various phone formats including international
        phone_patterns = [
            r'\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\+\d{1,3}\s?\d{9,}',
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                # Clean up the phone number
                phone = re.sub(r'[^\d+]', '', phones[0])
                return phone
        return ''
    
    def extract_name(self, text):
        """
        Extract name from resume
        Usually the first line or first few words
        """
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line.split()) <= 4 and len(line) > 3:
                # Basic heuristic: name is usually 2-4 words, not too long
                if not any(char.isdigit() for char in line) and '@' not in line:
                    return line
        return ''
    
    def extract_skills(self, text):
        """
        Extract skills from resume
        Looks for common skill keywords
        """
        # Common technical and soft skills
        skill_keywords = [
            # Programming
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'laravel',
            'html', 'css', 'sass', 'tailwind', 'bootstrap',
            # Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
            # Data Science
            'machine learning', 'deep learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch',
            # Soft Skills
            'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
            'agile', 'scrum', 'kanban',
            # Other
            'excel', 'powerpoint', 'word', 'jira', 'confluence', 'slack'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        # Remove duplicates and return
        return list(set(found_skills))
    
    def extract_experience(self, text):
        """
        Extract work experience
        Looks for date patterns and company names
        """
        experience = []
        lines = text.split('\n')
        
        # Look for date patterns like "2020-2023", "Jan 2020 - Present", etc.
        date_pattern = r'\b(19|20)\d{2}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(19|20)\d{2}\b'
        
        for i, line in enumerate(lines):
            if re.search(date_pattern, line):
                # Found a potential experience entry
                exp_entry = {
                    'period': line.strip(),
                    'details': lines[i+1].strip() if i+1 < len(lines) else ''
                }
                experience.append(exp_entry)
        
        return experience[:5]  # Return top 5 experiences
    
    def extract_education(self, text):
        """
        Extract education information
        Looks for degree keywords
        """
        education = []
        degree_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate',
            'bsc', 'msc', 'ba', 'ma', 'mba', 'b.tech', 'm.tech'
        ]
        
        lines = text.split('\n')
        text_lower = text.lower()
        
        for keyword in degree_keywords:
            if keyword in text_lower:
                # Find the line containing the degree
                for line in lines:
                    if keyword in line.lower():
                        education.append(line.strip())
                        break
        
        return list(set(education))[:3]  # Return top 3 unique education entries
    
    def parse(self):
        """
        Main parsing method
        Extracts all information from resume
        """
        # Extract text
        self.text = self.extract_text()
        
        if not self.text:
            raise Exception("No text could be extracted from the resume")
        
        # Extract structured data
        self.parsed_data['name'] = self.extract_name(self.text)
        self.parsed_data['email'] = self.extract_email(self.text)
        self.parsed_data['phone'] = self.extract_phone(self.text)
        self.parsed_data['skills'] = self.extract_skills(self.text)
        self.parsed_data['experience'] = self.extract_experience(self.text)
        self.parsed_data['education'] = self.extract_education(self.text)
        
        # Extract summary (first paragraph after name)
        lines = [l.strip() for l in self.text.split('\n') if l.strip()]
        if len(lines) > 2:
            self.parsed_data['summary'] = ' '.join(lines[1:3])
        
        return self.parsed_data
    
    def to_dict(self):
        """Return parsed data as dictionary"""
        return self.parsed_data


def parse_resume(file_path):
    """
    Convenience function to parse a resume file
    
    Args:
        file_path: Path to the resume file (PDF or DOCX)
    
    Returns:
        Dictionary containing parsed resume data
    """
    parser = ResumeParser(file_path)
    return parser.parse()
