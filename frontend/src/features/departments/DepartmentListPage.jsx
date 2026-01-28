import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Building, Users, Edit, Trash2, Briefcase
} from 'lucide-react';
import {
    useGetDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} from '../../store/api';
import toast from 'react-hot-toast';

const DepartmentListPage = () => {
    const { data: departments, isLoading } = useGetDepartmentsQuery();
    const [createDepartment] = useCreateDepartmentMutation();
    const [updateDepartment] = useUpdateDepartmentMutation();
    const [deleteDepartment] = useDeleteDepartmentMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        manager: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateDepartment({ id: selectedDept.id, ...formData }).unwrap();
                toast.success('Department updated!');
            } else {
                await createDepartment(formData).unwrap();
                toast.success('Department created!');
            }
            setIsDialogOpen(false);
            setFormData({ name: '', description: '', manager: '' });
            setIsEditMode(false);
            setSelectedDept(null);
        } catch (error) {
            toast.error('Failed to save department');
        }
    };

    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setFormData({
            name: dept.name,
            description: dept.description || '',
            manager: dept.manager || ''
        });
        setIsEditMode(true);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this department?')) {
            try {
                await deleteDepartment(id).unwrap();
                toast.success('Department deleted');
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const handleNewDepartment = () => {
        setFormData({ name: '', description: '', manager: '' });
        setIsEditMode(false);
        setSelectedDept(null);
        setIsDialogOpen(true);
    };

    const departmentsArray = Array.isArray(departments) ? departments : (departments?.results || []);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-600 mt-1">Manage your company departments</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleNewDepartment}
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                        >
                            <Plus className="h-4 w-4 mr-2" /> New Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white border-0 rounded-2xl p-0 overflow-hidden shadow-2xl">
                        <div className="bg-white px-8 pt-8 pb-4">
                            <DialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight">
                                {isEditMode ? 'Edit department' : 'Create a new department'}
                            </DialogTitle>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                Departments help you organize your team and manage permissions effectively.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-8">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">Department Name</label>
                                <input
                                    className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Engineering or Human Resources"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">What do they do? (Optional)</label>
                                <textarea
                                    className="w-full min-h-[120px] p-4 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-none outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="A brief description of this team's responsibilities..."
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                                <Button
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    variant="ghost"
                                    className="h-11 px-6 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition-all"
                                >
                                    {isEditMode ? 'Update department' : 'Create department'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Departments Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>)}
                </div>
            ) : departmentsArray.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No departments yet</h3>
                    <p className="text-gray-600 mb-4">Create your first department to get started</p>
                    <Button onClick={handleNewDepartment}>
                        <Plus className="h-4 w-4 mr-2" /> Create Department
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentsArray.map(dept => (
                        <Card key={dept.id} className="hover:shadow-md transition-shadow border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(dept)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(dept.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{dept.name}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dept.description || 'No description'}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{dept.employee_count || 0} employees</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DepartmentListPage;
