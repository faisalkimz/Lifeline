// src/features/payroll/CreatePayrollRunModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCreatePayrollRunMutation, useGetEmployeesQuery } from '../../store/api';
import { Check, Search, Calendar } from 'lucide-react'; // Assuming we have these or standard inputs

const CreatePayrollRunModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: '',
    start_date: '',
    end_date: '',
    payment_date: ''
  });

  // Auto-calculate dates when month/year changes
  useEffect(() => {
    const y = parseInt(formData.year);
    const m = parseInt(formData.month);
    if (!y || !m) return;

    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    // Last day of month: new Date(year, monthIndex, 0).getDate() (monthIndex is 1-based here so passing m works for "day 0 of next month"?? No. Date(y, m, 0) is last day of month m. JS months 0-11.
    // formData.month is 1-12.
    // new Date(2025, 12, 0) -> Dec 31 2025. Correct.
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

    // Default pay day: 28th?
    const payDay = Math.min(28, lastDay);
    const payment = `${y}-${String(m).padStart(2, '0')}-${payDay}`;

    setFormData(prev => ({
      ...prev,
      start_date: start,
      end_date: end,
      payment_date: payment
    }));
  }, [formData.month, formData.year]);

  // Employee Selection Logic
  const { data: employees } = useGetEmployeesQuery({ employment_status: 'active' });
  const [selectSpecific, setSelectSpecific] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleEmployee = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (employees) {
      if (selectedIds.size === employees.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(employees.map(e => e.id)));
      }
    }
  };

  const filteredEmployees = employees?.filter(e =>
    e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employee_number?.includes(searchTerm)
  ) || [];

  const [createPayrollRun, { isLoading, error: mutationError }] = useCreatePayrollRunMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createPayrollRun({
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        payment_date: formData.payment_date,
        employee_ids: selectSpecific ? Array.from(selectedIds) : undefined
      }).unwrap();
      if (onSuccess) onSuccess(response);
      onClose();
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        description: ''
      });
    } catch (err) {
      console.error('Error creating payroll run:', err);
      // alert('Error creating payroll run. Please try again.'); // Removed alert in favor of UI message
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6 rounded-xl border-gray-100 shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            Create Payroll Run
          </DialogTitle>
          <p className="text-gray-500 text-sm mt-1">Set up the billing period and payment dates.</p>
        </DialogHeader>

        {/* Error Alert */}
        {mutationError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-start gap-2">
            <span className="font-medium">Error:</span>
            <span>{typeof mutationError === 'string' ? mutationError : (mutationError.data?.non_field_errors?.[0] || 'Failed to create payroll run.')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Month</label>
              <div className="relative">
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all appearance-none outline-none text-gray-700"
                  required
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Year</label>
              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all appearance-none outline-none text-gray-700"
                  required
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Start Date</label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="text-sm border-gray-200 focus:border-slate-400 focus:ring-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">End Date</label>
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className="text-sm border-gray-200 focus:border-slate-400 focus:ring-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Pay Date</label>
              <Input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                required
                className="text-sm border-gray-200 focus:border-slate-400 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Description (Optional)</label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g. Regular Processing"
              className="border-gray-200 focus:border-slate-400 focus:ring-slate-200"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="specific_employees"
                className="w-4 h-4 rounded text-slate-600 border-gray-300 focus:ring-slate-500"
                checked={selectSpecific}
                onChange={(e) => setSelectSpecific(e.target.checked)}
              />
              <label htmlFor="specific_employees" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Select specific employees only
              </label>
            </div>

            {selectSpecific && (
              <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-sm bg-white border-gray-200"
                  />
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-medium text-gray-500">{selectedIds.size} selected</span>
                  <button type="button" onClick={handleSelectAll} className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:underline">
                    {selectedIds.size === employees?.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredEmployees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 hover:bg-white p-2 rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 rounded text-slate-600 border-gray-300 focus:ring-slate-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{emp.full_name}</span>
                        <span className="text-[10px] text-gray-400">{emp.job_title}</span>
                      </div>
                    </label>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                      <Search className="h-6 w-6 mb-1 opacity-20" />
                      <span className="text-xs">No employees found</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white shadow-sm">
              {isLoading ? 'Creating...' : 'Create Payroll Run'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
};

export { CreatePayrollRunModal };
export default CreatePayrollRunModal;