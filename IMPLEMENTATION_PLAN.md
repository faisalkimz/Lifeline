# LahHR - Production-Grade HR & Recruitment System
## Implementation Plan & Technical Specification

---

## 📋 Executive Summary

**LahHR** is a next-generation Applicant Tracking System (ATS) and HR Management platform designed to compete with industry leaders like Workable, Greenhouse, and BambooHR. Built using Django, React, and TailwindCSS, LahHR combines powerful automation, intelligent candidate matching, and seamless job board integrations to revolutionize the hiring process.

### Core Value Propositions
- **Multi-Channel Job Distribution**: Post to LinkedIn, Indeed, Glassdoor, Fuzu, and 20+ job boards from a single interface
- **AI-Powered Candidate Matching**: Smart resume parsing with intelligent candidate ranking
- **Collaborative Hiring**: Team-based evaluation with structured feedback workflows
- **Compliance-First Design**: GDPR/data protection built-in from day one
- **Mobile-First Experience**: Fully responsive for recruiters and candidates
- **100% Human-Engineered**: Professional, polished UI that feels enterprise-grade

---

## 🏗️ System Architecture

### Technology Stack

#### Backend
- **Framework**: Django 5.0+ with Django REST Framework (DRF)
- **Database**: SQLite (development) → PostgreSQL/MySQL (production-ready migration path)
- **Authentication**: JWT (JSON Web Tokens) with refresh token rotation
- **Task Queue**: Celery with Redis for async job processing
- **Email**: Django Email with SMTP (SendGrid/AWS SES integration)
- **File Storage**: Local (dev) → AWS S3/Cloudinary (production)
- **API Documentation**: drf-spectacular (OpenAPI 3.0)

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with RTK Query for API caching
- **Styling**: TailwindCSS 3.x with custom design system
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite (fast builds, HMR)

#### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, Black, Flake8
- **Testing**: Pytest (backend), Vitest + React Testing Library (frontend)
- **Version Control**: Git with conventional commits

---

## 🎯 Core Features & Modules

### 1. **Multi-Tenant Job Posting System**
**Priority**: Critical | **Sprint**: 1-2

#### Features:
- **Universal Job Creation**: Single form creates jobs for multiple boards
- **Template System**: Save and reuse job templates
- **Smart Distribution**:
  - LinkedIn (via Talent Solutions Partner API)
  - Indeed (Job Posting API)
  - Glassdoor (Employer API)
  - Fuzu (Custom integration)
  - Company career page
  - Social media integrations (Twitter, Facebook)

#### Technical Implementation:
```python
# Django Models
- Job (title, description, requirements, salary range, location, remote_ok)
- JobPosting (job, platform, external_id, status, posted_at)
- JobTemplate (name, template_data, created_by)

# API Endpoints
POST /api/jobs/ - Create job
POST /api/jobs/{id}/publish/ - Publish to selected platforms
GET /api/jobs/{id}/analytics/ - View performance metrics
```

#### Data Flow:
1. HR creates job in LahHR
2. System validates and formats for each platform
3. Background task distributes via platform APIs
4. Webhooks sync application data back to LahHR
5. Unified candidate database across all sources

---

### 2. **Intelligent Applicant Tracking System (ATS)**
**Priority**: Critical | **Sprint**: 2-3

#### Features:
- **Resume Parsing**: Extract structured data from PDF/DOCX resumes
- **Candidate Pipeline**: Customizable stages (Applied → Screening → Interview → Offer)
- **Drag-and-Drop Management**: Visual Kanban board
- **Bulk Actions**: Move, reject, or email multiple candidates
- **Duplicate Detection**: AI-powered candidate deduplication
- **Skills Matching**: Auto-rank candidates by job requirements

#### Technical Implementation:
```python
# Django Models
- Candidate (name, email, phone, resume_file, linkedin_url, source)
- Application (candidate, job, status, stage, score, applied_at)
- CandidateSkill (candidate, skill, proficiency_level)
- ApplicationStage (name, order, job, is_final)

# Resume Parsing (Third-party or Custom)
- PyMuPDF/pdfplumber for PDF extraction
- python-docx for Word documents
- spaCy/transformers for NER (Named Entity Recognition)
- Regex patterns for email, phone, skills extraction
```

#### Pipeline Stages:
1. **New Applications** (auto-imported from job boards)
2. **Screening** (AI ranking + manual review)
3. **Phone Screen** (scheduled calls)
4. **Technical Interview** (feedback collection)
5. **Final Interview** (hiring manager approval)
6. **Offer Extended** (offer letter generation)
7. **Hired** (onboarding initiation)

---

### 3. **Interview Management & Scheduling**
**Priority**: High | **Sprint**: 3-4

#### Features:
- **Calendar Integration**: Google Calendar, Outlook sync
- **Automated Scheduling**: Send availability, candidate picks slot
- **Video Interview Links**: Integrate Zoom/Google Meet
- **Interview Feedback Forms**: Structured evaluation templates
- **Collaborative Scoring**: Team-based candidate assessment
- **Interview History**: Complete audit trail

#### Technical Implementation:
```python
# Django Models
- Interview (application, date_time, interview_type, location/link, status)
- InterviewPanel (interview, interviewer, role)
- InterviewFeedback (interview, interviewer, rating, notes, recommendation)
- InterviewTemplate (name, questions, duration)

# API Integrations
- Google Calendar API (OAuth 2.0)
- Microsoft Graph API (Outlook)
- Zoom API (meeting creation)
```

---

### 4. **Candidate Communication Hub**
**Priority**: High | **Sprint**: 4

#### Features:
- **Email Templates**: Customizable templates for each stage
- **Bulk Emailing**: Send updates to multiple candidates
- **SMS Notifications**: Appointment reminders (Twilio integration)
- **In-App Messaging**: Real-time chat with candidates
- **Automated Workflows**: Trigger emails on status changes
- **Email Tracking**: Open rates, click tracking

#### Technical Implementation:
```python
# Django Models
- EmailTemplate (name, subject, body, template_vars, trigger_event)
- CandidateMessage (application, sender, message, sent_at, read_at)
- SMSLog (candidate, message, sent_at, status)

# Celery Tasks
@shared_task
def send_bulk_emails(application_ids, template_id):
    # Queue emails for async delivery
    pass

@shared_task
def send_interview_reminder(interview_id, hours_before=24):
    # SMS/Email reminder before interview
    pass
```

---

### 5. **Analytics & Reporting Dashboard**
**Priority**: Medium | **Sprint**: 5

#### Features:
- **Recruitment Metrics**:
  - Time-to-hire (average days from posting to hire)
  - Cost-per-hire (advertising spend, platform fees)
  - Source effectiveness (which job boards yield best candidates)
  - Funnel conversion rates (stage-to-stage drop-off)
- **Diversity & Inclusion Metrics**: Gender, age, location distribution
- **Hiring Manager Performance**: Interview completion rates
- **Custom Reports**: Exportable to PDF/Excel

#### Technical Implementation:
```python
# Django Aggregations
from django.db.models import Count, Avg, F, ExpressionWrapper, DurationField

# Example Queries
avg_time_to_hire = Application.objects.filter(
    status='hired'
).annotate(
    duration=ExpressionWrapper(
        F('hired_at') - F('applied_at'),
        output_field=DurationField()
    )
).aggregate(Avg('duration'))

# Chart.js on frontend for visualizations
```

---

### 6. **Role-Based Access Control (RBAC)**
**Priority**: Critical | **Sprint**: 1

#### User Roles:
- **Super Admin**: Full system access, company settings
- **HR Manager**: Manage jobs, candidates, team members
- **Recruiter**: Manage assigned jobs, view candidates, schedule interviews
- **Hiring Manager**: Review candidates for specific departments, provide feedback
- **Interviewer**: Access assigned interviews, submit feedback

#### Technical Implementation:
```python
# Django Models
- User (extends AbstractUser: email, first_name, last_name, role)
- Company (name, logo, settings)
- Department (name, company, manager)
- TeamMember (user, company, department, role, permissions)

# DRF Permissions
class IsHRManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['hr_manager', 'super_admin']
```

---

### 7. **Job Board Integrations**
**Priority**: Critical | **Sprint**: 2-6

#### Integration Strategy:

##### **LinkedIn Integration** (Partner API Required)
- **Cost**: Requires LinkedIn Talent Solutions Partnership
- **Alternative**: Use LinkedIn's "Apply with LinkedIn" button → redirect to LahHR
- **Data Sync**: Profile data via OAuth consent

##### **Indeed Integration** (Public API Available)
- **Job Posting API**: Automated job creation
- **Indeed Apply**: Capture applications via webhook
- **Cost**: Pay-per-click or sponsored postings

##### **Glassdoor Integration** (Employer Access)
- **Employer API**: Post jobs, retrieve reviews
- **Data**: Company ratings, salary data
- **Alternative**: Web scraping (use cautiously, check ToS)

##### **Fuzu & Regional Boards**
- **API Investigation**: Contact Fuzu for partnership
- **Fallback**: Email-to-apply system (parse incoming emails)
- **Custom Adapters**: Build platform-specific integrations

#### Technical Architecture:
```python
# Adapter Pattern for Job Boards
class BaseJobBoardAdapter:
    def authenticate(self):
        pass
    
    def create_job(self, job_data):
        pass
    
    def fetch_applications(self, job_id):
        pass
    
    def close_job(self, external_job_id):
        pass

class LinkedInAdapter(BaseJobBoardAdapter):
    # LinkedIn-specific implementation
    pass

class IndeedAdapter(BaseJobBoardAdapter):
    # Indeed-specific implementation
    pass

# Django Settings
JOB_BOARD_ADAPTERS = {
    'linkedin': 'integrations.adapters.LinkedInAdapter',
    'indeed': 'integrations.adapters.IndeedAdapter',
    'glassdoor': 'integrations.adapters.GlassdoorAdapter',
    'fuzu': 'integrations.adapters.FuzuAdapter',
}
```

---

## 🎨 UI/UX Design Philosophy

### Design Principles
1. **Professional, Not Playful**: Enterprise-grade aesthetics
2. **Data-Dense, Not Cluttered**: Efficient information hierarchy
3. **Predictable Interactions**: Familiar patterns (no experimental UX)
4. **Accessibility-First**: WCAG 2.1 AA compliance

### Design System

#### Color Palette
```css
/* Primary Colors - Professional Blues */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6; /* Main brand color */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-900: #1e3a8a;

/* Neutral Grays */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #06b6d4;
```

#### Typography
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

#### Components
- **Buttons**: Solid, outline, ghost variants with loading states
- **Forms**: Floating labels, inline validation, error messages
- **Tables**: Sortable columns, row actions, pagination
- **Cards**: Elevation levels, hover states, click affordances
- **Modals**: Center-aligned, backdrop blur, smooth transitions
- **Toasts**: Top-right notifications with auto-dismiss

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50),
    company_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Companies
CREATE TABLE companies (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY,
    company_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    location VARCHAR(255),
    remote_ok BOOLEAN DEFAULT FALSE,
    employment_type VARCHAR(50),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Job Postings (External Platforms)
CREATE TABLE job_postings (
    id INTEGER PRIMARY KEY,
    job_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    status VARCHAR(50),
    posted_at TIMESTAMP,
    expires_at TIMESTAMP,
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    UNIQUE(job_id, platform)
);

-- Candidates
CREATE TABLE candidates (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    resume_url VARCHAR(500),
    resume_text TEXT,
    location VARCHAR(255),
    current_company VARCHAR(255),
    current_title VARCHAR(255),
    years_experience INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications
CREATE TABLE applications (
    id INTEGER PRIMARY KEY,
    job_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'applied',
    stage VARCHAR(100) DEFAULT 'new',
    score INTEGER, -- AI matching score 0-100
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP,
    hired_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    UNIQUE(job_id, candidate_id)
);

-- Interviews
CREATE TABLE interviews (
    id INTEGER PRIMARY KEY,
    application_id INTEGER NOT NULL,
    interview_type VARCHAR(50),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    video_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'scheduled',
    created_by INTEGER,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Interview Feedback
CREATE TABLE interview_feedback (
    id INTEGER PRIMARY KEY,
    interview_id INTEGER NOT NULL,
    interviewer_id INTEGER NOT NULL,
    rating INTEGER, -- 1-5 stars
    technical_skills INTEGER,
    communication INTEGER,
    culture_fit INTEGER,
    notes TEXT,
    recommendation VARCHAR(50), -- 'strong_yes', 'yes', 'no', 'strong_no'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id)
);
```

---

## 🔐 Security & Compliance

### Authentication & Authorization
- **JWT Tokens**: 15-minute access tokens, 7-day refresh tokens
- **Password Policy**: Min 8 chars, uppercase, lowercase, number, special char
- **Rate Limiting**: 100 req/min per user, 1000 req/hour per company
- **Session Management**: Secure cookies, HttpOnly, SameSite=Strict

### Data Protection
- **HTTPS Only**: Force SSL in production
- **Encryption at Rest**: Sensitive fields (SSN, salary) encrypted
- **PII Handling**: GDPR-compliant data export/deletion
- **Audit Logs**: Track all candidate data access

### File Upload Security
- **Validation**: Whitelist extensions (.pdf, .docx, .txt)
- **Virus Scanning**: ClamAV integration for resume uploads
- **Size Limits**: Max 5MB per resume
- **Sandboxed Storage**: Serve files from CDN, not application server

---

## 📱 Mobile Experience

### Responsive Breakpoints
```css
/* TailwindCSS Config */
theme: {
  screens: {
    'sm': '640px',   // Mobile landscape
    'md': '768px',   // Tablet portrait
    'lg': '1024px',  // Tablet landscape / Small laptop
    'xl': '1280px',  // Desktop
    '2xl': '1536px', // Large desktop
  }
}
```

### Mobile-Specific Features
- **Candidate Mobile App** (Future Phase):
  - Apply quick-apply from mobile
  - Upload resume via camera scan
  - Track application status
  - Receive interview notifications
  
- **Recruiter Mobile**:
  - Review candidates on-the-go
  - Approve/reject applications
  - Schedule interviews
  - Submit quick feedback

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Basic ATS functionality

**Sprint 1** (Week 1-2):
- [ ] Project setup (Django + React + Docker)
- [ ] Authentication system (JWT)
- [ ] User management & RBAC
- [ ] Company multi-tenancy
- [ ] Basic UI components library

**Sprint 2** (Week 3-4):
- [ ] Job creation & management
- [ ] Career page generation
- [ ] Basic candidate database
- [ ] Simple application form
- [ ] Email notification system

**Deliverable**: Internal job postings with manual candidate entry

---

### Phase 2: Job Board Integrations (Weeks 5-8)
**Goal**: Multi-channel job distribution

**Sprint 3** (Week 5-6):
- [ ] Indeed API integration
- [ ] Job posting adapter pattern
- [ ] Application webhook handlers
- [ ] Resume parsing (basic)

**Sprint 4** (Week 7-8):
- [ ] LinkedIn integration (Apply with LinkedIn)
- [ ] Glassdoor employer feed
- [ ] Fuzu custom integration
- [ ] Application deduplication

**Deliverable**: Post jobs to 3+ platforms, auto-import candidates

---

### Phase 3: ATS Workflows (Weeks 9-12)
**Goal**: Complete hiring pipeline

**Sprint 5** (Week 9-10):
- [ ] Kanban pipeline board
- [ ] Candidate scoring algorithm
- [ ] Bulk actions (email, move, reject)
- [ ] Advanced search & filters

**Sprint 6** (Week 11-12):
- [ ] Interview scheduling
- [ ] Calendar integrations
- [ ] Interview feedback forms
- [ ] Collaborative hiring tools

**Deliverable**: End-to-end hiring workflow from application to offer

---

### Phase 4: Intelligence & Automation (Weeks 13-16)
**Goal**: AI-powered features

**Sprint 7** (Week 13-14):
- [ ] Advanced resume parsing (NER)
- [ ] Smart candidate matching
- [ ] Auto-response email workflows
- [ ] Interview reminder automation

**Sprint 8** (Week 15-16):
- [ ] Analytics dashboard
- [ ] Custom reporting
- [ ] Export functionality (CSV, PDF)
- [ ] Performance optimizations

**Deliverable**: Market-ready ATS with automation

---

### Phase 5: Polish & Launch (Weeks 17-20)
**Goal**: Production release

**Sprint 9** (Week 17-18):
- [ ] UI/UX refinement
- [ ] Accessibility audit
- [ ] Security penetration testing
- [ ] Load testing (1000+ concurrent users)

**Sprint 10** (Week 19-20):
- [ ] Documentation (user guides, API docs)
- [ ] Onboarding tutorials
- [ ] Marketing website
- [ ] Beta customer onboarding

**Deliverable**: LahHR 1.0 Public Launch

---

## 🛠️ Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/your-org/lah-hr.git
cd lah-hr

# Start development environment
docker-compose up -d

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm run dev

# Access application
# Backend API: http://localhost:8000
# Frontend: http://localhost:5173
# Admin: http://localhost:8000/admin
```

---

## 📊 Success Metrics

### Technical KPIs
- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 2s (First Contentful Paint)
- **Uptime**: 99.9% availability
- **Test Coverage**: > 80% (backend), > 70% (frontend)

### Business KPIs
- **Time-to-Hire Reduction**: 30% faster than manual process
- **Candidate Experience**: NPS > 50
- **User Adoption**: 100 companies in first year
- **Revenue**: SaaS pricing $99/month (starter) to $499/month (enterprise)

---

## 💰 Monetization Strategy

### Pricing Tiers

**Free Tier** (Proof of Concept):
- 1 active job posting
- 50 candidates/month
- Basic analytics
- Career page

**Starter** - $99/month:
- 5 active jobs
- 500 candidates/month
- Email support
- 2 team members
- Basic integrations (Indeed, career page)

**Professional** - $299/month:
- 20 active jobs
- Unlimited candidates
- All integrations (LinkedIn, Glassdoor, Fuzu)
- 10 team members
- Priority support
- Custom branding

**Enterprise** - $499/month:
- Unlimited jobs
- Unlimited candidates
- Dedicated account manager
- Custom integrations
- SSO (Single Sign-On)
- Advanced analytics
- API access

---

## 🎓 Human-Centered Engineering Practices

### Code Quality Standards
- **No AI-Generated Comments**: Write clear, self-documenting code
- **Meaningful Names**: `calculate_candidate_match_score()` not `calc_score()`
- **Consistent Patterns**: Follow Django/React conventions rigorously
- **Error Handling**: User-friendly messages, detailed logs

### Git Workflow
```bash
# Conventional Commits
feat: add LinkedIn job posting integration
fix: resolve resume parsing for special characters
docs: update API documentation for jobs endpoint
refactor: extract job board adapters to separate module
test: add unit tests for candidate scoring algorithm
```

### Code Review Checklist
- [ ] No console.log() or print() statements in production code
- [ ] All strings externalized for i18n
- [ ] Error boundaries in React components
- [ ] Database queries optimized (avoid N+1)
- [ ] Security: No SQL injection, XSS vulnerabilities
- [ ] Accessibility: Keyboard navigation, ARIA labels

---

## 📚 Documentation Standards

### Code Documentation
```python
# Python (Google-style docstrings)
def calculate_match_score(candidate: Candidate, job: Job) -> int:
    """
    Calculate how well a candidate matches job requirements.
    
    Analyzes candidate skills, experience, and location against
    job criteria to produce a compatibility score.
    
    Args:
        candidate: The candidate to evaluate
        job: The job posting to match against
        
    Returns:
        Integer score from 0-100, where 100 is a perfect match
        
    Raises:
        ValueError: If candidate or job is None
    """
    pass
```

```typescript
// TypeScript (JSDoc)
/**
 * Fetches paginated list of job applications
 * @param jobId - Unique identifier of the job
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of results per page
 * @returns Promise resolving to paginated application data
 */
async function getApplications(
  jobId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<Application>> {
  // Implementation
}
```

---

## 🔄 Migration Path to Production Database

### SQLite → PostgreSQL
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'lah_hr'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Migration command
python manage.py dumpdata > backup.json  # Export from SQLite
# Change DATABASES setting
python manage.py migrate
python manage.py loaddata backup.json  # Import to PostgreSQL
```

---

## 🌍 Internationalization (Future Feature)

### Supported Languages (Phase 2)
- English (default)
- French (common in East Africa)
- Swahili (regional)

### Implementation
```python
# Django
from django.utils.translation import gettext_lazy as _

class Job(models.Model):
    title = models.CharField(max_length=255, verbose_name=_("Job Title"))
```

```typescript
// React (react-i18next)
import { useTranslation } from 'react-i18next';

function JobCard() {
  const { t } = useTranslation();
  return <h2>{t('jobs.title')}</h2>;
}
```

---

## 🏁 Conclusion

**LahHR** is positioned to disrupt the ATS market by combining:
1. **Technical Excellence**: Modern stack, scalable architecture
2. **Feature Parity**: Match incumbent capabilities
3. **Competitive Differentiation**: Superior UX, affordable pricing
4. **Market Focus**: Underserved regions (Africa, emerging markets)

**Next Steps**:
1. Review and approve this plan
2. Set up development environment
3. Begin Sprint 1 (Authentication & User Management)
4. Weekly progress reviews and iteration

Ready to build something exceptional? Let's ship LahHR! 🚀
