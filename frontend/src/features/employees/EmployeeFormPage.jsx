import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User, Briefcase, FileText, CreditCard,
    Save, ArrowLeft, Upload, X, Wallet,
    CheckCircle, ChevronRight, Star, Sparkles,
    Building2, Calendar, Phone, Mail, MapPin, Shield,
    Lock, Key
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
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import toast from 'react-hot-toast';

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

    // User Account
    create_user: z.boolean().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    role: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.create_user) {
        if (!data.username) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Username is required for system access",
                path: ["username"]
            });
        }
        if (!data.password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password is required for system access",
                path: ["password"]
            });
        }
        if (data.password && data.password.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters",
                path: ["password"]
            });
        }
        if (!data.role) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Role is required",
                path: ["role"]
            });
        }
    }
});

const FormField = ({ label, error, children, required, icon: Icon }) => (
    <div className="space-y-1.5 group">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            {Icon && <Icon className="h-3.5 w-3.5 text-primary-400 group-focus-within:text-primary-600 transition-colors" />}
            {label} {required && <span className="text-pink-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-pink-500 font-medium ml-1 animate-pulse">{error.message}</p>}
    </div>
);

const EmployeeFormPage = () => {
    const { id: routeId } = useParams();
    const id = routeId ? String(routeId).replace(/^:/, '') : routeId;
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("personal");
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // API Hooks
    const { data: departmentsData } = useGetDepartmentsQuery();
    const { data: employeesData } = useGetEmployeesQuery({ employment_status: 'active' });
    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(id, { skip: !isEditMode });

    // Process API Data - NO MOCK DATA FALLBACKS
    const departments = Array.isArray(departmentsData?.results) ? departmentsData.results : (Array.isArray(departmentsData) ? departmentsData : []);
    const employees = Array.isArray(employeesData?.results) ? employeesData.results : (Array.isArray(employeesData) ? employeesData : []);

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
            create_user: false,
            role: 'employee'
        }
    });

    const createUser = watch('create_user');
    const autoPassword = watch('auto_password');

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    useEffect(() => {
        if (employeeData) {
            const formData = { ...employeeData };
            formData.department = employeeData.department?.toString();
            formData.manager = employeeData.manager?.toString();

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
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    // Handle booleans properly
                    if (typeof data[key] === 'boolean') {
                        formData.append(key, data[key] ? 'true' : 'false');
                    } else {
                        formData.append(key, data[key]);
                    }
                }
            });

            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            let employeeId = id;
            if (isEditMode) {
                await updateEmployee({ id, formData }).unwrap();
                toast.success("Employee updated successfully");
            } else {
                const res = await createEmployee(formData).unwrap();
                employeeId = res.id;
                toast.success("Employee created successfully");
                if (data.create_user) {
                    toast.success("User account created!", { icon: '🔐' });
                }
            }

            const salaryData = {
                basic_salary: data.basic_salary || 0,
                housing_allowance: data.housing_allowance || 0,
                transport_allowance: data.transport_allowance || 0,
                medical_allowance: data.medical_allowance || 0,
                lunch_allowance: data.lunch_allowance || 0,
                other_allowances: data.other_allowances || 0,
                effective_date: new Date().toISOString().split('T')[0]
            };

            if (data.basic_salary > 0) {
                if (isEditMode && employeeData?.salary_structure?.id) {
                    await updateSalaryStructure({ id: employeeData.salary_structure.id, ...salaryData });
                } else {
                    await createSalaryStructure({ employee: employeeId, ...salaryData });
                }
            }

            navigate('/employees');
        } catch (error) {
            console.error('Failed to save employee:', error);
            const errorMsg = error?.data?.detail
                || (Array.isArray(error?.data?.non_field_errors) ? error.data.non_field_errors[0] : null)
                || "Failed to save employee. Please check the form.";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure? This action is irreversible.')) {
            try {
                await deleteEmployee(id).unwrap();
                toast.success("Employee deleted");
                navigate('/employees');
            } catch (error) {
                toast.error("Failed to delete employee");
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (isEditMode && isLoadingEmployee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary-600">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-current mb-4"></div>
                <p className="animate-pulse font-medium">Loading Employee Profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Premium Header */}
            <div className="relative rounded-3xl bg-slate-900 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/employees')}
                            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-105"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary-500/20 text-primary-200 border border-primary-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    {isEditMode ? 'Update Profile' : 'New Hire'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                {isEditMode ? `${employeeData?.first_name} ${employeeData?.last_name}` : 'Onboard Employee'}
                            </h1>
                            <p className="text-slate-400 mt-2 font-light text-lg">
                                {isEditMode ? 'Manage role, compensation, and personal details.' : 'Welcome a new talent to the team.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {isEditMode && (
                            <Button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/30 backdrop-blur-md transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Profile'}
                            </Button>
                        )}
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isCreating || isUpdating}
                            className="bg-white text-slate-900 hover:bg-slate-100 border-none font-bold px-8 py-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {isCreating || isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-xl overflow-hidden relative group bg-white dark:bg-slate-800">
                        <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-primary-500 to-purple-600 transition-all duration-500 group-hover:h-36"></div>
                        <CardContent className="pt-24 pb-8 px-6 flex flex-col items-center relative z-10 text-center">
                            <div className="relative mb-6">
                                <div className="h-40 w-40 rounded-3xl rotate-3 absolute inset-0 bg-primary-200 blur-sm transform transition-all group-hover:rotate-6"></div>
                                <div className="h-40 w-40 rounded-3xl -rotate-3 absolute inset-0 bg-purple-200 blur-sm transform transition-all group-hover:-rotate-6"></div>
                                <div className="h-40 w-40 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                    {previewImage ? (
                                        <img src={getImageUrl(previewImage)} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                            <User className="h-16 w-16 text-slate-300" />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-300 rounded-2xl">
                                        <Upload className="h-8 w-8 mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Change Photo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {watch('first_name') || 'New'} {watch('last_name') || 'Employee'}
                            </h3>
                            <p className="text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/30 px-4 py-1 rounded-full text-sm inline-block">
                                {watch('job_title') || 'Role Designation'}
                            </p>
                            {createUser && (
                                <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                                    <Key className="h-3 w-3" /> System Access Enabled
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                            <h4 className="font-bold">Form Assistant</h4>
                        </div>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                                <p>Mandatory fields are marked with a pink asterisk (<span className="text-pink-500">*</span>).</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                                <p>Granting system access allows employees to view their own payslips and apply for leave.</p>
                            </div>
                            {!departments.length && (
                                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg text-red-200 text-xs">
                                    <p className="font-bold mb-1">Warning: No Departments Found</p>
                                    Please create a department first before adding employees.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Form Fields */}
                <div className="lg:col-span-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 gap-1">
                            {[
                                { id: 'personal', icon: User, label: 'Personal' },
                                { id: 'employment', icon: Briefcase, label: 'Work' },
                                { id: 'compensation', icon: Wallet, label: 'Pay' },
                                { id: 'access', icon: Lock, label: 'Access' }, // NEW TAB
                                { id: 'documents', icon: Shield, label: 'Docs' },
                                { id: 'other', icon: CreditCard, label: 'Extra' },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-md py-3 rounded-lg flex flex-col items-center gap-1 transition-all"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    <span className="text-xs font-semibold">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <Card className="border-none shadow-xl bg-white dark:bg-slate-800 min-h-[500px]">
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in">
                                    {/* Personal Tab */}
                                    <TabsContent value="personal" className="space-y-8 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField label="First Name" error={errors.first_name} required icon={User}>
                                                <Input {...register('first_name')} placeholder="e.g. John" className="h-11" />
                                            </FormField>
                                            <FormField label="Middle Name" error={errors.middle_name} icon={User}>
                                                <Input {...register('middle_name')} placeholder="e.g. Davis" className="h-11" />
                                            </FormField>
                                            <FormField label="Last Name" error={errors.last_name} required icon={User}>
                                                <Input {...register('last_name')} placeholder="e.g. Doe" className="h-11" />
                                            </FormField>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Email Address" error={errors.email} required icon={Mail}>
                                                <Input type="email" {...register('email')} placeholder="john.doe@company.com" className="h-11" />
                                            </FormField>
                                            <FormField label="Phone Number" error={errors.phone} required icon={Phone}>
                                                <Input {...register('phone')} placeholder="+256 700 000000" className="h-11" />
                                            </FormField>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField label="Date of Birth" error={errors.date_of_birth} required icon={Calendar}>
                                                <Input type="date" {...register('date_of_birth')} className="h-11" />
                                            </FormField>
                                            <FormField label="Gender" error={errors.gender} required icon={User}>
                                                <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('gender')}>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </FormField>
                                            <FormField label="Marital Status" error={errors.marital_status} icon={User}>
                                                <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('marital_status')}>
                                                    <option value="single">Single</option>
                                                    <option value="married">Married</option>
                                                    <option value="divorced">Divorced</option>
                                                    <option value="widowed">Widowed</option>
                                                </select>
                                            </FormField>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Address" error={errors.address} icon={MapPin}>
                                                <Input {...register('address')} placeholder="Street address, Apt, etc." className="h-11" />
                                            </FormField>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField label="City" error={errors.city} icon={MapPin}>
                                                    <Input {...register('city')} placeholder="Kampala" className="h-11" />
                                                </FormField>
                                                <FormField label="District" error={errors.district} icon={MapPin}>
                                                    <Input {...register('district')} placeholder="Kampala" className="h-11" />
                                                </FormField>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Employment Tab */}
                                    <TabsContent value="employment" className="space-y-8 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Department" error={errors.department} required icon={Building2}>
                                                <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('department')}>
                                                    <option value="">Select Department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                                {!departments.length && (
                                                    <p className="text-xs text-amber-600 mt-1">No departments found. Please create one.</p>
                                                )}
                                            </FormField>
                                            <FormField label="Job Title" error={errors.job_title} required icon={Briefcase}>
                                                <Input {...register('job_title')} placeholder="e.g. Senior Developer" className="h-11" />
                                            </FormField>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Reporting Manager" error={errors.manager} icon={User}>
                                                <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('manager')}>
                                                    <option value="">Select Manager (Optional)</option>
                                                    {employees.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                                    ))}
                                                </select>
                                            </FormField>
                                            <FormField label="Employment Type" error={errors.employment_type} required icon={Briefcase}>
                                                <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('employment_type')}>
                                                    <option value="full_time">Full Time</option>
                                                    <option value="part_time">Part Time</option>
                                                    <option value="contract">Contract</option>
                                                    <option value="intern">Intern</option>
                                                    <option value="casual">Casual</option>
                                                </select>
                                            </FormField>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField label="Join Date" error={errors.join_date} required icon={Calendar}>
                                                <Input type="date" {...register('join_date')} className="h-11" />
                                            </FormField>
                                            <FormField label="Probation End" error={errors.probation_end_date} icon={Calendar}>
                                                <Input type="date" {...register('probation_end_date')} className="h-11" />
                                            </FormField>
                                            <FormField label="Current Status" error={errors.employment_status} required icon={CheckCircle}>
                                                <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('employment_status')}>
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
                                    <TabsContent value="compensation" className="space-y-8 mt-0">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                                    <Wallet className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-blue-900">Salary Structure</h4>
                                                    <p className="text-blue-700 text-sm mt-1">
                                                        Define the gross salary below. The system will automatically calculate PAYE, NSSF, and other deductions on the Payslip generation page.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Basic Salary (Gross)" error={errors.basic_salary} required icon={Wallet}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                                    <Input type="number" {...register('basic_salary')} placeholder="e.g. 2000000" className="pl-12 h-11 font-mono" />
                                                </div>
                                            </FormField>
                                            <FormField label="Housing Allowance" error={errors.housing_allowance} icon={Wallet}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                                    <Input type="number" {...register('housing_allowance')} placeholder="0" className="pl-12 h-11 font-mono" />
                                                </div>
                                            </FormField>
                                            <FormField label="Transport Allowance" error={errors.transport_allowance} icon={Wallet}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                                    <Input type="number" {...register('transport_allowance')} placeholder="0" className="pl-12 h-11 font-mono" />
                                                </div>
                                            </FormField>
                                            <FormField label="Medical Allowance" error={errors.medical_allowance} icon={Wallet}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                                    <Input type="number" {...register('medical_allowance')} placeholder="0" className="pl-12 h-11 font-mono" />
                                                </div>
                                            </FormField>
                                            <FormField label="Lunch Allowance" error={errors.lunch_allowance} icon={Wallet}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                                    <Input type="number" {...register('lunch_allowance')} placeholder="0" className="pl-12 h-11 font-mono" />
                                                </div>
                                            </FormField>
                                            <FormField label="Other Allowances" error={errors.other_allowances} icon={Wallet}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                                    <Input type="number" {...register('other_allowances')} placeholder="0" className="pl-12 h-11 font-mono" />
                                                </div>
                                            </FormField>
                                        </div>
                                    </TabsContent>

                                    {/* ACCESS TAB (New) */}
                                    <TabsContent value="access" className="space-y-8 mt-0">
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                                    <Lock className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-emerald-900">System Access</h4>
                                                    <p className="text-emerald-700 text-sm mt-1">
                                                        Create a login account for this employee to access the portal. They will be able to view their payslips and request leave.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors bg-slate-50">
                                            <input
                                                type="checkbox"
                                                id="create_user"
                                                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                {...register('create_user')}
                                            />
                                            <label htmlFor="create_user" className="font-semibold text-slate-900 cursor-pointer select-none">
                                                Create Login Account
                                            </label>
                                        </div>

                                        {createUser && (
                                            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField label="Username" error={errors.username} required icon={User}>
                                                        <Input {...register('username')} placeholder="e.g. john.doe (optional, defaults to email)" className="h-11" />
                                                    </FormField>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                            <input
                                                                type="checkbox"
                                                                id="auto_password"
                                                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                                {...register('auto_password')}
                                                            />
                                                            <label htmlFor="auto_password" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                                                Auto-generate Password
                                                            </label>
                                                        </div>

                                                        <FormField label="Password" error={errors.password} required={!autoPassword} icon={Lock}>
                                                            <Input
                                                                type="password"
                                                                {...register('password', { required: createUser && !autoPassword })}
                                                                placeholder={autoPassword ? "Password will be auto-generated" : "••••••••"}
                                                                className="h-11 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                                disabled={autoPassword}
                                                            />
                                                        </FormField>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1">
                                                    <FormField label="System Role" error={errors.role} required icon={Shield}>
                                                        <select className="ui-select w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary-500" {...register('role')}>
                                                            <option value="employee">Employee (View Self Only)</option>
                                                            <option value="manager">Manager (View Team)</option>
                                                            <option value="hr_manager">HR Manager (Full HR Access)</option>
                                                        </select>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            <strong>Employee:</strong> Can only view their own payslips and limited profile info. <br />
                                                            <strong>Manager:</strong> Can view their team members. <br />
                                                            <strong>HR Manager:</strong> Full access to all employee data and settings.
                                                        </p>
                                                    </FormField>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Documents Tab */}
                                    <TabsContent value="documents" className="space-y-8 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="National ID (NIN)" error={errors.national_id} required icon={Shield}>
                                                <Input {...register('national_id')} placeholder="CM..." className="h-11 uppercase" />
                                            </FormField>
                                            <FormField label="Passport Number" error={errors.passport_number} icon={Shield}>
                                                <Input {...register('passport_number')} placeholder="A..." className="h-11 uppercase" />
                                            </FormField>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="TIN Number" error={errors.tin_number} icon={FileText}>
                                                <Input {...register('tin_number')} placeholder="100..." className="h-11" />
                                            </FormField>
                                            <FormField label="NSSF Number" error={errors.nssf_number} icon={FileText}>
                                                <Input {...register('nssf_number')} placeholder="NS..." className="h-11" />
                                            </FormField>
                                        </div>
                                    </TabsContent>

                                    {/* Bank & Other Tab */}
                                    <TabsContent value="other" className="space-y-8 mt-0">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Bank Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormField label="Bank Name" error={errors.bank_name} icon={CreditCard}>
                                                    <Input {...register('bank_name')} placeholder="e.g. Stanbic Bank" className="h-11" />
                                                </FormField>
                                                <FormField label="Account Number" error={errors.bank_account_number} icon={CreditCard}>
                                                    <Input {...register('bank_account_number')} placeholder="0123..." className="h-11 font-mono" />
                                                </FormField>
                                                <FormField label="Branch" error={errors.bank_branch} icon={MapPin}>
                                                    <Input {...register('bank_branch')} placeholder="e.g. Forest Mall" className="h-11" />
                                                </FormField>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Emergency Contact</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormField label="Contact Name" error={errors.emergency_contact_name} icon={User}>
                                                    <Input {...register('emergency_contact_name')} placeholder="Next of Kin" className="h-11" />
                                                </FormField>
                                                <FormField label="Phone" error={errors.emergency_contact_phone} icon={Phone}>
                                                    <Input {...register('emergency_contact_phone')} placeholder="+256..." className="h-11" />
                                                </FormField>
                                                <FormField label="Relationship" error={errors.emergency_contact_relationship} icon={User}>
                                                    <Input {...register('emergency_contact_relationship')} placeholder="Spouse, Parent, etc." className="h-11" />
                                                </FormField>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Notes</h4>
                                            <FormField label="Additional Notes" error={errors.notes} icon={FileText}>
                                                <textarea
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] transition-shadow shadow-sm resize-none"
                                                    {...register('notes')}
                                                    placeholder="Any other important details..."
                                                />
                                            </FormField>
                                        </div>
                                    </TabsContent>

                                    {/* Action Buttons at Bottom */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
                                        <Button variant="outline" type="button" onClick={() => navigate('/employees')} className="h-11 px-6">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isCreating || isUpdating}
                                            className="h-11 px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {isCreating || isUpdating ? 'Saving Employee...' : 'Save & Finish'}
                                        </Button>
                                    </div>
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
