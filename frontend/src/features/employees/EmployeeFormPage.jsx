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
    Lock, Key, ChevronLeft, Home, Info, AlertTriangle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useGetEmployeeQuery,
    useGetDepartmentsQuery,
    useGetEmployeesQuery,
    useDeleteEmployeeMutation,
    useCreateSalaryStructureMutation,
    useUpdateSalaryStructureMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config/api';

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
    auto_password: z.boolean().optional(),
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
        if (!data.auto_password && !data.password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password is required if not auto-generated",
                path: ["password"]
            });
        }
        if (!data.auto_password && data.password && data.password.length < 6) {
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
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 group"
    >
        <div className="flex items-center justify-between px-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-all">
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors" />
                {Icon && <Icon className="h-4 w-4 text-slate-400" />}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        </div>
        <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/0 rounded-2xl transition-all duration-500 group-focus-within:from-primary-500/20 group-focus-within:via-indigo-500/20 group-focus-within:to-purple-500/20 pointer-events-none" />
            {children}
            {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error.message}</p>
            )}
        </div>
    </motion.div>
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

    // Current user info (used to check permissions for creating/updating salary structures)
    const { data: currentUser } = useGetCurrentUserQuery();
    const canManageSalaries = ['hr_manager', 'company_admin', 'super_admin'].includes(currentUser?.role);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            gender: 'male',
            employment_type: 'full_time',
            employment_status: 'active',
            marital_status: 'single',
            create_user: false,
            auto_password: true,
            role: 'employee'
        }
    });

    const watchedFields = watch();
    const calculateProgress = () => {
        const fields = ['first_name', 'last_name', 'email', 'phone', 'department', 'job_title', 'national_id'];
        const completed = fields.filter(f => !!watchedFields[f]).length;
        return Math.round((completed / fields.length) * 100);
    };
    const progress = calculateProgress();

    const createUser = watch('create_user');
    const autoPassword = watch('auto_password');

    const getImageUrl = (path) => {
        return getMediaUrl(path);
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
                if (!canManageSalaries) {
                    toast.error('You do not have permission to set salary structures. Please ask an HR/Admin to set this.');
                } else {
                    if (isEditMode && employeeData?.salary_structure?.id) {
                        try {
                            await updateSalaryStructure({ id: employeeData.salary_structure.id, ...salaryData }).unwrap();
                        } catch (err) {
                            console.error('Failed to update salary structure:', err);
                            const applied = applyServerErrors(err);
                            if (!applied) {
                                const msg = err?.data || err?.message || 'Failed to update salary structure';
                                toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
                            }
                        }
                    } else {
                        try {
                            await createSalaryStructure({ employee: employeeId, ...salaryData }).unwrap();
                        } catch (err) {
                            console.error('Failed to create salary structure:', err);
                            const applied = applyServerErrors(err);
                            if (!applied) {
                                const msg = err?.data || err?.message || 'Failed to create salary structure';
                                toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
                            }
                        }
                    }
                }
            }

            navigate('/employees');
        } catch (error) {
            console.error('Failed to save employee:', error);
            const applied = applyServerErrors(error);
            if (!applied) {
                const errorMsg = error?.data?.detail
                    || (Array.isArray(error?.data?.non_field_errors) ? error.data.non_field_errors[0] : null)
                    || "Failed to save employee. Please check the form.";
                toast.error(errorMsg);
            }
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

    // Map backend validation errors into react-hook-form or show toasts
    const applyServerErrors = (err) => {
        const data = err?.data ?? err;
        if (!data) return false;

        let applied = false;

        // Simple string response
        if (typeof data === 'string') {
            toast.error(data);
            return true;
        }

        // Array of messages
        if (Array.isArray(data)) {
            toast.error(data.join(' '));
            return true;
        }

        // Object mapping field -> [messages]
        if (typeof data === 'object') {
            Object.entries(data).forEach(([key, val]) => {
                const message = Array.isArray(val) ? val.join(' ') : (typeof val === 'object' ? JSON.stringify(val) : String(val));
                if (key === 'non_field_errors' || key === 'detail') {
                    toast.error(message);
                    applied = true;
                } else {
                    // Map to form field errors where possible
                    try {
                        setError(key, { type: 'server', message });
                        applied = true;
                    } catch (e) {
                        // If setError fails for unknown fields, fallback to toast
                        toast.error(message);
                        applied = true;
                    }
                }
            });
        }

        return applied;
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
        <div className="min-h-screen bg-white text-slate-800 selection:bg-primary-500/10">
            {/* Subtle header accent */}
            <div className="relative z-0">
                <div className="w-full h-1 bg-gradient-to-r from-primary-600 to-indigo-500 opacity-10 mb-4" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-12 pb-20">
                {/* Premium Header - NEXT-GEN STYLE */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-lg bg-white border border-slate-200 shadow-sm"
                >
                    {/* Interior Glows */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]" />

                    <div className="relative z-10 px-12 py-14">
                        <div className="flex items-center gap-4 mb-10 overflow-hidden">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-md border border-slate-200"
                            >
                                <Home className="h-3.5 w-3.5 text-primary-400" />
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/employees')}>Employee List</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-400">{isEditMode ? 'Edit Employee' : 'New Onboarding'}</span>
                            </motion.div>
                        </div>

                        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
                                        <div className="h-2 w-2 rounded-full bg-primary-500/30 animate-ping" />
                                    </div>
                                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Integrated HR System</span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    {isEditMode ? 'Edit Employee' : 'New Employee'}
                                </h1>
                                <p className="text-sm text-slate-400">
                                    {isEditMode ? 'Update employee details and organizational information.' : 'Create a new employee profile.'}
                                </p>
                            </div>

                            <div className="hidden" />
                        </div>
                    </div>
                </motion.div>


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Visual Sidebar - ULTRA PREMIUM */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="sticky top-8 bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-md overflow-hidden bg-slate-700 flex items-center justify-center">
                                    {previewImage ? (
                                        <img src={getImageUrl(previewImage)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-slate-800">{(watch('first_name') || '') + ' ' + (watch('last_name') || '')}</div>
                                    <div className="text-sm text-slate-400">{watch('job_title') || 'No Title'}</div>
                                    <div className="text-xs text-slate-600 mt-2">Status: <span className="font-semibold text-slate-800">{watch('employment_status')?.replace('_',' ') || 'Pending'}</span></div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-[10px] uppercase text-slate-400 font-black mb-2">Form Completion</div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-primary-600" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="text-xs text-slate-400 mt-2">{progress}% complete</div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm text-slate-300 font-medium">Upload Photo</label>
                                <input type="file" className="mt-2" accept="image/*" aria-label="Upload profile photo" onChange={handleImageChange} />
                            </div>
                        </div>


                        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                            <h4 className="font-semibold text-slate-800 mb-2">Quick Tips</h4>
                            <ul className="text-sm text-slate-400 space-y-2">
                                <li>• Fill mandatory fields (First name, Last name, Email, Phone, Department, Job title, National ID).</li>
                                <li>• Assign a role only if system access is required.</li>
                                <li>• Upload a clear profile photo for easier identification.</li>
                                <li className="text-xs text-slate-500 mt-3">Departments loaded: {departments.length}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Form Fields - REDESIGNED */}
                    <div className="lg:col-span-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="flex gap-2 mb-6">
                                {[
                                    { id: 'personal', icon: User, label: 'Identity', step: '01' },
                                    { id: 'employment', icon: Briefcase, label: 'Employment', step: '02' },
                                    { id: 'compensation', icon: Wallet, label: 'Salary', step: '03' },
                                    { id: 'access', icon: Lock, label: 'Security', step: '04' },
                                    { id: 'documents', icon: Shield, label: 'Documents', step: '05' },
                                    { id: 'other', icon: CreditCard, label: 'Emergency', step: '06' },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="px-4 py-2 rounded-md data-[state=active]:bg-primary-600 data-[state=active]:text-white text-sm font-semibold"
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4" />
                                            <span className="uppercase tracking-wide text-[11px]">{tab.label}</span>
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div>
                                <Card className="bg-white dark:bg-slate-800 border rounded-lg">
                                    <CardContent className="p-6">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                                {/* Personal Tab */}
                                                <TabsContent value="personal" className="space-y-10 mt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <FormField label="First Name" error={errors.first_name} required icon={User}>
                                                            <Input {...register('first_name')} aria-label="First name" placeholder="First Name" className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium" />
                                                        </FormField>
                                                        <FormField label="Middle Name" error={errors.middle_name} icon={User}>
                                                            <Input {...register('middle_name')} placeholder="Middle Name" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Last Name" error={errors.last_name} required icon={User}>
                                                            <Input {...register('last_name')} aria-label="Last name" placeholder="Last Name" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="Email Address" error={errors.email} required icon={Mail}>
                                                            <Input type="email" {...register('email')} aria-label="Email address" placeholder="email@domain.com" className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium" />
                                                        </FormField>
                                                        <FormField label="Phone Number" error={errors.phone} required icon={Phone}>
                                                            <Input {...register('phone')} aria-label="Phone number" placeholder="+256..." className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium" />
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                        <FormField label="Date of Birth" error={errors.date_of_birth} required icon={Calendar}>
                                                            <Input type="date" {...register('date_of_birth')} className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium" />
                                                        </FormField>
                                                        <FormField label="Gender" error={errors.gender} required icon={User}>
                                                            <select className="ui-select w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary-500" {...register('gender')}>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </FormField>
                                                        <FormField label="Marital Status" error={errors.marital_status} icon={Star}>
                                                            <select className="ui-select w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary-500" {...register('marital_status')}>
                                                                <option value="single">Single</option>
                                                                <option value="married">Married</option>
                                                                <option value="divorced">Divorced</option>
                                                                <option value="widowed">Widowed</option>
                                                            </select>
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="Address" error={errors.address} icon={MapPin}>
                                                            <Input {...register('address')} placeholder="Physical Address" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField label="City" error={errors.city} icon={MapPin}>
                                                                <Input {...register('city')} placeholder="Kampala" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                            <FormField label="District" error={errors.district} icon={MapPin}>
                                                                <Input {...register('district')} placeholder="Central" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                {/* Employment Tab */}
                                                <TabsContent value="employment" className="space-y-10 mt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="Department" error={errors.department} required icon={Building2}>
                                                            <select aria-label="Department" className="ui-select w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary-500" {...register('department')}>
                                                                <option value="">Select Department</option>
                                                                {departments.map(dept => (
                                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                                ))}
                                                            </select>
                                                        </FormField>
                                                        <FormField label="Job Title" error={errors.job_title} required icon={Briefcase}>
                                                            <Input {...register('job_title')} aria-label="Job title" placeholder="e.g. Lead Architect" className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium" />
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="Reporting Manager" error={errors.manager} icon={User}>
                                                            <select className="ui-select w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold focus:ring-2 focus:ring-primary-500" {...register('manager')}>
                                                                <option value="">Select Manager</option>
                                                                {employees.map(emp => (
                                                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                                                ))}
                                                            </select>
                                                        </FormField>
                                                        <FormField label="Employment Type" error={errors.employment_type} required icon={Briefcase}>
                                                            <select className="ui-select w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold focus:ring-2 focus:ring-primary-500" {...register('employment_type')}>
                                                                <option value="full_time">Full-Time</option>
                                                                <option value="part_time">Part-Time</option>
                                                                <option value="contract">Contractor</option>
                                                                <option value="intern">Internship</option>
                                                                <option value="casual">Casual Basis</option>
                                                            </select>
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                        <FormField label="Joined Date" error={errors.join_date} required icon={Calendar}>
                                                            <Input type="date" {...register('join_date')} className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Probation End Date" error={errors.probation_end_date} icon={Calendar}>
                                                            <Input type="date" {...register('probation_end_date')} className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Status" error={errors.employment_status} required icon={CheckCircle}>
                                                            <select className="ui-select w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold focus:ring-2 focus:ring-primary-500" {...register('employment_status')}>
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
                                                <TabsContent value="compensation" className="space-y-10 mt-0">
                                                    <div className="bg-slate-950 text-white p-10 rounded-[3rem] mb-10 relative overflow-hidden shadow-2xl border border-white/5 group">
                                                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary-600/20 transition-colors duration-1000"></div>
                                                        <div className="relative z-10 flex items-center gap-8">
                                                            <div className="p-5 bg-slate-50 rounded-[1rem] border border-slate-200 shadow-inner transition-colors duration-500">
                                                                <Wallet className="h-10 w-10 text-primary-400 group-hover:text-white" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-2xl font-black tracking-tighter">Salary Information</h4>
                                                                <p className="text-slate-500 text-sm mt-1 max-w-lg font-medium leading-relaxed">
                                                                    Configure the employee's compensation details. Our system will handle calculations and compliance rules automatically.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                                        <div className="md:col-span-2 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-primary-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Monthly Components</span>
                                                        </div>

                                                        <FormField label="Basic Salary" error={errors.basic_salary} required icon={Wallet}>
                                                            <div className="relative group/input">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                                    <span className="text-[10px] font-black">UGX</span>
                                                                    <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                                </div>
                                                                <Input type="number" {...register('basic_salary')} placeholder="0.00" className="pl-20 h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono font-black text-xl" />
                                                            </div>
                                                        </FormField>

                                                        <FormField label="Housing Allowance" error={errors.housing_allowance} icon={Home}>
                                                            <div className="relative group/input">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                                    <span className="text-[10px] font-black">UGX</span>
                                                                    <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                                </div>
                                                                <Input type="number" {...register('housing_allowance')} placeholder="0.00" className="pl-20 h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-all font-mono font-bold" />
                                                            </div>
                                                        </FormField>

                                                        <div className="md:col-span-2 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Allowances</span>
                                                        </div>

                                                        <FormField label="Transport Allowance" error={errors.transport_allowance} icon={MapPin}>
                                                            <div className="relative group/input">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                                    <span className="text-[10px] font-black">UGX</span>
                                                                    <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                                </div>
                                                                <Input type="number" {...register('transport_allowance')} placeholder="0" className="pl-20 h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-all font-mono font-bold" />
                                                            </div>
                                                        </FormField>

                                                        <FormField label="Medical Allowance" error={errors.medical_allowance} icon={Shield}>
                                                            <div className="relative group/input">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                                    <span className="text-[10px] font-black">UGX</span>
                                                                    <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                                </div>
                                                                <Input type="number" {...register('medical_allowance')} placeholder="0" className="pl-20 h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-all font-mono font-bold" />
                                                            </div>
                                                        </FormField>

                                                        <FormField label="Lunch Allowance" error={errors.lunch_allowance} icon={Info}>
                                                            <div className="relative group/input">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                                    <span className="text-[10px] font-black">UGX</span>
                                                                    <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                                </div>
                                                                <Input type="number" {...register('lunch_allowance')} placeholder="0" className="pl-20 h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-all font-mono font-bold" />
                                                            </div>
                                                        </FormField>

                                                        <FormField label="Other Allowances" error={errors.other_allowances} icon={Plus}>
                                                            <div className="relative group/input">
                                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                                    <span className="text-[10px] font-black">UGX</span>
                                                                    <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700"></div>
                                                                </div>
                                                                <Input type="number" {...register('other_allowances')} placeholder="0" className="pl-20 h-16 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-all font-mono font-bold" />
                                                            </div>
                                                        </FormField>
                                                    </div>
                                                </TabsContent>

                                                {/* ACCESS TAB */}
                                                <TabsContent value="access" className="space-y-10 mt-0">
                                                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-10 rounded-[3rem] mb-10 group transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                                                        <div className="flex items-start gap-8">
                                                            <div className="p-5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-[2rem] shadow-sm transform transition-transform group-hover:rotate-12">
                                                                <Lock className="h-10 w-10" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-2xl font-black text-emerald-950 dark:text-emerald-400 tracking-tight">Account Credentials</h4>
                                                                <p className="text-emerald-800/70 dark:text-emerald-500/70 text-sm mt-1 leading-relaxed font-medium max-w-lg">
                                                                    Create system credentials to allow the employee to log in to the portal. Roles define what actions and data the employee can access.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        onClick={() => setValue('create_user', !createUser)}
                                                        className={`flex items-center justify-between p-8 border-2 rounded-[2.5rem] cursor-pointer transition-all duration-500 ${createUser
                                                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)]'
                                                            : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-emerald-500/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className={`p-4 rounded-2xl transition-colors ${createUser ? 'bg-slate-50' : 'bg-slate-100'}`}>
                                                                <User className={`h-8 w-8 ${createUser ? 'text-white' : 'text-slate-400'}`} />
                                                            </div>
                                                            <div>
                                                                <span className={`block text-lg font-black tracking-tight ${createUser ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Enable System Access</span>
                                                                <span className={`text-xs font-bold uppercase tracking-widest ${createUser ? 'text-white/70' : 'text-slate-400'}`}>Requires username & role assignment</span>
                                                            </div>
                                                        </div>
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${createUser ? 'bg-white border-white scale-110' : 'border-slate-200 dark:border-slate-800'}`}>
                                                            {createUser && <CheckCircle className="h-6 w-6 text-emerald-500" />}
                                                        </div>
                                                        <input type="checkbox" className="hidden" {...register('create_user')} />
                                                    </div>

                                                    {createUser && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="space-y-10 pt-6 px-4"
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                                <FormField label="Unique Username" error={errors.username} required icon={User}>
                                                                    <Input {...register('username')} placeholder="e.g. system.identity" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                                </FormField>

                                                                <div className="space-y-6">
                                                                    <div
                                                                        onClick={() => setValue('auto_password', !autoPassword)}
                                                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${autoPassword
                                                                            ? 'bg-slate-950 border-slate-950 text-white shadow-xl'
                                                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                                                                            }`}
                                                                    >
                                                                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${autoPassword ? 'bg-primary-500 border-primary-500' : 'border-slate-300'}`}>
                                                                            {autoPassword && <CheckCircle className="h-4 w-4 text-white" />}
                                                                        </div>
                                                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Auto-generate Password</span>
                                                                        <input type="checkbox" className="hidden" {...register('auto_password')} />
                                                                    </div>

                                                                    <FormField label="Password" error={errors.password} required={!autoPassword} icon={Lock}>
                                                                        <Input
                                                                            type="password"
                                                                            {...register('password')}
                                                                            placeholder={autoPassword ? "AUTO-GENERATED" : "••••••••"}
                                                                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-mono disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
                                                                            disabled={autoPassword}
                                                                        />
                                                                    </FormField>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Role</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                    {[
                                                                        { id: 'employee', label: 'Basic', desc: 'Standard employee portal access' },
                                                                        { id: 'manager', label: 'Manager', desc: 'Manage team and approvals' },
                                                                        { id: 'hr_manager', label: 'Administrator', desc: 'Full system access' }
                                                                    ].map((role) => (
                                                                        <div
                                                                            key={role.id}
                                                                            onClick={() => setValue('role', role.id)}
                                                                            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${watch('role') === role.id
                                                                                ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-500 shadow-lg'
                                                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                                                                }`}
                                                                        >
                                                                            <span className={`block font-black uppercase tracking-widest text-[10px] mb-2 ${watch('role') === role.id ? 'text-primary-600' : 'text-slate-400'}`}>{role.label}</span>
                                                                            <span className="block font-black text-lg tracking-tighter text-slate-900 dark:text-white capitalize">{role.id.replace('_', ' ')}</span>
                                                                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{role.desc}</p>
                                                                        </div>
                                                                    ))}
                                                                    <input type="hidden" {...register('role')} />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </TabsContent>

                                                {/* Documents Tab */}
                                                <TabsContent value="documents" className="space-y-10 mt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="National ID" error={errors.national_id} required icon={Shield}>
                                                            <Input {...register('national_id')} aria-label="National ID" placeholder="CM..." className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium uppercase" />
                                                        </FormField>
                                                        <FormField label="Passport Number" error={errors.passport_number} icon={Shield}>
                                                            <Input {...register('passport_number')} placeholder="A..." className="h-10 rounded-md border-slate-200 dark:border-slate-800 font-medium uppercase" />
                                                        </FormField>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="Tax Identification Number (TIN)" error={errors.tin_number} icon={FileText}>
                                                            <Input {...register('tin_number')} placeholder="100..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="NSSF Number" error={errors.nssf_number} icon={FileText}>
                                                            <Input {...register('nssf_number')} placeholder="NS..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                    </div>
                                                </TabsContent>

                                                {/* Protocols Tab */}
                                                <TabsContent value="other" className="space-y-12 mt-0">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-8 border-b border-primary-500/10 pb-4">Bank Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                            <FormField label="Bank Name" error={errors.bank_name} icon={CreditCard}>
                                                                <Input {...register('bank_name')} placeholder="e.g. Stanbic Bank" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                            <FormField label="Account Number" error={errors.bank_account_number} icon={CreditCard}>
                                                                <Input {...register('bank_account_number')} placeholder="0123..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-mono font-bold" />
                                                            </FormField>
                                                            <FormField label="Branch Name" error={errors.bank_branch} icon={MapPin}>
                                                                <Input {...register('bank_branch')} placeholder="e.g. Forest Mall" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-8 border-b border-indigo-500/10 pb-4">Emergency Contact</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                            <FormField label="Contact Name" error={errors.emergency_contact_name} icon={User}>
                                                                <Input {...register('emergency_contact_name')} placeholder="Next of Kin" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                            <FormField label="Contact Phone" error={errors.emergency_contact_phone} icon={Phone}>
                                                                <Input {...register('emergency_contact_phone')} placeholder="+256..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                            <FormField label="Relationship" error={errors.emergency_contact_relationship} icon={User}>
                                                                <Input {...register('emergency_contact_relationship')} placeholder="Spouse, Parent" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                            </FormField>
                                                        </div>
                                                    </div>

                                                    <FormField label="Additional Notes" error={errors.notes} icon={FileText}>
                                                        <textarea
                                                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-5 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] transition-all"
                                                            {...register('notes')}
                                                            placeholder="Internal notes about the employee..."
                                                        />
                                                    </FormField>
                                                </TabsContent>

                                                {/* Final Action Interface */}
                                                <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
                                                    <Button
                                                        variant="ghost"
                                                        type="button"
                                                        onClick={() => navigate('/employees')}
                                                        className="px-4 py-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSubmit(onSubmit)}
                                                        disabled={isCreating || isUpdating}
                                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-md transition-all flex items-center gap-2 border-none"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                        {isCreating || isUpdating ? 'Saving...' : 'Save'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormPage;
