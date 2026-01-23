// src/features/payroll/CreatePayrollRunModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCreatePayrollRunMutation, useGetEmployeesQuery } from '../../store/api';
import { Check, Search, Calendar, CircleAlert } from 'lucide-react'; // Assuming we have these or standard inputs

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
      <DialogContent className="max-w-lg bg-white p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
        {/* Professional Header */}
        <div className="px-8 py-6 flex items-center gap-4 border-b border-slate-50">
          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
            <Calendar className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Run payroll
            </DialogTitle>
            <p className="text-slate-500 mt-0.5 text-sm">
              Prepare and process the upcoming payroll run.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {mutationError && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100 flex items-start gap-3">
            <CircleAlert className="h-5 w-5 shrink-0" />
            <span>{typeof mutationError === 'string' ? mutationError : (mutationError.data?.non_field_errors?.[0] || 'Failed to create payroll run.')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payroll month</label>
              <div className="relative">
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-400 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all appearance-none outline-none text-slate-700 font-semibold cursor-pointer"
                  required
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-400 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all appearance-none outline-none text-slate-700 font-semibold cursor-pointer"
                  required
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date from</label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="h-11 border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date to</label>
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className="h-11 border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Payment date</label>
              <Input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                required
                className="h-11 bg-emerald-50 border-emerald-100 focus:bg-white focus:border-emerald-500 transition-all text-sm font-semibold text-emerald-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Optional)</label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g. End of Month Payroll"
              className="h-11 border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div className="pt-2 border-t border-slate-50">
            <div className="flex items-center gap-3 mb-4 mt-2">
              <input
                type="checkbox"
                id="specific_employees"
                className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                checked={selectSpecific}
                onChange={(e) => setSelectSpecific(e.target.checked)}
              />
              <label htmlFor="specific_employees" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                Process for specific employees only
              </label>
            </div>

            {selectSpecific && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-sm bg-white border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedIds.size} employees selected</span>
                  <button type="button" onClick={handleSelectAll} className="text-xs font-bold text-slate-900 hover:underline">
                    {selectedIds.size === employees?.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                <div className="h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredEmployees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 hover:bg-white p-2.5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(emp.id) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}>
                        {selectedIds.has(emp.id) && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="hidden"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{emp.full_name}</span>
                        <span className="text-xs text-slate-500 font-semibold">{emp.job_title}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="font-semibold text-slate-500">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-11 px-8 bg-slate-900 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 transition-all">
              {isLoading ? 'Processing...' : 'Create payroll run'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { CreatePayrollRunModal };
export default CreatePayrollRunModal;