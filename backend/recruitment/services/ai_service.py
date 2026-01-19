import re
from ..models import Application, Job, Candidate
from .resume_parser import ResumeParsingService

class RecruitingAIService:
    @staticmethod
    def calculate_match_score(resume_text, job_requirements, candidate_skills):
        """
        Calculate a score (0-100) based on how well the candidate matches the job.
        
        Logic:
        1. Parse job requirements for keywords.
        2. Check for presence of these keywords in resume_text and candidate_skills.
        3. Bonus points for 'years' of experience found.
        """
        score = 0
        
        # 1. Clean and normalize texts
        resume_text = resume_text.lower()
        job_requirements = job_requirements.lower()
        
        # 2. Extract keywords from job requirements
        # (Using a predefined set of skill keywords for better accuracy)
        skill_keywords = [
            'Python', 'Django', 'React', 'JavaScript', 'TypeScript', 'Node.js', 
            'SQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Project Management',
            'HR', 'Accounting', 'Sales', 'Marketing', 'UI/UX', 'Figma', 'Java', 'C++',
            'PHP', 'Laravel', 'Vue.js', 'Angular', 'DevOps', 'Agile', 'Scrum', 'Management',
            'Leadership', 'Communication', 'Analysis', 'Strategy'
        ]
        
        required_skills = [s.lower() for s in skill_keywords if s.lower() in job_requirements]
        
        if not required_skills:
            # If no specific skills found, use a generic matching approach
            match_score = 50
        else:
            # 3. Match against Candidate's parsed skills and raw resume
            found_skills_count = 0
            candidate_skills_list = [s.strip().lower() for s in candidate_skills.split(',') if s.strip()]
            
            for skill in required_skills:
                # Check candidate_skills property
                in_skills = any(skill in s for s in candidate_skills_list)
                # Check raw resume text
                in_resume = skill in resume_text
                
                if in_skills or in_resume:
                    found_skills_count += 1
            
            match_score = (found_skills_count / len(required_skills)) * 80  # Max 80 points for skills
            
        score += match_score
        
        # 4. Experience Matching (looking for 'X years' in resume)
        experience_match = re.search(r'(\d+)\s+(year|yr)', resume_text)
        if experience_match:
            years = int(experience_match.group(1))
            if years >= 5:
                score += 20
            elif years >= 2:
                score += 10
            else:
                score += 5
        
        # Cap at 100
        return min(round(score), 100)

    @staticmethod
    def screen_application(application):
        """
        Main entry point to screen a single application.
        """
        candidate = application.candidate
        job = application.job
        
        # Get resume text
        resume_text = ""
        if candidate.resume:
            try:
                # Rewind file if it's already been read (e.g. in previous parse)
                candidate.resume.seek(0)
                filename = candidate.resume.name.lower()
                if filename.endswith('.pdf'):
                    resume_text = ResumeParsingService.extract_text_from_pdf(candidate.resume)
                elif filename.endswith('.docx'):
                    resume_text = ResumeParsingService.extract_text_from_docx(candidate.resume)
            except Exception as e:
                print(f"Error reading resume for AI screening: {e}")
        
        # Fallback to summary if no resume text could be extracted
        if not resume_text:
            resume_text = f"{candidate.summary} {candidate.skills}"
            
        score = RecruitingAIService.calculate_match_score(
            resume_text, 
            job.requirements, 
            candidate.skills
        )
        
        application.score = score
        
        # Auto-update notes with AI feedback
        ai_notes = f"--- AI Screening Output ({timezone_now_str()}) ---\n"
        ai_notes += f"Match Score: {score}%\n"
        if score >= 80:
            ai_notes += "Recommendation: Highly Recommended (Strong match in skills and experience).\n"
        elif score >= 50:
            ai_notes += "Recommendation: Qualified (Meets most requirements, worth interviewing).\n"
        else:
            ai_notes += "Recommendation: Underqualified (Consider for other roles or reject).\n"
        
        # Append to existing notes
        application.notes = f"{application.notes}\n\n{ai_notes}" if application.notes else ai_notes
        application.save()
        
        return score

def timezone_now_str():
    from django.utils import timezone
    return timezone.now().strftime("%Y-%m-%d %H:%M")
