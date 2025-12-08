# 🚀 Quick Start Guide: Phase 5 (Dashboard & Images)

## Prerequisites
- Python 3.11+
- Node.js 18+
- Django backend running
- React frontend setup

---

## ⚡ Quick Setup (5 minutes)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies (if needed)
pip install -r requirements.txt

# Run migrations (if needed)
python manage.py migrate

# Start development server
python manage.py runserver
```

✅ Backend should be running on `http://localhost:8000`

---

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

---

### 3. Add Test Employee Photo
```bash
# Add a photo for testing
# Place a .jpg or .png file in: backend/media/employee_photos/

# Or upload through the web interface:
# 1. Navigate to Employee List
# 2. Click "Add Employee"
# 3. Fill in details
# 4. Upload photo
# 5. Save
```

---

## 🎯 Testing Checklist

### Test 1: Profile Page Images
```
1. Navigate to Profile page (/profile)
2. You should see:
   ✅ Your employee photo in a circular container
   ✅ If no photo: initials (e.g., "JD" for John Doe)
   ✅ Proper styling with border and shadow
3. Hover over photo: Should remain smooth
```

### Test 2: Employee List Images
```
1. Navigate to Employees (/employees)
2. Table should show:
   ✅ Employee photo in first column
   ✅ Fallback initials if no photo
   ✅ Proper sizing (h-10 w-10)
   ✅ Click row to view employee details
```

### Test 3: Dashboard Analytics
```
1. Navigate to Dashboard (/dashboard)
2. Verify sections (top to bottom):
   ✅ Gradient welcome banner
   ✅ 4 KPI cards (Total, Active, On Leave, Depts)
   ✅ Employment Status chart (progress bars)
   ✅ Employment Type chart (stacked bars)
   ✅ Gender Diversity chart (emoji circles)
   ✅ Top Managers section (medals + team size)
   ✅ Recent Hires (last 5 employees)
   ✅ Upcoming Events (birthdays/anniversaries)
3. Test hover effects on all cards
4. Check responsive by resizing window
```

### Test 4: Manager Visibility
```
1. Navigate to Dashboard
2. Look for "Top Managers by Team Size" section
3. Verify:
   ✅ Shows top 5 managers
   ✅ Ranked with medals 🥇🥈🥉
   ✅ Shows manager name and title
   ✅ Shows number of direct reports
   ✅ Hover effect works smoothly
```

### Test 5: Responsive Design
```
Resize browser to test:

Mobile (375px):
  - KPI cards: 1 column
  - Charts: 1 column
  - Stack vertically

Tablet (768px):
  - KPI cards: 2 columns
  - Charts: 2-3 columns

Desktop (1024px+):
  - KPI cards: 4 columns
  - Charts: 3 columns
  - Manager + Events: 2 columns
```

### Test 6: Loading States
```
1. Open network inspector (F12 > Network)
2. Set to "Slow 3G" or similar
3. Reload dashboard
4. Verify:
   ✅ Skeleton screens appear first
   ✅ Smooth pulse animation
   ✅ Data loads in gracefully
```

---

## 🔧 Environment Variables

Make sure your `.env.local` in frontend has:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

Or set in `vite.config.js`:
```javascript
import.meta.env.VITE_API_BASE_URL
```

---

## 🐛 Troubleshooting

### Problem: Images not loading

**Solution:**
```bash
# Check backend is serving media files
# In Django settings.py, verify:
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Check file exists at:
# backend/media/employee_photos/filename.jpg

# Check URL construction:
# Should be: http://localhost:8000/media/employee_photos/filename.jpg
```

### Problem: Dashboard not showing managers

**Solution:**
```bash
# Verify getManagersQuery returns data:
# 1. Open browser DevTools (F12)
# 2. Go to Network tab
# 3. Filter for "managers"
# 4. Should see response with manager data

# If no response:
# - Check backend has employees with subordinates
# - Use ManagerManagementPage to promote employees first
```

### Problem: Charts not rendering

**Solution:**
```bash
# Check console for errors (F12 > Console)
# Verify stats API returns data with:
# - by_type (full_time, part_time, etc.)
# - by_gender (male, female, other)

# If missing:
# - Run migrations: python manage.py migrate
# - Generate sample data: python manage.py setup_demo_data
```

### Problem: Responsive not working

**Solution:**
```bash
# Check Tailwind config is loading:
# In DevTools, check element styles
# Should see Tailwind classes in <style> tag

# Rebuild Tailwind:
npm run build
npm run dev
```

---

## 📊 Sample Data

If you need test data:

```bash
# Create demo company and employees
python manage.py setup_demo_data

# Or manually via admin:
# 1. Navigate to http://localhost:8000/admin
# 2. Login with your superuser account
# 3. Add employees with photos
```

---

## 📱 Mobile Testing

Test on actual mobile devices:

```bash
# Get your machine's IP address:
# Windows: ipconfig (look for IPv4 Address)
# Mac/Linux: ifconfig

# Access frontend from mobile:
# http://YOUR_IP:5173

# Make sure frontend can reach backend API:
# Set VITE_API_BASE_URL to http://YOUR_IP:8000
```

---

## 🎯 Performance Testing

Check how fast dashboard loads:

```bash
# Open DevTools (F12)
# Go to Performance tab
# Click Record
# Reload page
# Stop recording

Expected metrics:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3s
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test on actual device/browser combo
- [ ] Verify images load from CDN/media server
- [ ] Check environment variables are set
- [ ] Test with real employee data (>100 records)
- [ ] Verify responsive on mobile
- [ ] Check console for no errors
- [ ] Test loading states on slow connection
- [ ] Verify dark mode (if implemented)
- [ ] Test accessibility with screen reader
- [ ] Performance audit with Lighthouse

---

## 📞 Common Questions

**Q: Why are images stored in backend/media/?**
A: Django serves static/media files. In production, use CDN like S3.

**Q: Can I customize the charts?**
A: Yes! Modify the chart components in DashboardPage.jsx. No external library needed.

**Q: How do I add more KPI cards?**
A: Duplicate a StatCard component and add to the grid. All props are documented.

**Q: Can I export the dashboard?**
A: Not yet, but it's easy to add with html2pdf or similar library.

**Q: How often does dashboard refresh?**
A: On page load. Add WebSocket for real-time if needed.

---

## 🎓 Code Locations

**Dashboard Components:**
- `frontend/src/features/dashboard/DashboardPage.jsx` - Main dashboard
- `frontend/src/components/ui/StatCard.jsx` - KPI cards
- `frontend/src/store/api.js` - API endpoints

**Image Display:**
- `frontend/src/features/employees/MyProfilePage.jsx` - Profile photo
- `frontend/src/features/employees/EmployeeListPage.jsx` - List photos

**Data Models:**
- `backend/employees/models.py` - Employee model with photo field
- `backend/employees/serializers.py` - JSON serialization

---

## 🆘 Get Help

If something doesn't work:

1. **Check Logs**: 
   - Backend: Terminal showing Django output
   - Frontend: Browser DevTools Console (F12)

2. **Check Network**: 
   - Open DevTools Network tab
   - Look for failed requests (red)
   - Check response status and body

3. **Check Database**:
   ```bash
   python manage.py dbshell
   SELECT * FROM employees_employee LIMIT 5;
   ```

4. **Reset Everything**:
   ```bash
   # Backend
   rm db.sqlite3
   python manage.py migrate
   python manage.py setup_demo_data
   
   # Frontend
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

## 🎉 You're All Set!

You now have:
✅ Beautiful dashboard with analytics
✅ Employee images working everywhere
✅ Manager visibility and ranking
✅ Professional UI with gradients
✅ Responsive mobile design
✅ Production-ready code

Enjoy your enhanced HRMS! 🚀

---

*Last Updated: December 8, 2025*
*For issues or questions, check the documentation files in root directory*
