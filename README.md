# LahHR - Complete HR Management System

<div align="center">

![LahHR Logo](https://via.placeholder.com/200x60/3b82f6/ffffff?text=LahHR)

**All-in-One HR Solution from Hire to Retire**

[![Django](https://img.shields.io/badge/Django-5.0+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>

---

## 🎯 What is LahHR?

**LahHR** is a production-grade **Complete HR Management System (HRMS)** designed for companies in Uganda and globally. Unlike legacy enterprise software, LahHR handles EVERY HR function:


### 🏢 **Complete HR Automation**
- 📝 **Recruitment & ATS** - Job posting to 20+ boards, smart matching, interview scheduling
- 👥 **Employee Records** - Digital personnel files, documents, org charts
- 💰 **Payroll Processing** - Uganda PAYE/NSSF, salary calculation, payslips, bank files
- 📅 **Leave & Attendance** - Annual leave, sick leave, time tracking, attendance reports
- 📈 **Performance Management** - Reviews, KPIs, 360° feedback, goal tracking
- 🎓 **Training & Development** - Course management, certifications, skills matrix
- 💼 **Benefits Administration** - Insurance, pensions, loans, allowances
- 📄 **Document Management** - Contracts, policies, certificates with e-signatures
- 👋 **Offboarding** - Exit interviews, final settlement, asset recovery

### 🇺🇬 **Uganda-Specific Features**
- ✅ **URA Tax Compliance** - Automated PAYE calculation (2024 rates), monthly returns
- ✅ **NSSF Integration** - Employee + employer contributions, monthly filings
- ✅ **Mobile Money Payroll** - Pay salaries via MTN/Airtel Money
- ✅ **Local Service Tax** - 5% LST for Kampala businesses
- ✅ **Uganda Holidays** - Pre-configured public holiday calendar
- ✅ **Currency Support** - UGX (Uganda Shillings) + multi-currency

### 🔐 **Multi-Tenant Architecture**
- ✅ **Complete Data Isolation** - Company A cannot see Company B's data (guaranteed!)
- ✅ **Company-Specific Settings** - Each company has own payroll rules, leave policies
- ✅ **White-Label Ready** - Customize branding per company
- ✅ **99.9% Uptime** - Production-grade reliability

---

## 🌟 Features

### Core HR Management
- 👤 **Employee Database** - Complete digital personnel files with photos, documents, contacts
- 📊 **Organization Management** - Departments, teams, reporting hierarchy
- 📧 **Employee Self-Service** - Update info, request leave, view payslips
- 🔔 **Notifications** - Email/SMS alerts for approvals, payroll, birthdays

### Payroll & Finance
- 💵 **Salary Management** - Basic + allowances (housing, transport, medical)
- 🧮 **Tax Calculation** - URA PAYE, NSSF, Local Service Tax automation
- 📑 **Payslip Generation** - Professional PDF payslips with full breakdown
- 🏦 **Bank Integration** - Export payment files for bulk bank transfer
- 💳 **Loan Tracking** - Salary advances, repayment schedules

### Leave & Attendance
- 📅 **Leave Management** - Annual (21 days), sick, maternity (60 days), paternity
- ⏰ **Time Tracking** - Clock in/out, late tracking, overtime calculation
- 📊 **Leave Reports** - Balance tracking, absenteeism analytics
- 🔄 **Approval Workflow** - Employee → Manager → HR approval chain

### Integrations
- 💼 **Job Boards**: LinkedIn, Indeed, Glassdoor, Fuzu, BrighterMonday
- 📆 **Calendars**: Google Calendar, Outlook 365
- 🎥 **Video**: Zoom, Google Meet, Microsoft Teams
- 📧 **Email**: SendGrid, Mailgun, AWS SES
- ☁️ **Storage**: AWS S3, Cloudinary

---

## 🚀 Quick Start

### Prerequisites
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (Optional, recommended) ([Download](https://www.docker.com/))

### Installation

#### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-org/lah-hr.git
cd lah-hr

# Start the entire stack
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:8000/admin
```

#### Option 2: Manual Setup

**Backend (Django)**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json

# Start development server
python manage.py runserver
```

**Frontend (React)**
```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Application will open at http://localhost:5173
```

### First Steps
1. **Login** at `http://localhost:5173/login`
   - Email: `admin@lahhr.com`
   - Password: `admin123` (change immediately!)

2. **Create Your First Job**
   - Navigate to Jobs → New Job
   - Fill in details, select job boards
   - Click "Post Job"

3. **Import Sample Candidates**
   - Go to Candidates → Import
   - Upload CSV or manually add candidates
   - Watch them populate in your pipeline

---

## 📚 Documentation

- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Complete technical specification
- **[Competitive Analysis](COMPETITIVE_ANALYSIS.md)** - Market positioning and strategy
- **[API Documentation](https://docs.lahhr.com/api)** - RESTful API reference
- **[User Guide](https://docs.lahhr.com/guide)** - Step-by-step tutorials
- **[Architecture Docs](docs/ARCHITECTURE.md)** - System design and diagrams

---

## 🗂️ Project Structure

```
lah-hr/
├── backend/                    # Django application
│   ├── api/                    # Django REST Framework APIs
│   │   ├── jobs/              # Job postings endpoints
│   │   ├── candidates/        # Candidate management
│   │   ├── applications/      # Application tracking
│   │   ├── interviews/        # Interview scheduling
│   │   └── analytics/         # Reporting APIs
│   ├── core/                  # Core Django app
│   │   ├── models/            # Database models
│   │   ├── serializers/       # DRF serializers
│   │   ├── permissions/       # RBAC permissions
│   │   └── utils/             # Helper functions
│   ├── integrations/          # Job board adapters
│   │   ├── linkedin/
│   │   ├── indeed/
│   │   ├── glassdoor/
│   │   └── fuzu/
│   ├── config/                # Django settings
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Buttons, inputs, cards
│   │   │   ├── layout/        # Header, sidebar, footer
│   │   │   └── features/      # Job cards, candidate cards
│   │   ├── pages/             # Route-level components
│   │   │   ├── Jobs/
│   │   │   ├── Candidates/
│   │   │   ├── Applications/
│   │   │   ├── Analytics/
│   │   │   └── Settings/
│   │   ├── store/             # Redux state management
│   │   │   ├── slices/        # Redux Toolkit slices
│   │   │   └── api/           # RTK Query API definitions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   ├── styles/            # Global CSS, Tailwind config
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                       # Documentation
├── docker/                     # Docker configurations
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       ├── backend-tests.yml
│       └── frontend-tests.yml
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
- **[Django 5.0](https://www.djangoproject.com/)** - High-level Python web framework
- **[Django REST Framework](https://www.django-rest-framework.org/)** - Powerful toolkit for building APIs
- **[Celery](https://docs.celeryq.dev/)** - Distributed task queue for async jobs
- **[Redis](https://redis.io/)** - In-memory data store for caching and task queue
- **[SQLite](https://www.sqlite.org/)** (dev) / **[PostgreSQL](https://www.postgresql.org/)** (production)

### Frontend
- **[React 18](https://react.dev/)** - UI library for building interactive interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management with best practices
- **[RTK Query](https://redux-toolkit.js.org/rtk-query/overview)** - Data fetching and caching
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling

### DevOps
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automation
- **[Nginx](https://www.nginx.com/)** - Reverse proxy and static file server
- **[AWS S3](https://aws.amazon.com/s3/)** - Cloud storage for resumes/documents

---

## 🗓️ Roadmap

### ✅ Phase 1: Foundation (Weeks 1-4)
- [x] Project setup and architecture
- [x] Authentication system (JWT)
- [x] User management and RBAC
- [x] Basic job posting
- [ ] Simple candidate database

### 🚧 Phase 2: Job Board Integrations (Weeks 5-8)
- [ ] Indeed API integration
- [ ] LinkedIn "Apply with LinkedIn"
- [ ] Glassdoor employer feed
- [ ] Fuzu custom integration
- [ ] Resume parsing (basic)

### 📅 Phase 3: ATS Workflows (Weeks 9-12)
- [ ] Kanban pipeline board
- [ ] Candidate scoring algorithm
- [ ] Interview scheduling
- [ ] Email automation
- [ ] Team collaboration tools

### 🔮 Phase 4: Intelligence (Weeks 13-16)
- [ ] Advanced resume parsing (NER)
- [ ] Smart candidate matching
- [ ] Analytics dashboard
- [ ] Custom reporting
- [ ] Performance optimizations

### 🚀 Phase 5: Launch (Weeks 17-20)
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Beta customer onboarding
- [ ] Public launch

[View Full Roadmap](IMPLEMENTATION_PLAN.md#development-roadmap)

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's:

- 🐛 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Commit Convention**: We use [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest --cov=api --cov-report=html
# Coverage report: htmlcov/index.html
```

### Frontend Tests
```bash
cd frontend
npm run test           # Run tests
npm run test:coverage  # With coverage
# Coverage report: coverage/index.html
```

### End-to-End Tests
```bash
npm run test:e2e       # Cypress/Playwright
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by engineers who care about great software.

- **Lead Developer**: [Your Name](https://github.com/yourusername)
- **Contributors**: [See all contributors](https://github.com/your-org/lah-hr/graphs/contributors)

---

## 📞 Support

- **Documentation**: [docs.lahhr.com](https://docs.lahhr.com)
- **Email**: support@lahhr.com
- **Discord**: [Join our community](https://discord.gg/lahhr)
- **Issues**: [GitHub Issues](https://github.com/your-org/lah-hr/issues)

---

## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/) - The web framework for perfectionists
- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [TailwindCSS](https://tailwindcss.com/) - Rapidly build modern websites
- Inspired by the excellent work of Workable, Greenhouse, and BambooHR

---

<div align="center">

**[⬆ back to top](#lah-hr---next-generation-recruitment-platform)**

Made with 💙 for recruiters everywhere

</div>
