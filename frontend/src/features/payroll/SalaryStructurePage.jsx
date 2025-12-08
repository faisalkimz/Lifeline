import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { api } from '../../store/api';

const SalaryStructurePage = () => {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    effective_date: '',
    basic_salary: '',
    housing_allowance: '0',
    transport_allowance: '0',
    medical_allowance: '0',
    lunch_allowance: '0',
    other_allowances: '0',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [structuresResponse, employeesResponse] = await Promise.all([
        api.get('/salary-structures/'),
        api.get('/employees/')
      ]);
      setSalaryStructures(structuresResponse.data);
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateGrossSalary = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const housing = parseFloat(formData.housing_allowance) || 0;
    const transport = parseFloat(formData.transport_allowance) || 0;
    const medical = parseFloat(formData.medical_allowance) || 0;
    const lunch = parseFloat(formData.lunch_allowance) || 0;
    const other = parseFloat(formData.other_allowances) || 0;

    return basic + housing + transport + medical + lunch + other;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        basic_salary: parseFloat(formData.basic_salary),
        housing_allowance: parseFloat(formData.housing_allowance),
        transport_allowance: parseFloat(formData.transport_allowance),
        medical_allowance: parseFloat(formData.medical_allowance),
        lunch_allowance: parseFloat(formData.lunch_allowance),
        other_allowances: parseFloat(formData.other_allowances),
      };

      if (editingStructure) {
        await api.put(`/salary-structures/${editingStructure.id}/`, data);
      } else {
        await api.post('/salary-structures/', data);
      }

      setShowForm(false);
      setEditingStructure(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving salary structure:', error);
      alert('Error saving salary structure');
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      effective_date: '',
      basic_salary: '',
      housing_allowance: '0',
      transport_allowance: '0',
      medical_allowance: '0',
      lunch_allowance: '0',
      other_allowances: '0',
      notes: ''
    });
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      employee: structure.employee,
      effective_date: structure.effective_date,
      basic_salary: structure.basic_salary.toString(),
      housing_allowance: structure.housing_allowance.toString(),
      transport_allowance: structure.transport_allowance.toString(),
      medical_allowance: structure.medical_allowance.toString(),
      lunch_allowance: structure.lunch_allowance.toString(),
      other_allowances: structure.other_allowances.toString(),
      notes: structure.notes || ''
    });
    setShowForm(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.full_name : 'Unknown';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Structures</h1>
          <p className="text-gray-600 mt-1">Manage employee salary structures and allowances</p>
        </div>
        <Button
          onClick={() => {
            setEditingStructure(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Salary Structure
        </Button>
      </div>

      {/* Salary Structures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Salary Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Basic Salary</TableCell>
                <TableCell>Allowances</TableCell>
                <TableCell>Gross Salary</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryStructures.map((structure) => (
                <TableRow key={structure.id}>
                  <TableCell className="font-medium">
                    {structure.employee_name}
                    <br />
                    <span className="text-sm text-gray-500">{structure.employee_number}</span>
                  </TableCell>
                  <TableCell>{new Date(structure.effective_date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(structure.basic_salary)}</TableCell>
                  <TableCell>{formatCurrency(structure.total_allowances)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(structure.gross_salary)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(structure)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Salary Structure Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees
                    .filter(emp => emp.employment_status === 'active')
                    .map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.employee_number} - {employee.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <Input
                  type="date"
                  name="effective_date"
                  value={formData.effective_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary (UGX)
                </label>
                <Input
                  type="number"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Housing Allowance (UGX)
                </label>
                <Input
                  type="number"
                  name="housing_allowance"
                  value={formData.housing_allowance}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Allowance (UGX)
                </label>
                <Input
                  type="number"
                  name="transport_allowance"
                  value={formData.transport_allowance}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Allowance (UGX)
                </label>
                <Input
                  type="number"
                  name="medical_allowance"
                  value={formData.medical_allowance}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lunch Allowance (UGX)
                </label>
                <Input
                  type="number"
                  name="lunch_allowance"
                  value={formData.lunch_allowance}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Allowances (UGX)
                </label>
                <Input
                  type="number"
                  name="other_allowances"
                  value={formData.other_allowances}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Calculated Gross Salary:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(calculateGrossSalary())}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes about this salary structure..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingStructure ? 'Update' : 'Create'} Salary Structure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryStructurePage;
