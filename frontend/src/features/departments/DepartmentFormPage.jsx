import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Save, ArrowLeft, Trash2 } from 'lucide-react';
import {
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useGetDepartmentQuery,
    useGetDepartmentsQuery,
    useDeleteDepartmentMutation,
    useGetEmployeesQuery
} from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import toast from 'react-hot-toast';

// Validation Schema - Manager is optional, can be assigned later
const departmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    code: z.string().min(1, "Department code is required").max(10, "Code must be 10 characters or less"),
    description: z.string().optional(),
    manager: z.string().optional().nullable(), // Optional - assign managers later
    is_active: z.boolean().default(true),
});

const FormField = ({ label, error, children, required }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-error-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-error-500">{error.message}</p>}
    </div>
);

const DepartmentFormPage = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    // API Hooks
    const { data: departmentData, isLoading: isLoadingDepartment } = useGetDepartmentQuery(id, { skip: !isEditMode });
    const { data: employeesData, error: employeesError } = useGetEmployeesQuery({ employment_status: 'active' }); // For manager select

    // Fallback mock data when API is not available
    const mockEmployees = [
        { id: 1, full_name: 'John Doe' },
        { id: 2, full_name: 'Jane Smith' },
        { id: 3, full_name: 'Bob Johnson' },
    ];

    // Use API data if available, otherwise use mock data
    let employees = mockEmployees; // Default to mock data

    if (Array.isArray(employeesData) && employeesData.length > 0) {
        employees = employeesData;
    } else if (employeesData && typeof employeesData === 'object' && Array.isArray(employeesData.results)) {
        // Handle paginated response
        employees = employeesData.results;
    }

    // Ensure we always have an array
    if (!Array.isArray(employees)) {
        employees = mockEmployees;
    }

    const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
    const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
    const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();
    // This will be used to refetch after mutations
    const { refetch: refetchDepartments } = useGetDepartmentsQuery(undefined, { skip: true });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            is_active: true,
        }
    });

    // Load data if editing
    useEffect(() => {
        if (departmentData) {
            const formData = { ...departmentData };
            formData.manager = departmentData.manager?.toString();
            reset(formData);
        }
    }, [departmentData, reset]);

    const onSubmit = async (data) => {
        try {
            const cleanData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
            );

            if (isEditMode) {
                await updateDepartment({ id, ...cleanData }).unwrap();
                toast.success('Department updated successfully!');
            } else {
                await createDepartment(cleanData).unwrap();
                toast.success('Department created successfully!');
            }
            // Add a small delay to ensure cache invalidation completes
            setTimeout(() => navigate('/departments'), 500);
        } catch (error) {
            console.error('Failed to save department:', error);
            console.error('Error details:', error?.data, error?.status, error?.originalStatus);
            toast.error(error?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} department`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
            try {
                await deleteDepartment(id).unwrap();
                toast.success('Department deleted successfully!');
                refetchDepartments();
                navigate('/departments');
            } catch (error) {
                toast.error(error?.data?.error || 'Failed to delete department');
                console.error('Failed to delete department:', error);
            }
        }
    };

    if (isEditMode && isLoadingDepartment) {
        return <div className="p-8 text-center">Loading department details...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/departments')} className="btn-ghost p-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Department' : 'New Department'}
                        </h1>
                        <p className="text-gray-500">
                            {isEditMode ? `Update details for ${departmentData?.name}` : 'Create a new department'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditMode && (
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="btn-danger bg-error-50 text-error-600 hover:bg-error-100 hover:text-error-700 border-error-200"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/departments')} className="btn-secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isCreating || isUpdating} className="btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        {isCreating || isUpdating ? 'Saving...' : 'Save Department'}
                    </Button>
                </div>
            </div>

            {/* Form Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Department Name" error={errors.name} required>
                                <Input {...register('name')} placeholder="e.g. Engineering" />
                            </FormField>
                            <FormField label="Department Code" error={errors.code} required>
                                <Input {...register('code')} placeholder="e.g. ENG-01" />
                            </FormField>
                        </div>

                        <FormField label="Description" error={errors.description}>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px] transition-shadow shadow-sm"
                                {...register('description')}
                                placeholder="Describe the department's function..."
                            />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Manager" error={errors.manager}>
                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('manager')}>
                                    <option value="">Select Manager (Optional)</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                            </FormField>

                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                        {...register('is_active')}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active Department</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DepartmentFormPage;
