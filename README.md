# 🚀 Lifeline HR - Enterprise HR & Payroll Management System

A comprehensive, modern HR and Payroll Management System built with React, Django, and PostgreSQL. Featuring AI-powered resume parsing, advanced payroll processing, GCC compliance, and complete employee lifecycle management.

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with 2FA support
- **Password Recovery System** with email-based token validation
- **Role-Based Access Control (RBAC)** with granular permissions
- **Security Logging & Audit Trails**
- **GDPR Compliance** with data export capabilities

### 👥 Employee Management
- Complete employee lifecycle management (Onboarding → Offboarding)
- Custom employee profiles with hierarchical organization
- Department and team management
- Manager assignment and delegation
- Digital document management
- Employment history tracking

### 💰 Payroll & Compensation
- Advanced payroll run creation and management
- Multi-currency support (UGX, KES, TZS, USD, etc.)
- Salary structure templates
- Automated tax and deduction calculations
- **GCC Compliance Module** (Gratuity, End-of-Service Benefits)
- Salary advances and loans management
- Expense reimbursement tracking
- PDF payslip generation
- Email payslip delivery

### 📅 Leave & Attendance
- Leave request and approval workflows
- Multiple leave types support
- Leave balance tracking
- Attendance tracking with clock-in/out
- Overtime management
- Calendar views for team visualization
- Public holiday management

### 📊 Performance Management
- Performance cycles and reviews
- Goal setting and tracking (OKRs)
- 360-degree feedback
- Performance analytics

### 🎯 Recruitment (ATS)
- AI-powered resume parsing with Google Gemini
- Job posting and management
- Candidate pipeline tracking
- Interview scheduling
- Offer letter generation
- Integration with job boards (LinkedIn, Indeed, Glassdoor)
- Public career pages

### 🎓 Learning & Development
- Training course management
- Session scheduling
- Employee enrollment tracking
- Attendance and completion tracking

### 🎁 Benefits Administration
- Multiple benefit types (Health, Pension, Insurance)
- NSSF integration
- Employee enrollment management
- Benefit eligibility tracking

### 📄 Document Management
- Centralized document repository
- Folder organization
- Employee document uploads
- Digital signatures
- Version control
- Storage analytics

### 💬 Employee Communication
- Company-wide announcements
- Push notifications (Web Push API)
- AI-powered chatbot support
- Email notifications

### 📈 Analytics & Reporting
- Comprehensive HR analytics dashboard
- Payroll analytics
- Employee demographics
- Custom report generation
- Scheduled reports via email
- Data export capabilities

### ⚙️ System Features
- **Dark Mode** support throughout
- **Progressive Web App (PWA)** capabilities
- **Responsive Design** for all devices
- **Real-time Updates** with RTK Query
- **Advanced Form Validation** with React Hook Form & Zod
- **Premium UI/UX** with Framer Motion animations
- **Asset Management** with assignment tracking
-  **Digital Forms & Surveys** with custom form builder
- **Help Center** with documentation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** & **RTK Query** - State management & API calls
- **React Router v6** - Routing
- **React Hook Form** + **Zod** - Form handling & validation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Chart.js** & **Recharts** - Data visualization
- **date-fns** - Date manipulation
- **React Quill** - Rich text editor
- **React Hot Toast** - Notifications

### Backend
- **Django 5.1** - Web framework
- **Django REST Framework** - API
- **PostgreSQL** - Database
- **JWT Authentication** - djangorestframework-simplejwt
- **Celery** - Background tasks (planned)
- **Redis** - Caching (planned)
- **Google Gemini AI** - Resume parsing & AI features
- **ReportLab** - PDF generation
- **Whitenoise** - Static file serving

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **PostgreSQL** 14+
- **Git**

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Lifeline.git
cd Lifeline/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment variables**
Create a `.env` file in the backend directory:
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lifeline

# Frontend URL (for CORS & password reset emails)
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourcompany.com

# AI Configuration
GOOGLE_API_KEY=your-gemini-api-key

# Security
SECURE_SSL_REDIRECT=False  # Set to True in production with HTTPS
SESSION_COOKIE_SECURE=False  # Set to True in production
CSRF_COOKIE_SECURE=False  # Set to True in production
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api
```

4. **Run development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Production Deployment

### Backend (Render/Heroku)

1. **Update environment variables** in your hosting platform
2. **Set** `DEBUG=False`
3. **Configure** `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
4. **Set** `USE_X_FORWARDED_HOST=True` for proxy support
5. **Enable** `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`
6. **Run** migrations and collect static files

### Frontend (Vercel/Netlify)

1. **Build the project**
```bash
npm run build
```

2. **Configure environment variables** on your hosting platform
```env
VITE_API_URL=https://your-api-domain.com
VITE_API_BASE_URL=https://your-api-domain.com/api
```

3. **Deploy** the `dist` folder

## 📚 API Documentation

The API follows REST principles and includes the following main endpoints:

- `/api/auth/` - Authentication (login, register, password reset)
- `/api/employees/` - Employee management
- `/api/departments/` - Department management
- `/api/payroll/` - Payroll operations
- `/api/leave/` - Leave management
- `/api/attendance/` - Attendance tracking
- `/api/recruitment/` - Recruitment & ATS
- `/api/benefits/` - Benefits administration
- `/api/documents/` - Document management
- `/api/performance/` - Performance management
- `/api/training/` - Learning & Development
- `/api/analytics/` - Analytics & reporting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Faisal Kimz**
- GitHub: [@faisalkimz](https://github.com/faisalkimz)

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Backend powered by [Django](https://www.djangoproject.com/)
- AI capabilities by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Icons from [Lucide](https://lucide.dev/)

---

**Note**: This is an enterprise-grade system designed for production use. Ensure all security best practices are followed when deploying to production environments.
