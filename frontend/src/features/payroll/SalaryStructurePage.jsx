// src/features/salary/SalaryStructurePage.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import {
  useGetSalaryStructuresQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useGetEmployeesQuery
} from '../../store/api';

const SalaryStructurePage = () => {
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

  const { data: salaryStructuresData = [], isLoading: structuresLoading } = useGetSalaryStructuresQuery();
  const { data: employeesData = [], isLoading: employeesLoading } = useGetEmployeesQuery();
  const [createSalaryStructure, { isLoading: creating }] = useCreateSalaryStructureMutation();
  const [updateSalaryStructure, { isLoading: updating }] = useUpdateSalaryStructureMutation();

  const loading = structuresLoading || employeesLoading;

  const salaryStructures = Array.isArray(salaryStructuresData) ? salaryStructuresData : [];
  const employees = (employeesData || []).map(emp => ({
    id: emp.id ?? emp.employee_id ?? emp.pk ?? '',
    full_name: emp.full_name ?? emp.name ?? `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim(),
    employee_number: emp.employee_number ?? emp.staff_number ?? emp.emp_no ?? '',
    employment_status: emp.employment_status ?? emp.status ?? 'active'
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        employee: parseInt(formData.employee, 10),
        basic_salary: parseFloat(formData.basic_salary) || 0,
        housing_allowance: parseFloat(formData.housing_allowance) || 0,
        transport_allowance: parseFloat(formData.transport_allowance) || 0,
        medical_allowance: parseFloat(formData.medical_allowance) || 0,
        lunch_allowance: parseFloat(formData.lunch_allowance) || 0,
        other_allowances: parseFloat(formData.other_allowances) || 0,
      };

      if (editingStructure) {
        await updateSalaryStructure({ id: editingStructure.id, ...data }).unwrap();
      } else {
        await createSalaryStructure(data).unwrap();
      }

      setShowForm(false);
      setEditingStructure(null);
      resetForm();
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
    let employeeId = '';
    if (structure.employee === null || structure.employee === undefined) {
      employeeId = structure.employee_id ?? structure.employee?.id ?? structure.emp_id ?? '';
    } else if (typeof structure.employee === 'object') {
      employeeId = structure.employee.id ?? structure.employee.employee_id ?? '';
    } else {
      employeeId = structure.employee;
    }

    setEditingStructure(structure);
    setFormData({
      employee: String(employeeId ?? ''),
      effective_date: structure.effective_date ? structure.effective_date.split('T')[0] : '',
      basic_salary: (structure.basic_salary ?? '').toString(),
      housing_allowance: (structure.housing_allowance ?? '0').toString(),
      transport_allowance: (structure.transport_allowance ?? '0').toString(),
      medical_allowance: (structure.medical_allowance ?? '0').toString(),
      lunch_allowance: (structure.lunch_allowance ?? '0').toString(),
      other_allowances: (structure.other_allowances ?? '0').toString(),
      notes: structure.notes ?? ''
    });
    setShowForm(true);
  };

  const formatCurrency = (amount) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => String(emp.id) === String(employeeId));
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
        <Button onClick={() => { setEditingStructure(null); resetForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
          Add Salary Structure
        </Button>
      </div>

      <Card className="bg-white text-black">
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
                  <TableCell className="font-medium text-black">
                    {structure.employee_name ?? getEmployeeName(structure.employee)}
                    <br />
                    <span className="text-sm text-gray-500">{structure.employee_number}</span>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {structure.effective_date ? new Date(structure.effective_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-gray-700">{formatCurrency(structure.basic_salary)}</TableCell>
                  <TableCell className="text-gray-700">{formatCurrency(structure.total_allowances)}</TableCell>
                  <TableCell className="font-semibold text-black">{formatCurrency(structure.gross_salary)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(structure)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent 
          className="max-w-4xl w-full bg-white text-gray-900 !rounded-2xl shadow-2xl border border-gray-200"
          style={{ maxWidth: '1100px', backgroundColor: '#ffffff' }} // Extra wide & forced white
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200 -m-6 pb-5 pt-7 px-8 rounded-t-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 py-8 px-2 bg-white">
            {/* Employee + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Employee</label>
                <select 
                  name="employee" 
                  value={formData.employee} 
                  onChange={handleInputChange} 
                  className="w-full px-5 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees
                    .filter(emp => String(emp.employment_status).toLowerCase() === 'active')
                    .map(employee => (
                      <option key={employee.id} value={String(employee.id)}>
                        {employee.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Effective Date</label>
                <Input 
                  type="date" 
                  name="effective_date" 
                  value={formData.effective_date} 
                  onChange={handleInputChange} 
                  required 
                  className="h-[52px] text-base bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            {/* Salary Components - Now with more breathing room */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Salary Components (UGX)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Basic Salary</label>
                  <Input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleInputChange} placeholder="0" required className="h-12 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Housing Allowance</label>
                  <Input type="number" name="housing_allowance" value={formData.housing_allowance} onChange={handleInputChange} placeholder="0" className="h-12 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Transport Allowance</label>
                  <Input type="number" name="transport_allowance" value={formData.transport_allowance} onChange={handleInputChange} placeholder="0" className="h-12 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Medical Allowance</label>
                  <Input type="number" name="medical_allowance" value={formData.medical_allowance} onChange={handleInputChange} placeholder="0" className="h-12 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lunch Allowance</label>
                  <Input type="number" name="lunch_allowance" value={formData.lunch_allowance} onChange={handleInputChange} placeholder="0" className="h-12 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Allowances</label>
                  <Input type="number" name="other_allowances" value={formData.other_allowances} onChange={handleInputChange} placeholder="0" className="h-12 bg-white text-gray-900" />
                </div>
              </div>
            </div>

            {/* Gross Salary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Calculated Gross Salary:</span>
                <span className="text-3xl font-extrabold text-blue-700">{formatCurrency(calculateGrossSalary())}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleInputChange} 
                rows={4} 
                className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-none"
                placeholder="e.g. Annual increment, promotion adjustment, new tax regime..."
              />
            </div>

            {/* Footer */}
            <DialogFooter className="bg-gray-50/80 -m-6 mt-10 p-8 rounded-b-2xl border-t border-gray-200 backdrop-blur">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowForm(false); setEditingStructure(null); }}
                className="px-8 py-6 text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-base font-semibold shadow-lg"
                disabled={creating || updating}
              >
                {creating || updating ? 'Saving...' : (editingStructure ? 'Update' : 'Create') + ' Salary Structure'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { SalaryStructurePage };
export default SalaryStructurePage;

