import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User, Briefcase, FileText, CreditCard,
    Save, ArrowLeft, Upload, X, Wallet
} from 'lucide-react';
import {
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useGetEmployeeQuery,
    useGetDepartmentsQuery,
    useGetEmployeesQuery,
    useDeleteEmployeeMutation,
    useCreateSalaryStructureMutation,
    useUpdateSalaryStructureMutation
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

    // Compensation
    basic_salary: z.coerce.number().min(0, "Must be positive").optional().or(z.literal('')),
    housing_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    transport_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    medical_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    lunch_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    other_allowances: z.coerce.number().min(0).optional().or(z.literal('')),
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
    const { id: routeId } = useParams();
    // Normalize route id: strip any accidental leading ':' (defensive)
    const id = routeId ? String(routeId).replace(/^:/, '') : routeId;
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("personal");
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // API Hooks
    const { data: departmentsData } = useGetDepartmentsQuery();
    const { data: employeesData, error: employeesError } = useGetEmployeesQuery({ employment_status: 'active' }); // For manager select
    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(id, { skip: !isEditMode });

    // Fallback mock data when API is not available
    const mockDepartments = [
        { id: 1, name: 'Engineering', code: 'ENG' },
        { id: 2, name: 'Human Resources', code: 'HR' },
        { id: 3, name: 'Marketing', code: 'MKT' },
        { id: 4, name: 'Finance', code: 'FIN' },
    ];

    const mockEmployees = [
        { id: 1, full_name: 'John Doe', first_name: 'John', last_name: 'Doe' },
        { id: 2, full_name: 'Jane Smith', first_name: 'Jane', last_name: 'Smith' },
        { id: 3, full_name: 'Bob Johnson', first_name: 'Bob', last_name: 'Johnson' },
    ];

    // Use API data if available, otherwise use mock data
    let departments = mockDepartments; // Default to mock data
    if (Array.isArray(departmentsData) && departmentsData.length > 0) {
        departments = departmentsData;
    } else if (departmentsData && typeof departmentsData === 'object' && Array.isArray(departmentsData.results)) {
        // Handle paginated response
        departments = departmentsData.results;
    }
    // Ensure we always have an array
    if (!Array.isArray(departments)) {
        departments = mockDepartments;
    }

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

    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();

    const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();
    const [createSalaryStructure] = useCreateSalaryStructureMutation();
    const [updateSalaryStructure] = useUpdateSalaryStructureMutation();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            gender: 'male',
            employment_type: 'full_time',
            employment_status: 'active',
            marital_status: 'single',
        }
    });

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Load data if editing
    useEffect(() => {
        if (employeeData) {
            // Reset form with data, handling dates and nulls
            const formData = { ...employeeData };
            // Ensure department and manager are IDs
            formData.department = employeeData.department?.toString();
            formData.manager = employeeData.manager?.toString();

            // Map Salary Structure if exists
            if (employeeData.salary_structure) {
                formData.basic_salary = employeeData.salary_structure.basic_salary;
                formData.housing_allowance = employeeData.salary_structure.housing_allowance;
                formData.transport_allowance = employeeData.salary_structure.transport_allowance;
                formData.medical_allowance = employeeData.salary_structure.medical_allowance;
                formData.lunch_allowance = employeeData.salary_structure.lunch_allowance;
                formData.other_allowances = employeeData.salary_structure.other_allowances;
            }

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

            // Debug: log endpoint and payload summary
            try {
                // This shows the route id and whether we're sending a file
                console.debug('EmployeeForm submit', { id, isEditMode, hasFile: !!selectedFile });
            } catch (e) {
                // ignore
            }

            let employeeId = id;
            if (isEditMode) {
                // updateEmployee expects an object; we use formData to allow uploads
                await updateEmployee({ id, formData }).unwrap();
            } else {
                const res = await createEmployee(formData).unwrap();
                employeeId = res.id;
            }

            // Save Salary Structure
            // We strip empty strings to avoid sending invalid data if coerced logic allows it
            const salaryData = {
                basic_salary: data.basic_salary || 0,
                housing_allowance: data.housing_allowance || 0,
                transport_allowance: data.transport_allowance || 0,
                medical_allowance: data.medical_allowance || 0,
                lunch_allowance: data.lunch_allowance || 0,
                other_allowances: data.other_allowances || 0,
                effective_date: new Date().toISOString().split('T')[0] // Default to today
            };

            // Only create/update structure if basic_salary is provided
            if (data.basic_salary > 0) {
                if (isEditMode && employeeData?.salary_structure?.id) {
                    await updateSalaryStructure({ id: employeeData.salary_structure.id, ...salaryData });
                } else {
                    await createSalaryStructure({ employee: employeeId, ...salaryData });
                }
            }

            navigate('/employees');
        } catch (error) {
            // RTK Query throws an object; try to log useful fields and stringify response
            const payload = error?.data || error?.error || null;
            let payloadStr = null;
            try {
                payloadStr = payload ? JSON.stringify(payload) : String(payload);
            } catch (e) {
                payloadStr = String(payload);
            }

            console.error('Failed to save employee (detailed):', {
                message: error?.message || String(error),
                status: error?.status || error?.originalStatus || null,
                data: payload,
                dataString: payloadStr,
                meta: error?.meta || null
            });
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
                            <div className="relative h-32 w-32 rounded-full bg-gray-100 mb-4 overflow-hidden shadow-sm flex items-center justify-center">
                                {previewImage ? (
                                    <img src={getImageUrl(previewImage)} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-gray-300" />
                                )}
                            </div>
                            <h3 className="font-medium text-gray-900">Profile Photo</h3>
                            <p className="text-xs text-gray-500 mt-1 mb-3">Upload a clear headshot — square photos work best.</p>
                            <label className="inline-flex items-center gap-2 text-sm text-primary-600 cursor-pointer">
                                <Upload className="h-4 w-4" />
                                <span className="underline">Upload photo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-9">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <Card>
                            <CardHeader className="pb-0">
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <CardTitle className="text-lg">Employee Details</CardTitle>
                                        <p className="text-sm text-gray-500">Fill personal, employment and document details.</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <TabsList className="flex gap-2 bg-transparent p-0">
                                            <TabsTrigger value="personal" className="px-3 py-2 rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"> <User className="h-4 w-4 mr-2 inline" /> Personal</TabsTrigger>
                                            <TabsTrigger value="employment" className="px-3 py-2 rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"> <Briefcase className="h-4 w-4 mr-2 inline" /> Employment</TabsTrigger>
                                            <TabsTrigger value="compensation" className="px-3 py-2 rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"> <Wallet className="h-4 w-4 mr-2 inline" /> Compensation</TabsTrigger>
                                            <TabsTrigger value="documents" className="px-3 py-2 rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"> <FileText className="h-4 w-4 mr-2 inline" /> Documents</TabsTrigger>
                                            <TabsTrigger value="other" className="px-3 py-2 rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600"> <CreditCard className="h-4 w-4 mr-2 inline" /> Bank & Other</TabsTrigger>
                                        </TabsList>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* Personal Tab */}
                                    <TabsContent value="personal" className="space-y-6">
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
                                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('gender')}>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </FormField>
                                            <FormField label="Marital Status" error={errors.marital_status}>
                                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('marital_status')}>
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
                                    <TabsContent value="employment" className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Department" error={errors.department} required>
                                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('department')}>
                                                    <option value="">Select Department</option>
                                                    {departments.map(dept => (
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
                                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('manager')}>
                                                    <option value="">Select Manager (Optional)</option>
                                                    {employees.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                                    ))}
                                                </select>
                                            </FormField>
                                            <FormField label="Employment Type" error={errors.employment_type} required>
                                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('employment_type')}>
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
                                                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm" {...register('employment_status')}>
                                                    <option value="active">Active</option>
                                                    <option value="on_leave">On Leave</option>
                                                    <option value="suspended">Suspended</option>
                                                    <option value="terminated">Terminated</option>
                                                    <option value="resigned">Resigned</option>
                                                </select>
                                            </FormField>
                                        </div>
                                    </TabsContent>

                                    {/* Compensation Tab */}
                                    <TabsContent value="compensation" className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-blue-800 text-sm">
                                            Define the salary structure for this employee. This will be used to automatically calculate payslips during payroll processing.
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Basic Salary (Gross)" error={errors.basic_salary} required>
                                                <Input type="number" {...register('basic_salary')} placeholder="e.g. 2000000" />
                                            </FormField>
                                            <FormField label="Housing Allowance" error={errors.housing_allowance}>
                                                <Input type="number" {...register('housing_allowance')} placeholder="0" />
                                            </FormField>
                                            <FormField label="Transport Allowance" error={errors.transport_allowance}>
                                                <Input type="number" {...register('transport_allowance')} placeholder="0" />
                                            </FormField>
                                            <FormField label="Medical Allowance" error={errors.medical_allowance}>
                                                <Input type="number" {...register('medical_allowance')} placeholder="0" />
                                            </FormField>
                                            <FormField label="Lunch Allowance" error={errors.lunch_allowance}>
                                                <Input type="number" {...register('lunch_allowance')} placeholder="0" />
                                            </FormField>
                                            <FormField label="Other Allowances" error={errors.other_allowances}>
                                                <Input type="number" {...register('other_allowances')} placeholder="0" />
                                            </FormField>
                                        </div>
                                    </TabsContent>

                                    {/* Documents Tab */}
                                    <TabsContent value="documents" className="space-y-6">
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
                                    <TabsContent value="other" className="space-y-6">
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
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px] transition-shadow shadow-sm"
                                                {...register('notes')}
                                                placeholder="Any other important details..."
                                            />
                                        </FormField>
                                    </TabsContent>
                                </form>
                            </CardContent>
                        </Card>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormPage;
