import React, { useState } from 'react';
import {
  Plus, Search, Filter, DollarSign, Users,
  Clock, MoreHorizontal, ChevronRight, Calculator,
  Eye, Edit2, Trash2
} from 'lucide-react';
import {
  useGetSalaryStructuresQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useGetEmployeesQuery
} from '../../store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const SalaryStructurePage = () => {
  // 1. State
  const [showForm, setShowForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  // 2. Queries
  const { data: salaryStructuresData = [], isLoading: structuresLoading } = useGetSalaryStructuresQuery();
  const { data: employeesData = [], isLoading: employeesLoading } = useGetEmployeesQuery();
  const [createSalaryStructure, { isLoading: creating }] = useCreateSalaryStructureMutation();
  const [updateSalaryStructure, { isLoading: updating }] = useUpdateSalaryStructureMutation();

  const loading = structuresLoading || employeesLoading;

  // 3. Computed
  const salaryStructures = Array.isArray(salaryStructuresData) ? salaryStructuresData : [];
  const employees = (employeesData?.results || employeesData || []).map(emp => ({
    id: emp.id ?? emp.employee_id ?? emp.pk ?? '',
    full_name: emp.full_name ?? emp.name ?? `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim(),
    employee_number: emp.employee_number ?? emp.staff_number ?? emp.emp_no ?? '',
    employment_status: emp.employment_status ?? emp.status ?? 'active',
    job_title: emp.job_title,
    department_name: emp.department_name
  }));

  const filteredStructures = salaryStructures.filter(s =>
    s.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employee_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateGrossSalary = (data = formData) => {
    const basic = parseFloat(data.basic_salary) || 0;
    const housing = parseFloat(data.housing_allowance) || 0;
    const transport = parseFloat(data.transport_allowance) || 0;
    const medical = parseFloat(data.medical_allowance) || 0;
    const lunch = parseFloat(data.lunch_allowance) || 0;
    const other = parseFloat(data.other_allowances) || 0;
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
        toast.success('Structure updated');
      } else {
        await createSalaryStructure(data).unwrap();
        toast.success('Structure created');
      }

      setShowForm(false);
      setEditingStructure(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save structure');
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
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  // 5. Render
  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Compensation</h1>
          <p className="text-notion-text-light mt-2">Manage employee salary structures and monthly recurring earnings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setEditingStructure(null); resetForm(); setShowForm(true); }}
            className="btn-notion-primary h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add structure
          </Button>
        </div>
      </div>

      {/* Flat Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Total headcount</p>
          <p className="text-2xl font-bold">{salaryStructures.length}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Avg Basic</p>
          <p className="text-2xl font-bold">
            {formatCurrency(salaryStructures.reduce((acc, s) => acc + (parseFloat(s.basic_salary) || 0), 0) / (salaryStructures.length || 1))}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Total Monthly Gross</p>
          <p className="text-2xl font-bold text-[#88B072]">
            {formatCurrency(salaryStructures.reduce((acc, s) => acc + (parseFloat(s.gross_salary) || 0), 0))}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Pending updates</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Minimal Filters */}
      <div className="flex flex-col md:flex-row gap-4 py-2 border-y border-notion-border items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-notion-text-light" />
          <input
            placeholder="Search by member name or number..."
            className="w-full pl-8 pr-3 py-1.5 bg-transparent border-none focus:outline-none text-sm placeholder:text-notion-text-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto whitespace-nowrap px-1 text-xs font-bold text-notion-text-light uppercase">
          <span>Export</span>
          <div className="h-4 w-px bg-notion-border" />
          <button className="p-1 hover:bg-notion-hover rounded">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-notion-text-light">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-notion-border border-t-notion-text mb-4"></div>
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="py-24 text-center opacity-60">
          <DollarSign className="h-12 w-12 mx-auto mb-4 stroke-1" />
          <h2 className="text-lg font-bold">No structures found</h2>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-notion-border">
                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider w-[320px]">Member</th>
                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Effective Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Basic Salary</th>
                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider text-right">Gross Pay</th>
                <th className="px-1 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {filteredStructures.map((structure) => (
                <tr
                  key={structure.id}
                  className="group hover:bg-notion-hover/50 transition-colors cursor-pointer"
                  onClick={() => handleEdit(structure)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-notion-sidebar border border-notion-border flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-notion-text-light uppercase">
                          {structure.employee_name?.[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[14px] truncate group-hover:text-notion-primary">{structure.employee_name}</p>
                        <p className="text-[11px] text-notion-text-light font-medium uppercase tracking-tighter">{structure.employee_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-notion-text">
                      <Clock className="h-3.5 w-3.5 opacity-40" />
                      {structure.effective_date ? new Date(structure.effective_date).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-notion-text">{formatCurrency(structure.basic_salary)}</p>
                    <p className="text-[10px] text-notion-text-light uppercase font-bold tracking-tighter">
                      +{formatCurrency(structure.total_allowances)} Allowances
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-bold text-notion-text">{formatCurrency(structure.gross_salary)}</p>
                    <p className="text-[10px] text-[#88B072] font-bold uppercase tracking-tighter">Current rate</p>
                  </td>
                  <td className="px-1 text-right">
                    <button className="p-1 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-black/5">
                      <ChevronRight className="h-4 w-4 text-notion-text-light" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStructure ? 'Adjust structure' : 'Initialize structure'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Member Selection */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Member</label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  className="input-notion bg-transparent"
                  required
                >
                  <option value="">Select Member</option>
                  {employees
                    .filter(emp => String(emp.employment_status).toLowerCase() === 'active')
                    .map(employee => (
                      <option key={employee.id} value={String(employee.id)}>
                        {employee.full_name} ({employee.employee_number})
                      </option>
                    ))}
                </select>
              </div>
              <InputField
                label="Effective from"
                type="date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-notion-border">
                <Calculator className="h-4 w-4 text-notion-text-light" />
                <h3 className="text-xs font-bold text-notion-text uppercase tracking-widest">Calculated Breakdown (UGX)</h3>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InputField label="Basic salary" type="number" name="basic_salary" value={formData.basic_salary} onChange={handleInputChange} required placeholder="0" />
                <InputField label="Housing allowance" type="number" name="housing_allowance" value={formData.housing_allowance} onChange={handleInputChange} placeholder="0" />
                <InputField label="Transport allowance" type="number" name="transport_allowance" value={formData.transport_allowance} onChange={handleInputChange} placeholder="0" />
                <InputField label="Medical allowance" type="number" name="medical_allowance" value={formData.medical_allowance} onChange={handleInputChange} placeholder="0" />
                <InputField label="Lunch allowance" type="number" name="lunch_allowance" value={formData.lunch_allowance} onChange={handleInputChange} placeholder="0" />
                <InputField label="Other allowances" type="number" name="other_allowances" value={formData.other_allowances} onChange={handleInputChange} placeholder="0" />
              </div>
            </div>

            {/* Gross Result */}
            <div className="p-6 bg-notion-sidebar rounded-lg border border-notion-border flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-notion-text-light uppercase tracking-widest">Projected Gross Monthly</p>
                <p className="text-3xl font-bold tracking-tighter mt-1">{formatCurrency(calculateGrossSalary())}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-notion-border/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-notion-text-light" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-notion-border">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingStructure(null); }}
                className="px-4 py-1.5 text-sm font-medium hover:bg-notion-hover rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || updating}
                className="btn-notion-primary h-9 px-6 uppercase tracking-widest text-[11px] font-black"
              >
                {creating || updating ? 'Saving...' : 'Confirm structure'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className="input-notion"
    />
  </div>
);

export default SalaryStructurePage;
