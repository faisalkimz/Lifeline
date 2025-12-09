// src/features/payroll/CreatePayrollRunModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCreatePayrollRunMutation } from '../../store/api';

const CreatePayrollRunModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: ''
  });

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
        description: formData.description || null
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

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description..."
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
    </Dialog>
  );
};

export { CreatePayrollRunModal };
export default CreatePayrollRunModal;