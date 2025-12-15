// src/features/payroll/CreatePayrollRunModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCreatePayrollRunMutation } from '../../store/api';

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

  const [createPayrollRun, { isLoading }] = useCreatePayrollRunMutation();

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
        payment_date: formData.payment_date
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
      alert('Error creating payroll run. Please try again.');
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
      {/* Removed forced bg-white/text-black → now respects light/dark mode */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Payroll Run</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pay Date</label>
              <Input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g. December Salaries + Bonuses"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
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