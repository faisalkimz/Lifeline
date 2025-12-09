const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8000;

// Mock data
const mockEmployees = [
  { id: 1, full_name: 'John Doe', first_name: 'John', last_name: 'Doe', employment_status: 'active' },
  { id: 2, full_name: 'Jane Smith', first_name: 'Jane', last_name: 'Smith', employment_status: 'active' },
  { id: 3, full_name: 'Bob Johnson', first_name: 'Bob', last_name: 'Johnson', employment_status: 'active' },
];

const mockDepartments = [
  {
    id: 1,
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development department',
    manager_name: 'John Doe',
    employee_count: 5,
    is_active: true
  },
  {
    id: 2,
    name: 'Human Resources',
    code: 'HR',
    description: 'Human resources management',
    manager_name: 'Jane Smith',
    employee_count: 3,
    is_active: true
  },
];

const mockUser = {
  id: 1,
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@test.com',
  company: { name: 'Test Company' }
};

// Middleware
app.use(cors());
app.use(express.json());

// Mock JWT token generation
const generateToken = () => {
  return jwt.sign({ user_id: 1, company_id: 1 }, 'mock-secret-key');
};

// Auth endpoints
app.post('/api/auth/login/', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@test.com' && password === 'admin123') {
    res.json({
      access: generateToken(),
      refresh: generateToken(),
      user: mockUser
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout/', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me/', (req, res) => {
  // Simple auth check - in real app would verify token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json(mockUser);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Employee endpoints
app.get('/api/employees/', (req, res) => {
  const { employment_status } = req.query;
  let filtered = mockEmployees;

  if (employment_status) {
    filtered = mockEmployees.filter(emp => emp.employment_status === employment_status);
  }

  res.json(filtered);
});

// Department endpoints
app.get('/api/departments/', (req, res) => {
  res.json(mockDepartments);
});

app.get('/api/departments/:id/', (req, res) => {
  const dept = mockDepartments.find(d => d.id === parseInt(req.params.id));
  if (dept) {
    res.json(dept);
  } else {
    res.status(404).json({ error: 'Department not found' });
  }
});

app.post('/api/departments/', (req, res) => {
  const newDept = {
    id: mockDepartments.length + 1,
    ...req.body,
    employee_count: 0,
    is_active: true
  };
  mockDepartments.push(newDept);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id/', (req, res) => {
  const index = mockDepartments.findIndex(d => d.id === parseInt(req.params.id));
  if (index !== -1) {
    mockDepartments[index] = { ...mockDepartments[index], ...req.body };
    res.json(mockDepartments[index]);
  } else {
    res.status(404).json({ error: 'Department not found' });
  }
});

app.delete('/api/departments/:id/', (req, res) => {
  const index = mockDepartments.findIndex(d => d.id === parseInt(req.params.id));
  if (index !== -1) {
    mockDepartments.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Department not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});





