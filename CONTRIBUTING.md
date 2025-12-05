# Contributing to LahHR

Thank you for your interest in contributing to **LahHR**! We're building a production-grade ATS that can compete with industry leaders, and we need exceptional contributors who share our commitment to quality.

---

## 🎯 Our Engineering Philosophy

### 100% Human-Engineered Code

We are committed to writing code that feels genuinely human-crafted, not AI-generated. This means:

1. **Clear, Self-Documenting Code** - Variable names explain intent, not just type
2. **Thoughtful Architecture** - Patterns chosen for maintainability, not shortcuts
3. **Meaningful Comments** - Explain "why", not "what" (the code shows "what")
4. **Consistent Style** - Follow language conventions rigorously
5. **User-Centric Design** - Every feature solves a real recruiter pain point

### Quality Over Speed

We'd rather ship great software slowly than mediocre software quickly:
- ✅ Write tests for all new features
- ✅ Refactor when code smells bad
- ✅ Ask for design review on complex changes
- ✅ Update documentation when behavior changes
- ❌ Ship broken features "to meet deadlines"

---

## 🛠️ Development Setup

### Prerequisites
- **Python** 3.11+
- **Node.js** 18+
- **Docker** and Docker Compose
- **Git** 2.30+
- **Code Editor** (VS Code recommended)

### First-Time Setup

1. **Fork and Clone**
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/lah-hr.git
cd lah-hr
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Testing, linting tools
python manage.py migrate
python manage.py createsuperuser
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Variables**
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your local credentials
```

5. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Celery (if needed)
cd backend
celery -A config worker -l info
```

---

## 📝 Code Style Guidelines

### Python (Backend)

#### **Follow PEP 8 with Black Formatting**
```bash
# Format code before committing
black .
isort .

# Check linting
flake8
```

#### **Naming Conventions**
```python
# ✅ Good: Clear, descriptive names
def calculate_candidate_match_score(candidate, job):
    """Calculate how well candidate matches job requirements."""
    pass

class JobPostingAdapter:
    """Abstract adapter for job board integrations."""
    pass

# ❌ Bad: Cryptic, abbreviated names
def calc_score(c, j):
    pass

class JPAdapter:
    pass
```

#### **Type Hints (Python 3.11+)**
```python
# ✅ Use type hints for function signatures
from typing import List, Optional
from api.models import Job, Candidate

def get_top_candidates(job: Job, limit: int = 10) -> List[Candidate]:
    """Retrieve top-ranked candidates for a job."""
    return Candidate.objects.filter(
        applications__job=job
    ).order_by('-applications__score')[:limit]

# Return types make code self-documenting
def find_candidate_by_email(email: str) -> Optional[Candidate]:
    try:
        return Candidate.objects.get(email=email)
    except Candidate.DoesNotExist:
        return None
```

#### **Django Best Practices**
```python
# ✅ Use Django conventions
from django.db import models
from django.utils.translation import gettext_lazy as _

class Job(models.Model):
    """Represents a job opening within a company."""
    
    title = models.CharField(
        max_length=255, 
        verbose_name=_("Job Title"),
        help_text=_("The official title of the position")
    )
    
    class Meta:
        verbose_name = _("Job")
        verbose_name_plural = _("Jobs")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"

# ❌ Avoid raw SQL unless absolutely necessary
# Instead of: Candidate.objects.raw("SELECT * FROM candidates WHERE ...")
# Use: Candidate.objects.filter(...).select_related(...).prefetch_related(...)
```

#### **DRF Serializers**
```python
from rest_framework import serializers
from api.models import Job, Company

class JobSerializer(serializers.ModelSerializer):
    """Serializer for Job model with nested company details."""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    applicant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'status', 
            'company_name', 'applicant_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_applicant_count(self, obj):
        """Count of applications for this job."""
        return obj.applications.count()
    
    def validate_title(self, value):
        """Ensure job title is not empty or generic."""
        if not value.strip():
            raise serializers.ValidationError("Job title cannot be empty")
        if value.lower() in ['untitled', 'new job']:
            raise serializers.ValidationError("Please provide a specific job title")
        return value
```

---

### TypeScript/React (Frontend)

#### **TypeScript Strict Mode**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### **Component Structure**
```typescript
// ✅ Good: Functional components with proper typing
import React from 'react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    applicantCount: number;
  };
  onApply: (jobId: string) => void;
  featured?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onApply, 
  featured = false 
}) => {
  const handleApplyClick = () => {
    onApply(job.id);
  };
  
  return (
    <div className={`job-card ${featured ? 'featured' : ''}`}>
      <h3>{job.title}</h3>
      <p>{job.company} · {job.location}</p>
      <span>{job.applicantCount} applicants</span>
      <button onClick={handleApplyClick}>Apply Now</button>
    </div>
  );
};

// ❌ Bad: Any types, no interface
export const JobCard = ({ job, onApply }: any) => {
  // ...
};
```

#### **Custom Hooks**
```typescript
// ✅ Reusable, testable hooks
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Job {
  id: string;
  title: string;
  // ... other fields
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Job[]>('/api/jobs/');
        setJobs(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return { jobs, loading, error };
}

// Usage in component
function JobsPage() {
  const { jobs, loading, error } = useJobs();
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return <JobList jobs={jobs} />;
}
```

#### **State Management (Redux Toolkit)**
```typescript
// store/slices/jobsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Job {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'closed';
}

interface JobsState {
  items: Job[];
  selectedJobId: string | null;
  filters: {
    status: string;
    search: string;
  };
}

const initialState: JobsState = {
  items: [],
  selectedJobId: null,
  filters: {
    status: 'all',
    search: '',
  },
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<Job[]>) {
      state.items = action.payload;
    },
    selectJob(state, action: PayloadAction<string>) {
      state.selectedJobId = action.payload;
    },
    updateFilter(state, action: PayloadAction<{ key: string; value: string }>) {
      state.filters[action.payload.key] = action.payload.value;
    },
  },
});

export const { setJobs, selectJob, updateFilter } = jobsSlice.actions;
export default jobsSlice.reducer;
```

---

## 🧪 Testing Standards

### Backend Tests (Pytest)

```python
# api/tests/test_jobs.py
import pytest
from django.contrib.auth.models import User
from api.models import Job, Company

@pytest.fixture
def company(db):
    """Create a test company."""
    return Company.objects.create(name="Test Corp")

@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123"
    )

@pytest.mark.django_db
class TestJobModel:
    def test_create_job(self, company, user):
        """Test creating a new job."""
        job = Job.objects.create(
            company=company,
            title="Software Engineer",
            description="Build cool stuff",
            created_by=user
        )
        
        assert job.status == 'draft'
        assert job.title == "Software Engineer"
        assert str(job) == "Software Engineer at Test Corp"
    
    def test_job_requires_title(self, company, user):
        """Test that job title is required."""
        with pytest.raises(Exception):  # IntegrityError or ValidationError
            Job.objects.create(
                company=company,
                title="",  # Empty title should fail
                created_by=user
            )

@pytest.mark.django_db
class TestJobAPI:
    def test_list_jobs(self, api_client, company, user):
        """Test GET /api/jobs/ endpoint."""
        # Create test jobs
        Job.objects.create(company=company, title="Job 1", created_by=user)
        Job.objects.create(company=company, title="Job 2", created_by=user)
        
        # Authenticate
        api_client.force_authenticate(user=user)
        
        # Get jobs
        response = api_client.get('/api/jobs/')
        
        assert response.status_code == 200
        assert len(response.data) == 2
        assert response.data[0]['title'] == "Job 2"  # Ordered by -created_at
```

### Frontend Tests (Vitest + React Testing Library)

```typescript
// components/JobCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JobCard from './JobCard';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    applicantCount: 42,
  };

  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} onApply={() => {}} />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText(/Tech Corp/)).toBeInTheDocument();
    expect(screen.getByText(/42 applicants/)).toBeInTheDocument();
  });

  it('calls onApply when apply button is clicked', () => {
    const handleApply = vi.fn();
    render(<JobCard job={mockJob} onApply={handleApply} />);
    
    const applyButton = screen.getByRole('button', { name: /apply now/i });
    fireEvent.click(applyButton);
    
    expect(handleApply).toHaveBeenCalledWith('1');
  });

  it('applies featured class when featured prop is true', () => {
    const { container } = render(
      <JobCard job={mockJob} onApply={() => {}} featured={true} />
    );
    
    expect(container.firstChild).toHaveClass('featured');
  });
});
```

### Test Coverage Requirements
- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 70% coverage
- **Critical paths** (auth, payments): 100% coverage

```bash
# Check coverage
cd backend && pytest --cov=api --cov-report=html
cd frontend && npm run test:coverage
```

---

## 📦 Pull Request Process

### 1. Create a Feature Branch
```bash
git checkout -b feature/job-board-integration

# Branch naming conventions:
# feature/feature-name - New features
# fix/bug-description - Bug fixes
# refactor/what-changed - Code refactoring
# docs/what-documented - Documentation
# test/what-tested - Test additions
```

### 2. Make Your Changes
- Write clean, well-documented code
- Add tests for new functionality
- Update documentation if behavior changes
- Follow the style guide (run linters!)

### 3. Commit with Conventional Commits
```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(jobs): add LinkedIn job posting integration"
git commit -m "fix(resume-parser): handle special characters in names"
git commit -m "docs(api): update job endpoints documentation"
git commit -m "test(candidates): add unit tests for scoring algorithm"
git commit -m "refactor(interviews): extract scheduling logic to service"

# Types: feat, fix, docs, style, refactor, test, chore
```

### 4. Push and Create PR
```bash
git push origin feature/job-board-integration

# Go to GitHub and create Pull Request
```

### 5. PR Template Checklist

Your PR should include:

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How to Test
Step-by-step instructions for reviewers to test your changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings or errors
- [ ] Works locally in dev environment

## Screenshots (if applicable)
Before/after screenshots for UI changes.
```

---

## 🔍 Code Review Guidelines

### For Authors
- Keep PRs small (< 400 lines changed)
- Respond to feedback within 24 hours
- Don't take feedback personally
- Mark conversations as resolved when addressed

### For Reviewers
- Review within 48 hours
- Be kind and constructive
- Ask questions, don't demand changes
- Approve when it's "good enough" (don't block on nitpicks)

### Review Checklist
- [ ] Code is readable and maintainable
- [ ] Tests cover new functionality
- [ ] No obvious performance issues
- [ ] Security best practices followed
- [ ] Documentation is clear
- [ ] UI changes look good on mobile

---

## 🎨 UI/UX Contribution Guide

### Design Principles
1. **Consistency** - Use existing components before creating new ones
2. **Accessibility** - Keyboard navigation, ARIA labels, color contrast
3. **Responsiveness** - Mobile-first design, test on all breakpoints
4. **Performance** - Lazy load images, code split routes, minimize reflows

### TailwindCSS Guidelines
```tsx
// ✅ Use design system tokens
<button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
  Post Job
</button>

// ❌ Avoid arbitrary values (breaks consistency)
<button className="px-[23px] py-[11px] bg-[#3b82f6]">
  Post Job
</button>

// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {jobs.map(job => <JobCard key={job.id} job={job} />)}
</div>

// ✅ Dark mode support (future)
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### Accessibility Checklist
```tsx
// ✅ Semantic HTML
<button onClick={handleClick}>Click me</button>  // Not <div onClick={...}>

// ✅ ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// ✅ Keyboard navigation
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>

// ✅ Form labels
<label htmlFor="job-title">Job Title</label>
<input id="job-title" type="text" />

// ✅ Alt text for images
<img src={logo} alt="Company logo" />
```

---

## 🐛 Bug Reports

### Before Filing a Bug
1. Search existing issues
2. Try to reproduce in incognito/private mode
3. Check if it's already fixed in `main` branch

### Bug Report Template
```markdown
## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g. macOS 14.1]
- Browser: [e.g. Chrome 120]
- LahHR Version: [e.g. 1.2.0]

## Additional Context
Any other relevant information.
```

---

## 💡 Feature Requests

### Before Requesting a Feature
1. Check the [roadmap](IMPLEMENTATION_PLAN.md#development-roadmap)
2. Search existing feature requests
3. Discuss in community chat/Discord

### Feature Request Template
```markdown
## Problem Statement
What problem does this feature solve?

## Proposed Solution
How you envision this feature working.

## Alternatives Considered
Other ways you've thought about solving this.

## Who Benefits
Which user roles benefit from this feature?

## Priority
Your assessment: Critical / High / Medium / Low

## Mockups/Examples
Sketches, wireframes, or examples from other products.
```

---

## 🌍 Community Guidelines

### Code of Conduct
- **Be respectful** - Treat everyone with kindness
- **Be inclusive** - Welcome newcomers
- **Be constructive** - Critique code, not people
- **Be patient** - Not everyone has the same experience level

### Communication Channels
- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Discord** - Real-time chat, community support
- **Email** - Private/security concerns: security@lahhr.com

---

## 🏆 Recognition

We value every contribution! Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor-only channels
- Eligible for swag (stickers, t-shirts)

**Top contributors** may be offered:
- Maintainer status
- Free LahHR Pro accounts
- Recommendation letters
- Speaking opportunities at conferences

---

## 📚 Learning Resources

### Django
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Guide](https://www.django-rest-framework.org/tutorial/quickstart/)
- [Two Scoops of Django](https://www.feldroy.com/books/two-scoops-of-django-3-x) (book)

### React
- [React Official Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)

### TailwindCSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/) (examples)

---

## ❓ Questions?

Don't hesitate to ask!
- **General questions**: GitHub Discussions
- **Real-time help**: Discord #help channel
- **Private matters**: contribute@lahhr.com

---

**Thank you for contributing to LahHR! Together, we're building the future of recruitment software.** 🚀
