import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User, Briefcase, FileText, CreditCard,
    Save, ArrowLeft, Upload, X
} from 'lucide-react';
import {
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useGetEmployeeQuery,
    useGetDepartmentsQuery,
    useGetEmployeesQuery,
    useDeleteEmployeeMutation
} from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

// Validation Schema
const employeeSchema = z.object({
    // Personal Info
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    middle_name: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"]),
    marital_status: z.enum(["single", "married", "divorced", "widowed"]).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),

    // Employment
    department: z.string().min(1, "Department is required"),
    job_title: z.string().min(1, "Job title is required"),
    manager: z.string().optional().nullable(),
    employment_type: z.enum(["full_time", "part_time", "contract", "intern", "casual"]),
    employment_status: z.enum(["active", "on_leave", "suspended", "terminated", "resigned"]),
    join_date: z.string().min(1, "Join date is required"),
    probation_end_date: z.string().optional().nullable(),

    // Documents
    national_id: z.string().min(1, "National ID is required"),
    passport_number: z.string().optional(),
    tin_number: z.string().optional(),
    nssf_number: z.string().optional(),

    // Bank & Emergency
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_branch: z.string().optional(),
    mobile_money_number: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),

    notes: z.string().optional(),
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

const EmployeeFormPage = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("personal");
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // API Hooks
    const { data: departments } = useGetDepartmentsQuery();
    const { data: employees } = useGetEmployeesQuery({ employment_status: 'active' }); // For manager select
    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(id, { skip: !isEditMode });

    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();

    const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            gender: 'male',
            employment_type: 'full_time',
            employment_status: 'active',
            marital_status: 'single',
        }
    });

    // Load data if editing
    useEffect(() => {
        if (employeeData) {
            // Reset form with data, handling dates and nulls
            const formData = { ...employeeData };
            // Ensure department and manager are IDs
            formData.department = employeeData.department?.toString();
            formData.manager = employeeData.manager?.toString();
            reset(formData);
            if (employeeData.photo) setPreviewImage(employeeData.photo);
        }
    }, [employeeData, reset]);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            // Append all fields
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            if (isEditMode) {
                await updateEmployee({ id, formData }).unwrap();
            } else {
                await createEmployee(formData).unwrap();
            }
            navigate('/employees');
        } catch (error) {
            console.error('Failed to save employee:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            try {
                await deleteEmployee(id).unwrap();
                navigate('/employees');
            } catch (error) {
                console.error('Failed to delete employee:', error);
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isEditMode && isLoadingEmployee) {
        return <div className="p-8 text-center">Loading employee details...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/employees')} className="btn-ghost p-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Employee' : 'New Employee'}
                        </h1>
                        <p className="text-gray-500">
                            {isEditMode ? `Update details for ${employeeData?.employee_number}` : 'Add a new member to your team'}
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
                    <Button variant="outline" onClick={() => navigate('/employees')} className="btn-secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isCreating || isUpdating} className="btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        {isCreating || isUpdating ? 'Saving...' : 'Save Employee'}
                    </Button>
                </div>
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar / Photo */}
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="relative h-32 w-32 rounded-full bg-gray-100 mb-4 overflow-hidden ring-4 ring-white shadow-sm group">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Upload className="h-6 w-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <h3 className="font-medium text-gray-900">Profile Photo</h3>
                            <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-9">
                    <Card>
                        <CardHeader className="border-b border-gray-100 pb-0">
                            <Tabs value={activeTab} className="w-full">
                                <TabsList className="w-full justify-start bg-transparent p-0 gap-6">
                                    <TabsTrigger
                                        value="personal"
                                        activeValue={activeTab}
                                        onClick={setActiveTab}
                                        className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Personal
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="employment"
                                        activeValue={activeTab}
                                        onClick={setActiveTab}
                                        className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Employment
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="documents"
                                        activeValue={activeTab}
                                        onClick={setActiveTab}
                                        className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Documents
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="other"
                                        activeValue={activeTab}
                                        onClick={setActiveTab}
                                        className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Bank & Other
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>

                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Personal Tab */}
                                <TabsContent value="personal" activeValue={activeTab} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label="First Name" error={errors.first_name} required>
                                            <Input {...register('first_name')} placeholder="e.g. John" />
                                        </FormField>
                                        <FormField label="Middle Name" error={errors.middle_name}>
                                            <Input {...register('middle_name')} placeholder="e.g. Davis" />
                                        </FormField>
                                        <FormField label="Last Name" error={errors.last_name} required>
                                            <Input {...register('last_name')} placeholder="e.g. Doe" />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Email Address" error={errors.email} required>
                                            <Input type="email" {...register('email')} placeholder="john.doe@company.com" />
                                        </FormField>
                                        <FormField label="Phone Number" error={errors.phone} required>
                                            <Input {...register('phone')} placeholder="+256 700 000000" />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label="Date of Birth" error={errors.date_of_birth} required>
                                            <Input type="date" {...register('date_of_birth')} />
                                        </FormField>
                                        <FormField label="Gender" error={errors.gender} required>
                                            <select className="input-field" {...register('gender')}>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </FormField>
                                        <FormField label="Marital Status" error={errors.marital_status}>
                                            <select className="input-field" {...register('marital_status')}>
                                                <option value="single">Single</option>
                                                <option value="married">Married</option>
                                                <option value="divorced">Divorced</option>
                                                <option value="widowed">Widowed</option>
                                            </select>
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Address" error={errors.address}>
                                            <Input {...register('address')} placeholder="Street address, Apt, etc." />
                                        </FormField>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="City" error={errors.city}>
                                                <Input {...register('city')} placeholder="Kampala" />
                                            </FormField>
                                            <FormField label="District" error={errors.district}>
                                                <Input {...register('district')} placeholder="Kampala" />
                                            </FormField>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Employment Tab */}
                                <TabsContent value="employment" activeValue={activeTab} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Department" error={errors.department} required>
                                            <select className="input-field" {...register('department')}>
                                                <option value="">Select Department</option>
                                                {departments?.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </FormField>
                                        <FormField label="Job Title" error={errors.job_title} required>
                                            <Input {...register('job_title')} placeholder="e.g. Senior Developer" />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Manager" error={errors.manager}>
                                            <select className="input-field" {...register('manager')}>
                                                <option value="">Select Manager (Optional)</option>
                                                {employees?.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                                ))}
                                            </select>
                                        </FormField>
                                        <FormField label="Employment Type" error={errors.employment_type} required>
                                            <select className="input-field" {...register('employment_type')}>
                                                <option value="full_time">Full Time</option>
                                                <option value="part_time">Part Time</option>
                                                <option value="contract">Contract</option>
                                                <option value="intern">Intern</option>
                                                <option value="casual">Casual</option>
                                            </select>
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label="Join Date" error={errors.join_date} required>
                                            <Input type="date" {...register('join_date')} />
                                        </FormField>
                                        <FormField label="Probation End" error={errors.probation_end_date}>
                                            <Input type="date" {...register('probation_end_date')} />
                                        </FormField>
                                        <FormField label="Status" error={errors.employment_status} required>
                                            <select className="input-field" {...register('employment_status')}>
                                                <option value="active">Active</option>
                                                <option value="on_leave">On Leave</option>
                                                <option value="suspended">Suspended</option>
                                                <option value="terminated">Terminated</option>
                                                <option value="resigned">Resigned</option>
                                            </select>
                                        </FormField>
                                    </div>
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents" activeValue={activeTab} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="National ID (NIN)" error={errors.national_id} required>
                                            <Input {...register('national_id')} placeholder="CM..." />
                                        </FormField>
                                        <FormField label="Passport Number" error={errors.passport_number}>
                                            <Input {...register('passport_number')} placeholder="A..." />
                                        </FormField>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="TIN Number" error={errors.tin_number}>
                                            <Input {...register('tin_number')} placeholder="100..." />
                                        </FormField>
                                        <FormField label="NSSF Number" error={errors.nssf_number}>
                                            <Input {...register('nssf_number')} placeholder="NS..." />
                                        </FormField>
                                    </div>
                                </TabsContent>

                                {/* Bank & Other Tab */}
                                <TabsContent value="other" activeValue={activeTab} className="space-y-6">
                                    <h4 className="font-medium text-gray-900 border-b pb-2">Bank Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label="Bank Name" error={errors.bank_name}>
                                            <Input {...register('bank_name')} placeholder="e.g. Stanbic Bank" />
                                        </FormField>
                                        <FormField label="Account Number" error={errors.bank_account_number}>
                                            <Input {...register('bank_account_number')} placeholder="0123..." />
                                        </FormField>
                                        <FormField label="Branch" error={errors.bank_branch}>
                                            <Input {...register('bank_branch')} placeholder="e.g. Forest Mall" />
                                        </FormField>
                                    </div>

                                    <h4 className="font-medium text-gray-900 border-b pb-2 pt-4">Emergency Contact</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField label="Contact Name" error={errors.emergency_contact_name}>
                                            <Input {...register('emergency_contact_name')} placeholder="Next of Kin" />
                                        </FormField>
                                        <FormField label="Phone" error={errors.emergency_contact_phone}>
                                            <Input {...register('emergency_contact_phone')} placeholder="+256..." />
                                        </FormField>
                                        <FormField label="Relationship" error={errors.emergency_contact_relationship}>
                                            <Input {...register('emergency_contact_relationship')} placeholder="Spouse, Parent, etc." />
                                        </FormField>
                                    </div>

                                    <h4 className="font-medium text-gray-900 border-b pb-2 pt-4">Notes</h4>
                                    <FormField label="Additional Notes" error={errors.notes}>
                                        <textarea
                                            className="input-field min-h-[100px]"
                                            {...register('notes')}
                                            placeholder="Any other important details..."
                                        />
                                    </FormField>
                                </TabsContent>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormPage;
