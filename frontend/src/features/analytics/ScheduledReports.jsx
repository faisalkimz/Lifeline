import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Mail, Trash2, Plus, Clock, Loader2, Send } from 'lucide-react';
import {
    useGetReportSchedulesQuery,
    useCreateReportScheduleMutation,
    useDeleteReportScheduleMutation
} from '../../store/api';
import toast from 'react-hot-toast';

const ScheduledReports = () => {
    const { data: schedulesData, isLoading } = useGetReportSchedulesQuery();
    const schedules = Array.isArray(schedulesData) ? schedulesData : [];
    const [createSchedule, { isLoading: isCreating }] = useCreateReportScheduleMutation();
    const [deleteSchedule] = useDeleteReportScheduleMutation();

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        module: 'employees',
        frequency: 'weekly',
        recipients: ''
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createSchedule(formData).unwrap();
            toast.success("Report scheduled successfully!");
            setIsAdding(false);
            setFormData({ name: '', module: 'employees', frequency: 'weekly', recipients: '' });
        } catch (err) {
            toast.error("Failed to schedule report.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSchedule(id).unwrap();
            toast.success("Schedule removed.");
        } catch (err) {
            toast.error("Failed to remove schedule.");
        }
    };

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <Clock className="h-5 w-5 text-primary-600" />
                    Scheduled Reports
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary-200 text-primary-600 hover:bg-primary-50"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus className="h-4 w-4" />
                    New Schedule
                </Button>
            </CardHeader>
            <CardContent className="p-6">
                {isAdding && (
                    <form onSubmit={handleCreate} className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-top duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Report Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    placeholder="e.g. Weekly Payroll Summary"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Recipients (comma separated)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    placeholder="manager@company.com, hr@company.com"
                                    value={formData.recipients}
                                    onChange={e => setFormData({ ...formData, recipients: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Module</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.module}
                                    onChange={e => setFormData({ ...formData, module: e.target.value })}
                                >
                                    <option value="employees">Employees</option>
                                    <option value="payroll">Payroll</option>
                                    <option value="leave">Leave</option>
                                    <option value="attendance">Attendance</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Frequency</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={formData.frequency}
                                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit" className="bg-primary-600" disabled={isCreating}>
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Schedule"}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {isLoading ? (
                        <div className="py-10 text-center text-slate-400">Loading schedules...</div>
                    ) : schedules.length === 0 ? (
                        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            <Mail className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No reports scheduled yet.</p>
                        </div>
                    ) : (
                        schedules.map(schedule => (
                            <div key={schedule.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <Send className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{schedule.name}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded">{schedule.frequency}</span>
                                            <span>•</span>
                                            <span>Module: {schedule.module}</span>
                                            <span>•</span>
                                            <span>Recipients: {schedule.recipients?.split(',')?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-4 hidden md:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Last Run</p>
                                        <p className="text-xs text-slate-600">{schedule.last_run ? new Date(schedule.last_run).toLocaleDateString() : 'Never'}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-rose-500 hover:bg-rose-50"
                                        onClick={() => handleDelete(schedule.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ScheduledReports;
