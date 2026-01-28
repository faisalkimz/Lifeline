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
    Lock, Key, ChevronLeft, Home, Heart, AlertCircle,
    UserCircle, Globe, Camera, BadgeCheck, Clock, Users, Info,
    ShieldCheck, ClipboardList, Fingerprint
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
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config/api';

// Validation Schema
const employeeSchema = z.object({
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
    department: z.string().min(1, "Department is required"),
    job_title: z.string().min(1, "Job title is required"),
    manager: z.string().optional().nullable(),
    employment_type: z.enum(["full_time", "part_time", "contract", "intern", "casual"]),
    employment_status: z.enum(["active", "on_leave", "suspended", "terminated", "resigned"]),
    join_date: z.string().min(1, "Join date is required"),
    probation_end_date: z.string().optional().nullable(),
    national_id: z.string().min(1, "National ID is required"),
    passport_number: z.string().optional(),
    tin_number: z.string().optional(),
    nssf_number: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_branch: z.string().optional(),
    mobile_money_number: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
    notes: z.string().optional(),
    basic_salary: z.coerce.number().min(0).optional().or(z.literal('')),
    housing_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    transport_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    medical_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    lunch_allowance: z.coerce.number().min(0).optional().or(z.literal('')),
    other_allowances: z.coerce.number().min(0).optional().or(z.literal('')),
    create_user: z.boolean().optional(),
    auto_password: z.boolean().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    role: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.create_user) {
        if (!data.username) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username required", path: ["username"] });
        }
        if (!data.auto_password && !data.password) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password required", path: ["password"] });
        }
        if (!data.role) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Role required", path: ["role"] });
        }
    }
});

const steps = [
    { id: 'identity', label: 'Identity', icon: UserCircle, description: 'Personal information' },
    { id: 'employment', label: 'Employment', icon: Briefcase, description: 'Work details' },
    { id: 'salary', label: 'Salary', icon: Wallet, description: 'Compensation' },
    { id: 'security', label: 'Security', icon: Shield, description: 'System access' },
    { id: 'tax_ids', label: 'Tax & ID', icon: FileText, description: 'TIN, NSSF & ID' },
    { id: 'emergency', label: 'Emergency', icon: Heart, description: 'Contacts & bank' },
];

const InputField = ({ label, error, required, hint, className, children }) => (
    <div className={`space-y-1.5 ${className || ''}`}>
        <div className="flex items-baseline justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700 tracking-tight">
                {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {hint && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{hint}</span>}
        </div>
        <div className="group relative">
            {children}
        </div>
        <AnimatePresence mode="wait">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1.5 mt-1.5 text-rose-500"
                >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <p className="text-[11px] font-bold tracking-tight">{error.message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const EmployeeFormPage = () => {
    const { id: routeId } = useParams();
    const id = routeId ? String(routeId).replace(/^:/, '') : routeId;
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const { data: departmentsData } = useGetDepartmentsQuery();
    const { data: employeesData } = useGetEmployeesQuery({ employment_status: 'active' });
    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(id, { skip: !isEditMode });

    const departments = Array.isArray(departmentsData?.results) ? departmentsData.results : (Array.isArray(departmentsData) ? departmentsData : []);
    const employees = Array.isArray(employeesData?.results) ? employeesData.results : (Array.isArray(employeesData) ? employeesData : []);

    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [deleteEmployee] = useDeleteEmployeeMutation();
    const [createSalaryStructure] = useCreateSalaryStructureMutation();
    const [updateSalaryStructure] = useUpdateSalaryStructureMutation();

    const { data: currentUser } = useGetCurrentUserQuery();
    const canManageSalaries = ['hr_manager', 'company_admin', 'super_admin'].includes(currentUser?.role);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError } = useForm({
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
    const createUser = watch('create_user');
    const autoPassword = watch('auto_password');

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
            if (employeeData.user_details) {
                formData.create_user = true;
                formData.username = employeeData.user_details.username;
                formData.role = employeeData.user_details.role;
                formData.auto_password = true; // Default to auto-password on edit unless changed
            }
            reset(formData);
            if (employeeData.photo) setPreviewImage(employeeData.photo);
        }
    }, [employeeData, reset]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            // Explicitly handle fields
            Object.keys(data).forEach(key => {
                const value = data[key];

                // Skip null, undefined, and empty string (except specifically handled fields)
                if (value === null || value === undefined || value === '') {
                    // For specific fields that can be cleared, we might want to send null
                    // But FormData stringifies null to "null". 
                    // DRF handles empty string as null for some fields if configured, 
                    // but generally it's safer to just omit if we don't want to change it, 
                    // OR if we strictly want to clear it, we need logic.
                    // For now, omission is safer for PATCH.
                    return;
                }

                if (key === 'photo') return; // Handle photo separately

                if (typeof value === 'boolean') {
                    formData.append(key, value ? 'true' : 'false');
                } else {
                    formData.append(key, value);
                }
            });

            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            if (isEditMode) {
                // Ensure ID is present
                if (!id) throw new Error("Employee ID is missing");

                await updateEmployee({ id, formData }).unwrap();

                // Handle salary structure update/creation during edit
                if (data.basic_salary > 0 && canManageSalaries) {
                    const salaryData = {
                        basic_salary: data.basic_salary || 0,
                        housing_allowance: data.housing_allowance || 0,
                        transport_allowance: data.transport_allowance || 0,
                        medical_allowance: data.medical_allowance || 0,
                        lunch_allowance: data.lunch_allowance || 0,
                        other_allowances: data.other_allowances || 0,
                        effective_date: new Date().toISOString().split('T')[0]
                    };

                    if (employeeData?.salary_structure?.id) {
                        await updateSalaryStructure({
                            id: employeeData.salary_structure.id,
                            ...salaryData,
                            employee: id
                        }).unwrap();
                    } else {
                        await createSalaryStructure({
                            employee: id,
                            ...salaryData
                        }).unwrap();
                    }
                }

                toast.success("Employee updated successfully! 🎉");
            } else {
                const res = await createEmployee(formData).unwrap();
                // Handle salary structure creation
                if (data.basic_salary > 0 && canManageSalaries) {
                    const salaryData = {
                        basic_salary: data.basic_salary || 0,
                        housing_allowance: data.housing_allowance || 0,
                        transport_allowance: data.transport_allowance || 0,
                        medical_allowance: data.medical_allowance || 0,
                        lunch_allowance: data.lunch_allowance || 0,
                        other_allowances: data.other_allowances || 0,
                        effective_date: new Date().toISOString().split('T')[0]
                    };
                    await createSalaryStructure({ employee: res.id, ...salaryData }).unwrap();
                }
                toast.success("Welcome aboard! Employee created 🚀");
            }

            // Navigate back
            navigate('/employees');
        } catch (error) {
            console.error("Form Submission Error:", error);
            const msg = error?.data?.detail ||
                error?.data?.non_field_errors?.[0] ||
                Object.entries(error?.data || {}).map(([k, v]) => `${k}: ${v}`).join(', ') ||
                "Something went wrong";
            toast.error(msg);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    if (isEditMode && isLoadingEmployee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    const inputClass = "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium shadow-sm hover:border-gray-300";
    const selectClass = "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300";

    return (
        <div className="min-h-screen bg-[#FDFDFF]">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Premium Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all mb-8 group"
                    >
                        <div className="p-1 rounded-lg bg-white border border-gray-100 shadow-sm group-hover:shadow-md group-hover:-translate-x-0.5 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Directory</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        {/* Profile Image - More Engaging */}
                        <div className="relative group self-start">
                            <div className="h-28 w-28 rounded-3xl bg-white p-1 shadow-premium-lg ring-1 ring-gray-100 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 z-0" />
                                <div className="h-full w-full rounded-[20px] bg-gray-50 flex items-center justify-center overflow-hidden z-10 relative border border-gray-100">
                                    {previewImage ? (
                                        <img
                                            src={previewImage.startsWith('data:') ? previewImage : getMediaUrl(previewImage)}
                                            alt="Preview"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-primary-400 transition-colors">
                                            <Camera className="h-8 w-8" />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">Upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <label className="absolute -bottom-2 -right-2 h-10 w-10 flex items-center justify-center bg-white rounded-2xl shadow-premium-md border border-gray-100 cursor-pointer hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all">
                                <Plus className="h-5 w-5 text-primary-600" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest mb-3 border border-primary-100 shadow-sm shadow-primary-500/5">
                                <Sparkles className="h-3 w-3" />
                                Workforce Management
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                                {isEditMode ? 'Employee Profile' : 'New Team Member'}
                            </h1>
                            <p className="text-gray-500 font-medium max-w-lg leading-relaxed">
                                {isEditMode
                                    ? `Update the details for ${employeeData?.full_name || 'this member'}. Changes will be applied immediately.`
                                    : "Complete the steps below to onboard your new colleague and set up their personal directory entry."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Premium Step Progress */}
                <div className="mb-12 relative px-4">
                    <div className="flex items-center justify-between relative z-10">
                        {/* Elegant Progress Line Background */}
                        <div className="absolute top-6 left-0 right-0 h-[2px] bg-gray-100 -z-10 mx-6 rounded-full" />

                        {/* Active Progress Line with Gradient */}
                        <motion.div
                            className="absolute top-6 left-0 h-[2px] bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 -z-10 mx-6 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        />

                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(index)}
                                className="flex flex-col items-center group touch-none outline-none"
                            >
                                <div className={`
                                    relative h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2
                                    ${index === currentStep
                                        ? 'bg-white border-primary-500 text-primary-600 shadow-premium-lg scale-110'
                                        : index < currentStep
                                            ? 'bg-primary-500 border-primary-500 text-white shadow-premium-sm'
                                            : 'bg-white border-gray-100 text-gray-300 group-hover:border-gray-300'
                                    }
                                `}>
                                    {index < currentStep ? (
                                        <BadgeCheck className="h-6 w-6" />
                                    ) : (
                                        <step.icon className={`h-5 w-5 ${index === currentStep ? 'animate-pulse' : ''}`} />
                                    )}

                                    {/* Subtle active pulse effect */}
                                    {index === currentStep && (
                                        <span className="absolute inset-0 rounded-2xl ring-4 ring-primary-500/10 animate-pulse" />
                                    )}
                                </div>
                                <div className="mt-3 flex flex-col items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${index === currentStep ? 'text-primary-600' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Card with Glassmorphism */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Card className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-premium-xl border border-white/60 overflow-hidden relative">
                        {/* Top Accent Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 opacity-80" />

                        <CardContent className="p-0">
                            {/* Premium Step Header */}
                            <div className="px-10 py-10 border-b border-gray-100/50 bg-gradient-to-b from-gray-50/50 to-transparent">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-white shadow-premium-md border border-gray-100 flex items-center justify-center text-primary-600">
                                        {React.createElement(steps[currentStep].icon, { className: "h-8 w-8" })}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] mb-1">
                                            Step 0{currentStep + 1} of 0{steps.length}
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{steps[currentStep].label}</h2>
                                        <p className="text-gray-500 font-medium text-sm mt-0.5">{steps[currentStep].description}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-10">
                                {/* IDENTITY STEP */}
                                {currentStep === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        {/* Engaging Greeting */}
                                        <div className="bg-gradient-to-br from-primary-50 to-indigo-50/30 rounded-3xl p-8 flex items-start gap-6 border border-primary-100/50 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                                <UserCircle className="h-24 w-24" />
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0 relative z-10 border border-white">
                                                <Sparkles className="h-7 w-7 text-primary-500 animate-pulse" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-gray-900 mb-1.5 text-xl tracking-tight">Personal Presence</h3>
                                                <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                                                    Every great journey starts with a name. Let's capture the essential details to welcome your new team member home.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Name Section - Handcrafted Grid */}
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-primary-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Legal Name</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <InputField label="First Name" error={errors.first_name} required hint="Required">
                                                    <input
                                                        {...register('first_name')}
                                                        placeholder="Sarah"
                                                        className={inputClass}
                                                    />
                                                </InputField>
                                                <InputField label="Middle Name" error={errors.middle_name} hint="Optional">
                                                    <input
                                                        {...register('middle_name')}
                                                        placeholder="Jane"
                                                        className={inputClass}
                                                    />
                                                </InputField>
                                                <InputField label="Last Name" error={errors.last_name} required hint="Required">
                                                    <input
                                                        {...register('last_name')}
                                                        placeholder="Johnson"
                                                        className={inputClass}
                                                    />
                                                </InputField>
                                            </div>
                                        </section>

                                        {/* Contact Section */}
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-indigo-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Communication Bridge</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <InputField label="Email Address" error={errors.email} required hint="Business Email">
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                                        <input
                                                            {...register('email')}
                                                            type="email"
                                                            placeholder="sarah.j@company.com"
                                                            className={`${inputClass} pl-12`}
                                                        />
                                                    </div>
                                                </InputField>
                                                <InputField label="Phone Number" error={errors.phone} required hint="Direct Line">
                                                    <div className="relative group">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                                        <input
                                                            {...register('phone')}
                                                            placeholder="+256 700 000 000"
                                                            className={`${inputClass} pl-12`}
                                                        />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </section>

                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                                        {/* Details Grid */}
                                        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <InputField label="Birthday" error={errors.date_of_birth} required hint="Month/Day/Year">
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                                                    <input
                                                        {...register('date_of_birth')}
                                                        type="date"
                                                        className={`${inputClass} pl-12`}
                                                    />
                                                </div>
                                            </InputField>
                                            <InputField label="Gender" error={errors.gender} required hint="Legal Identity">
                                                <select {...register('gender')} className={selectClass}>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </InputField>
                                            <InputField label="Marital Status" error={errors.marital_status} hint="Payroll Detail">
                                                <select {...register('marital_status')} className={selectClass}>
                                                    <option value="single">Single</option>
                                                    <option value="married">Married</option>
                                                    <option value="divorced">Divorced</option>
                                                    <option value="widowed">Widowed</option>
                                                </select>
                                            </InputField>
                                        </section>

                                        {/* Location */}
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-blue-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Base Location</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="md:col-span-2">
                                                    <InputField label="Residential Address" error={errors.address} hint="Home Base">
                                                        <div className="relative group">
                                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                                            <input
                                                                {...register('address')}
                                                                placeholder="e.g. 123 Skyview Drive"
                                                                className={`${inputClass} pl-12`}
                                                            />
                                                        </div>
                                                    </InputField>
                                                </div>
                                                <InputField label="City" error={errors.city} hint="Hub">
                                                    <input
                                                        {...register('city')}
                                                        placeholder="Kampala"
                                                        className={inputClass}
                                                    />
                                                </InputField>
                                            </div>
                                        </section>

                                        {/* Security Trust Notice */}
                                        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 flex items-start gap-4 shadow-inner">
                                            <div className="h-10 w-10 rounded-full bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0">
                                                <Shield className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 mb-0.5 tracking-tight">Secure Intelligence</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                    All personal data is encrypted using military-grade standards. Access is strictly limited to authorized people.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* EMPLOYMENT STEP */}
                                {currentStep === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-8 flex items-start gap-6 border border-blue-100/50 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                                <Briefcase className="h-24 w-24" />
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0 relative z-10 border border-white">
                                                <Briefcase className="h-7 w-7 text-blue-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-gray-900 mb-1.5 text-xl tracking-tight">Professional Standing</h3>
                                                <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                                                    Define their impact within the organization. Setting this up correctly ensures smooth workflows and clear hierarchies.
                                                </p>
                                            </div>
                                        </div>

                                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <InputField label="Official Job Title" error={errors.job_title} required hint="Company Role">
                                                <div className="relative group">
                                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                                    <input
                                                        {...register('job_title')}
                                                        placeholder="Product Designer"
                                                        className={`${inputClass} pl-12 text-gray-900`}
                                                    />
                                                </div>
                                            </InputField>
                                            <InputField label="Departmental Home" error={errors.department} required hint="Business Unit">
                                                <div className="relative group">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10 pointer-events-none" />
                                                    <select {...register('department')} className={`${selectClass} pl-12`}>
                                                        <option value="">Select Department</option>
                                                        {departments.map(dept => (
                                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </InputField>
                                        </section>

                                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <InputField label="Leadership Connection" error={errors.manager} hint="Reports To">
                                                <div className="relative group">
                                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10 pointer-events-none" />
                                                    <select {...register('manager')} className={`${selectClass} pl-12`}>
                                                        <option value="">Direct to Board / Leadership</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </InputField>
                                            <InputField label="Employment Model" error={errors.employment_type} required hint="Engagement Basis">
                                                <select {...register('employment_type')} className={selectClass}>
                                                    <option value="full_time">Full-Time (Indefinite)</option>
                                                    <option value="part_time">Part-Time (Scheduled)</option>
                                                    <option value="contract">Contract (Project-Based)</option>
                                                    <option value="intern">Internship (Seasonal)</option>
                                                    <option value="casual">Casual (On-Demand)</option>
                                                </select>
                                            </InputField>
                                        </section>

                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-violet-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Chronology</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <InputField label="Onboarding Date" error={errors.join_date} required hint="First Day">
                                                    <div className="relative group">
                                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                                                        <input {...register('join_date')} type="date" className={`${inputClass} pl-12`} />
                                                    </div>
                                                </InputField>
                                                <InputField label="Probation Review" error={errors.probation_end_date} hint="Expiry">
                                                    <input {...register('probation_end_date')} type="date" className={inputClass} />
                                                </InputField>
                                                <InputField label="Operating Status" error={errors.employment_status} required hint="Current State">
                                                    <select {...register('employment_status')} className={selectClass}>
                                                        <option value="active">Active Presence</option>
                                                        <option value="on_leave">Extended Leave</option>
                                                        <option value="suspended">Administrative Hold</option>
                                                        <option value="terminated">Offboarded</option>
                                                        <option value="resigned">Resigned</option>
                                                    </select>
                                                </InputField>
                                            </div>
                                        </section>

                                        <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-6 flex items-start gap-4 shadow-inner">
                                            <div className="h-10 w-10 rounded-full bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0">
                                                <Info className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 mb-0.5 tracking-tight">Organization Map</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                    Setting the correct manager establishes the approval flow for leave requests and performance reviews.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SALARY STEP */}
                                {currentStep === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 rounded-3xl p-8 flex items-start gap-6 border border-emerald-100/50 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:-translate-x-2 transition-transform duration-700">
                                                <Wallet className="h-24 w-24" />
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0 relative z-10 border border-white">
                                                <CreditCard className="h-7 w-7 text-emerald-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-gray-900 mb-1.5 text-xl tracking-tight">Compensation Strategy</h3>
                                                <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                                                    Reward their contribution. Transparent and accurate payroll setup starts here with the base agreement.
                                                </p>
                                            </div>
                                        </div>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-emerald-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Base Compensation</h3>
                                            </div>
                                            <div className="bg-gray-50/50 rounded-3xl p-10 border border-gray-100 shadow-inner">
                                                <InputField
                                                    label="Gross Monthly Salary"
                                                    error={errors.basic_salary}
                                                    required
                                                    hint="Before Deductions"
                                                    className="max-w-xl mx-auto text-center"
                                                >
                                                    <div className="relative flex items-center group">
                                                        <div className="absolute left-6 text-xl font-black text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                                                            UGX
                                                        </div>
                                                        <input
                                                            {...register('basic_salary')}
                                                            type="number"
                                                            placeholder="0"
                                                            className="w-full h-20 pl-24 pr-8 rounded-[24px] border-2 border-gray-100 bg-white text-3xl font-black text-gray-900 placeholder:text-gray-200 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all text-right"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                                                        Standard monthly cycle payment amount
                                                    </p>
                                                </InputField>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-primary-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Benefit Supplements</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {[
                                                    { name: 'housing_allowance', label: 'Housing Allowance' },
                                                    { name: 'transport_allowance', label: 'Transport Stipend' },
                                                    { name: 'medical_allowance', label: 'Medical Benefit' },
                                                    { name: 'lunch_allowance', label: 'Meal Allowance' },
                                                    { name: 'other_allowances', label: 'Other Supplements' },
                                                ].map((allowance) => (
                                                    <InputField
                                                        key={allowance.name}
                                                        label={allowance.label}
                                                        error={errors[allowance.name]}
                                                        hint="Monthly"
                                                    >
                                                        <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 group-focus-within:text-primary-500 transition-colors">UGX</div>
                                                            <input
                                                                {...register(allowance.name)}
                                                                type="number"
                                                                placeholder="0"
                                                                className={`${inputClass} pl-14 font-black`}
                                                            />
                                                        </div>
                                                    </InputField>
                                                ))}
                                            </div>
                                        </section>
                                    </motion.div>
                                )}

                                {/* SECURITY STEP */}
                                {currentStep === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50/30 rounded-3xl p-8 flex items-start gap-6 border border-indigo-100/50 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                                <ShieldCheck className="h-24 w-24" />
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0 relative z-10 border border-white">
                                                <Lock className="h-7 w-7 text-indigo-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-gray-900 mb-1.5 text-xl tracking-tight">Access Control</h3>
                                                <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                                                    Determine their reach within the platform. Grant appropriate permissions based on their role and responsibility level.
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setValue('create_user', !createUser)}
                                            className={`group p-8 rounded-[28px] border-2 cursor-pointer transition-all duration-500 relative overflow-hidden ${createUser
                                                ? 'bg-white border-primary-500 shadow-premium-lg ring-4 ring-primary-500/5'
                                                : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-premium-md'
                                                }`}
                                        >
                                            {createUser && (
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500" />
                                            )}

                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${createUser
                                                        ? 'bg-primary-500 text-white shadow-premium-sm'
                                                        : 'bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-400'
                                                        }`}>
                                                        <Key className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-black text-xl tracking-tight ${createUser ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            Digital Twin Presence
                                                        </h3>
                                                        <p className="text-sm font-medium text-gray-500">
                                                            Activate credentials for their personal portal access.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={`
                                                    h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2
                                                    ${createUser ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-100 text-transparent'}
                                                `}>
                                                    <CheckCircle className="h-6 w-6" />
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {createUser && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                                    transition={{ duration: 0.5, ease: "circOut" }}
                                                    className="space-y-10 pt-2 origin-top"
                                                >
                                                    <section>
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="h-6 w-1 rounded-full bg-primary-500" />
                                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Entry Credentials</h3>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 shadow-inner">
                                                            <InputField label="Login Identity" error={errors.username} required hint="Username">
                                                                <input
                                                                    {...register('username')}
                                                                    placeholder="j.doe"
                                                                    className={inputClass}
                                                                />
                                                            </InputField>
                                                            <div className="space-y-4">
                                                                <div
                                                                    onClick={() => setValue('auto_password', !autoPassword)}
                                                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${autoPassword
                                                                        ? 'bg-primary-100/50 border-primary-500 text-primary-700'
                                                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                                                        }`}
                                                                >
                                                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${autoPassword
                                                                        ? 'bg-primary-500 border-primary-500'
                                                                        : 'bg-white border-gray-100'
                                                                        }`}>
                                                                        {autoPassword && <CheckCircle className="h-4 w-4 text-white" />}
                                                                    </div>
                                                                    <span className="text-sm font-black tracking-tight uppercase">Generate Secure Key</span>
                                                                </div>
                                                                {!autoPassword && (
                                                                    <InputField label="Manual Passkey" error={errors.password} required hint="Custom">
                                                                        <input
                                                                            {...register('password')}
                                                                            type="password"
                                                                            placeholder="••••••••"
                                                                            className={inputClass}
                                                                        />
                                                                    </InputField>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section>
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="h-6 w-1 rounded-full bg-purple-500" />
                                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Platform Authority</h3>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {[
                                                                { id: 'employee', label: 'Individual', icon: User, desc: 'Personal hub & records access.', color: 'text-gray-600', activeBg: 'bg-gray-900', activeText: 'text-white' },
                                                                { id: 'manager', label: 'Leader', icon: Users, desc: 'Team oversight & approvals.', color: 'text-blue-600', activeBg: 'bg-blue-600', activeText: 'text-white' },
                                                                { id: 'hr_manager', label: 'Architect', icon: Shield, desc: 'Full ecosystem orchestration.', color: 'text-purple-600', activeBg: 'bg-purple-600', activeText: 'text-white' },
                                                            ].map(role => (
                                                                <div
                                                                    key={role.id}
                                                                    onClick={() => setValue('role', role.id)}
                                                                    className={`
                                                                        relative p-6 rounded-[24px] border-2 cursor-pointer transition-all duration-500 text-center flex flex-col items-center gap-4
                                                                        ${watch('role') === role.id
                                                                            ? `${role.activeBg} ${role.activeText} border-transparent shadow-premium-lg scale-[1.02]`
                                                                            : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-premium-sm'
                                                                        }
                                                                    `}
                                                                >
                                                                    <div className={`
                                                                        h-12 w-12 rounded-[18px] flex items-center justify-center transition-all duration-500
                                                                        ${watch('role') === role.id ? 'bg-white/20' : 'bg-gray-50 text-gray-400'}
                                                                    `}>
                                                                        <role.icon className="h-6 w-6" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black tracking-tight text-sm uppercase mb-1">{role.label}</p>
                                                                        <p className={`text-[10px] font-medium leading-tight ${watch('role') === role.id ? 'opacity-80' : 'text-gray-400'}`}>
                                                                            {role.desc}
                                                                        </p>
                                                                    </div>

                                                                    {watch('role') === role.id && (
                                                                        <motion.div
                                                                            layoutId="roleCheck"
                                                                            className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-premium-sm border-2 border-white"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* TAX & ID STEP */}
                                {currentStep === 4 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-3xl p-8 flex items-start gap-6 border border-amber-100/50 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-6 transition-transform duration-700">
                                                <FileText className="h-24 w-24" />
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0 relative z-10 border border-white">
                                                <FileText className="h-7 w-7 text-amber-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-gray-900 mb-1.5 text-xl tracking-tight">Statutory Compliance</h3>
                                                <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                                                    Ensure all legal and tax requirements are met. These identifiers are essential for official records and filings.
                                                </p>
                                            </div>
                                        </div>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-amber-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Legal Identity</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <InputField label="National ID Number (NIN)" error={errors.national_id} required hint="Primary ID">
                                                    <div className="relative group">
                                                        <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                                                        <input
                                                            {...register('national_id')}
                                                            placeholder="CM123456789ABC"
                                                            className={`${inputClass} pl-12 uppercase font-black tracking-widest`}
                                                        />
                                                    </div>
                                                </InputField>
                                                <InputField label="Passport Document" error={errors.passport_number} hint="Travel Identity">
                                                    <div className="relative group">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                                                        <input
                                                            {...register('passport_number')}
                                                            placeholder="A0123456"
                                                            className={`${inputClass} pl-12 uppercase font-black`}
                                                        />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-orange-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tax & Pension</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <InputField label="Tax Identity (TIN)" error={errors.tin_number} hint="URA Registry">
                                                    <div className="relative group">
                                                        <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                                                        <input
                                                            {...register('tin_number')}
                                                            placeholder="1001234567"
                                                            className={`${inputClass} pl-12 font-black`}
                                                        />
                                                    </div>
                                                </InputField>
                                                <InputField label="NSSF Member ID" error={errors.nssf_number} hint="Social Security">
                                                    <div className="relative group">
                                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                                                        <input
                                                            {...register('nssf_number')}
                                                            placeholder="1234567890"
                                                            className={`${inputClass} pl-12 font-black`}
                                                        />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </section>

                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 italic text-gray-400 text-xs font-medium text-center">
                                            All sensitive identifiers are encrypted and stored in compliance with local data protection regulations.
                                        </div>
                                    </motion.div>
                                )}

                                {/* EMERGENCY & FINAL STEP */}
                                {currentStep === 5 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="bg-gradient-to-br from-rose-50 to-pink-50/30 rounded-3xl p-8 flex items-start gap-6 border border-rose-100/50 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                                <Heart className="h-24 w-24" />
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-premium-sm flex items-center justify-center flex-shrink-0 relative z-10 border border-white">
                                                <Heart className="h-7 w-7 text-rose-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-gray-900 mb-1.5 text-xl tracking-tight">Well-being & Settlement</h3>
                                                <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
                                                    The final pieces of the puzzle. Setting up emergency support and ensuring their hard work is rewarded.
                                                </p>
                                            </div>
                                        </div>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-rose-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Emergency Nexus</h3>
                                            </div>
                                            <div className="bg-rose-50/50 border border-rose-100 px-8 py-10 rounded-[40px] shadow-inner">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <InputField label="Primary Contact Name" error={errors.emergency_contact_name} hint="Next of Kin">
                                                        <input
                                                            {...register('emergency_contact_name')}
                                                            placeholder="Jane Doe"
                                                            className={`${inputClass} bg-white/50`}
                                                        />
                                                    </InputField>
                                                    <InputField label="Contact Phone" error={errors.emergency_contact_phone} hint="Mobile/Direct">
                                                        <div className="relative group">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                                                            <input
                                                                {...register('emergency_contact_phone')}
                                                                placeholder="+256 701 000 000"
                                                                className={`${inputClass} pl-12 bg-white/50`}
                                                            />
                                                        </div>
                                                    </InputField>
                                                    <div className="md:col-span-2">
                                                        <InputField label="Kindred Relationship" error={errors.emergency_contact_relationship} hint="Connection">
                                                            <select {...register('emergency_contact_relationship')} className={`${selectClass} bg-white/50`}>
                                                                <option value="">Select Relationship</option>
                                                                <option value="spouse">Spouse / Partner</option>
                                                                <option value="parent">Parental Figure</option>
                                                                <option value="sibling">Sibling</option>
                                                                <option value="child">Child / Dependent</option>
                                                                <option value="friend">Close Friend</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </InputField>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-primary-500" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Financial Gateway</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <InputField label="Banking Institution" error={errors.bank_name} hint="Bank Entity">
                                                    <div className="relative group">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                                                        <input
                                                            {...register('bank_name')}
                                                            placeholder="e.g. Standard Chartered"
                                                            className={`${inputClass} pl-12`}
                                                        />
                                                    </div>
                                                </InputField>
                                                <InputField label="Account Identity" error={errors.bank_account_number} hint="Unique ID">
                                                    <div className="relative group">
                                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                                                        <input
                                                            {...register('bank_account_number')}
                                                            placeholder="0000000000"
                                                            className={`${inputClass} pl-12 font-black tracking-widest`}
                                                        />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1 rounded-full bg-gray-400" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Observation Deck</h3>
                                            </div>
                                            <InputField label="Personnel Insights" error={errors.notes} hint="Internal Notes">
                                                <textarea
                                                    {...register('notes')}
                                                    rows={4}
                                                    placeholder="Add any unique observations or onboarding notes here..."
                                                    className="w-full p-6 rounded-[32px] border-2 border-gray-100 bg-gray-50/50 text-gray-900 placeholder:text-gray-300 focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none transition-all resize-none shadow-inner font-medium text-sm leading-relaxed"
                                                />
                                            </InputField>
                                        </section>
                                    </motion.div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-12 mt-12 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={currentStep === 0 ? () => navigate('/employees') : prevStep}
                                        className="h-14 px-8 flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black tracking-tight uppercase text-xs transition-colors group"
                                    >
                                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                        {currentStep === 0 ? 'Abort Entry' : 'Previous Phase'}
                                    </button>

                                    {currentStep < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="h-14 px-10 bg-gray-900 hover:bg-black text-white font-black tracking-tight uppercase text-xs rounded-2xl shadow-premium-lg hover:shadow-premium-xl transition-all flex items-center gap-3 active:scale-95"
                                        >
                                            Advance to {steps[currentStep + 1].label}
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isCreating || isUpdating}
                                            className="h-14 px-12 bg-primary-600 hover:bg-primary-700 text-white font-black tracking-tight uppercase text-xs rounded-2xl shadow-premium-lg hover:shadow-premium-xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                        >
                                            {isCreating || isUpdating ? (
                                                <>
                                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Syncing Profile...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5" />
                                                    {isEditMode ? 'Commit Changes' : 'Finalize Onboarding'}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default EmployeeFormPage;
