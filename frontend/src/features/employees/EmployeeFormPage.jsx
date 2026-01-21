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
    UserCircle, Globe, Camera, BadgeCheck, Clock, Users, Info
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
    { id: 'documents', label: 'Documents', icon: FileText, description: 'ID & papers' },
    { id: 'emergency', label: 'Emergency', icon: Heart, description: 'Contacts & bank' },
];

const InputField = ({ label, error, required, hint, children }) => (
    <div className="space-y-2">
        <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
                {label} {required && <span className="text-rose-500">*</span>}
            </span>
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
        </label>
        {children}
        {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-3 w-3" /> {error.message}
            </p>
        )}
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
                <p className="text-slate-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    const inputClass = "w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium";
    const selectClass = "w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium appearance-none cursor-pointer";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Friendly Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to team</span>
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Photo Upload */}
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden shadow-lg shadow-primary-200/50">
                                {previewImage ? (
                                    <img src={previewImage.startsWith('data:') ? previewImage : getMediaUrl(previewImage)} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircle className="h-12 w-12 text-primary-400" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <Camera className="h-6 w-6 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {isEditMode ? 'Edit Team Member' : 'Add New Team Member'}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                {isEditMode ? "Update their information below" : "Let's get them set up in just a few steps"}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Step Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
                        <div
                            className="absolute top-6 left-0 h-0.5 bg-primary-500 -z-10 transition-all duration-500"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(index)}
                                className={`flex flex-col items-center gap-2 relative transition-all ${index <= currentStep ? 'opacity-100' : 'opacity-50'
                                    }`}
                            >
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${index === currentStep
                                    ? 'bg-primary-500 text-white shadow-primary-300 scale-110'
                                    : index < currentStep
                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                        : 'bg-white text-slate-400 shadow-slate-200'
                                    }`}>
                                    {index < currentStep ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <step.icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span className={`text-xs font-semibold ${index === currentStep ? 'text-primary-600' : 'text-slate-500'
                                    }`}>
                                    {step.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none overflow-hidden">
                        <CardContent className="p-0">
                            {/* Step Header */}
                            <div className="px-10 py-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center">
                                        {React.createElement(steps[currentStep].icon, { className: "h-7 w-7 text-primary-600" })}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{steps[currentStep].label}</h2>
                                        <p className="text-slate-500 text-sm">{steps[currentStep].description}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
                                {/* IDENTITY STEP */}
                                {currentStep === 0 && (
                                    <div className="space-y-8">
                                        {/* Welcome Message */}
                                        <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-6 flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                                                <UserCircle className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-primary-900 mb-1 text-lg">Let's start with the basics</h3>
                                                <p className="text-sm text-primary-700 leading-relaxed">
                                                    We need some personal information to create their profile. Don't worry - we keep all this information secure and private.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Full Name Section */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                What's their name?
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <InputField label="First name" error={errors.first_name} required>
                                                    <input
                                                        {...register('first_name')}
                                                        placeholder="e.g. Sarah"
                                                        className={inputClass}
                                                        autoComplete="given-name"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">Their given name</p>
                                                </InputField>
                                                <InputField label="Middle name" error={errors.middle_name} hint="Optional">
                                                    <input
                                                        {...register('middle_name')}
                                                        placeholder="e.g. Jane"
                                                        className={inputClass}
                                                        autoComplete="additional-name"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">If they have one</p>
                                                </InputField>
                                                <InputField label="Last name" error={errors.last_name} required>
                                                    <input
                                                        {...register('last_name')}
                                                        placeholder="e.g. Johnson"
                                                        className={inputClass}
                                                        autoComplete="family-name"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">Family name</p>
                                                </InputField>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                How can we reach them?
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="Email address" error={errors.email} required>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                        <input
                                                            {...register('email')}
                                                            type="email"
                                                            placeholder="sarah.johnson@company.com"
                                                            className={`${inputClass} pl-12`}
                                                            autoComplete="email"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1.5">💡 We'll use this for important updates and login</p>
                                                </InputField>
                                                <InputField label="Phone number" error={errors.phone} required>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                        <input
                                                            {...register('phone')}
                                                            placeholder="+256 700 000 000"
                                                            className={`${inputClass} pl-12`}
                                                            autoComplete="tel"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1.5">Include country code for international numbers</p>
                                                </InputField>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-200" />

                                        {/* Personal Details */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                A bit more about them
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <InputField label="Date of birth" error={errors.date_of_birth} required>
                                                    <input
                                                        {...register('date_of_birth')}
                                                        type="date"
                                                        className={inputClass}
                                                        autoComplete="bday"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">For age verification and birthday celebrations 🎂</p>
                                                </InputField>
                                                <InputField label="Gender" error={errors.gender} required>
                                                    <select {...register('gender')} className={selectClass}>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </InputField>
                                                <InputField label="Marital status" error={errors.marital_status} hint="Optional">
                                                    <select {...register('marital_status')} className={selectClass}>
                                                        <option value="single">Single</option>
                                                        <option value="married">Married</option>
                                                        <option value="divorced">Divorced</option>
                                                        <option value="widowed">Widowed</option>
                                                    </select>
                                                    <p className="text-xs text-slate-500 mt-1.5">For benefits and tax purposes</p>
                                                </InputField>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                Where do they live?
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2">
                                                    <InputField label="Street address" error={errors.address} hint="Optional">
                                                        <div className="relative">
                                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                            <input
                                                                {...register('address')}
                                                                placeholder="e.g. 123 Main Street, Apartment 4B"
                                                                className={`${inputClass} pl-12`}
                                                                autoComplete="street-address"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1.5">Full street address including apartment/unit number</p>
                                                    </InputField>
                                                </div>
                                                <InputField label="City" error={errors.city} hint="Optional">
                                                    <input
                                                        {...register('city')}
                                                        placeholder="e.g. Kampala"
                                                        className={inputClass}
                                                        autoComplete="address-level2"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">City or town</p>
                                                </InputField>
                                            </div>
                                        </div>

                                        {/* Privacy Notice */}
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Shield className="h-3 w-3 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">
                                                    <span className="font-semibold text-slate-700">Privacy first:</span> All personal information is encrypted and stored securely. Only authorized HR personnel can access this data, and it's used solely for employment purposes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EMPLOYMENT STEP */}
                                {currentStep === 1 && (
                                    <div className="space-y-8">
                                        {/* Helpful Context Box */}
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-blue-900 mb-1">Work Information</h3>
                                                <p className="text-sm text-blue-700">
                                                    Tell us about their role and where they'll fit in the team. This helps us set up their workspace and permissions correctly.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role & Department */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                Role & Department
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="What's their job title?" error={errors.job_title} required>
                                                    <input
                                                        {...register('job_title')}
                                                        placeholder="e.g. Senior Software Engineer"
                                                        className={inputClass}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">💡 Be specific - this appears on their profile and documents</p>
                                                </InputField>
                                                <InputField label="Which department?" error={errors.department} required>
                                                    <select {...register('department')} className={selectClass}>
                                                        <option value="">Choose a department...</option>
                                                        {departments.map(dept => (
                                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                        ))}
                                                    </select>
                                                    {departments.length === 0 && (
                                                        <p className="text-xs text-amber-600 mt-1.5">⚠️ No departments yet. Create one first!</p>
                                                    )}
                                                </InputField>
                                            </div>
                                        </div>

                                        {/* Reporting Structure */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                Team Structure
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="Who do they report to?" error={errors.manager} hint="Optional">
                                                    <select {...register('manager')} className={selectClass}>
                                                        <option value="">Direct to leadership</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xs text-slate-500 mt-1.5">This sets up approval workflows and team hierarchy</p>
                                                </InputField>
                                                <InputField label="Employment type" error={errors.employment_type} required>
                                                    <select {...register('employment_type')} className={selectClass}>
                                                        <option value="full_time">Full-Time Employee</option>
                                                        <option value="part_time">Part-Time Employee</option>
                                                        <option value="contract">Contractor</option>
                                                        <option value="intern">Intern</option>
                                                        <option value="casual">Casual Worker</option>
                                                    </select>
                                                </InputField>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-200" />

                                        {/* Important Dates */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-primary-500" />
                                                Important Dates
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <InputField label="When do they start?" error={errors.join_date} required>
                                                    <input {...register('join_date')} type="date" className={inputClass} />
                                                    <p className="text-xs text-slate-500 mt-1.5">Their official first day</p>
                                                </InputField>
                                                <InputField label="Probation ends on" error={errors.probation_end_date} hint="Optional">
                                                    <input {...register('probation_end_date')} type="date" className={inputClass} />
                                                    <p className="text-xs text-slate-500 mt-1.5">Usually 3-6 months from start date</p>
                                                </InputField>
                                                <InputField label="Current status" error={errors.employment_status} required>
                                                    <select {...register('employment_status')} className={selectClass}>
                                                        <option value="active">Active</option>
                                                        <option value="on_leave">On Leave</option>
                                                        <option value="suspended">Suspended</option>
                                                        <option value="terminated">Terminated</option>
                                                        <option value="resigned">Resigned</option>
                                                    </select>
                                                </InputField>
                                            </div>
                                        </div>

                                        {/* Quick Tip */}
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs font-bold text-slate-600">💡</span>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                <span className="font-semibold text-slate-700">Quick tip:</span> Make sure the department and manager are set up correctly - this affects leave approvals, performance reviews, and team reports.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* SALARY STEP */}
                                {currentStep === 2 && (
                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                <Wallet className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-emerald-900 mb-1 text-lg">Money matters</h3>
                                                <p className="text-sm text-emerald-700 leading-relaxed">
                                                    Let's set up their compensation package. This ensures they get paid correctly and on time.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Basic Salary */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                The basics
                                            </h3>
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                                <InputField label="What is their basic monthly salary?" error={errors.basic_salary} required>
                                                    <div className="relative max-w-md">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">UGX</span>
                                                        <input
                                                            {...register('basic_salary')}
                                                            type="number"
                                                            placeholder="0"
                                                            className={`${inputClass} pl-14 font-mono text-lg font-bold tracking-tight text-emerald-700`}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">Before tax and deductions</p>
                                                </InputField>
                                            </div>
                                        </div>

                                        {/* Allowances */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                Monthly Allowances (Optional)
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="Housing" error={errors.housing_allowance}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">UGX</span>
                                                        <input {...register('housing_allowance')} type="number" placeholder="0" className={`${inputClass} pl-14 font-mono`} />
                                                    </div>
                                                </InputField>
                                                <InputField label="Transport" error={errors.transport_allowance}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">UGX</span>
                                                        <input {...register('transport_allowance')} type="number" placeholder="0" className={`${inputClass} pl-14 font-mono`} />
                                                    </div>
                                                </InputField>
                                                <InputField label="Medical" error={errors.medical_allowance}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">UGX</span>
                                                        <input {...register('medical_allowance')} type="number" placeholder="0" className={`${inputClass} pl-14 font-mono`} />
                                                    </div>
                                                </InputField>
                                                <InputField label="Lunch" error={errors.lunch_allowance}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">UGX</span>
                                                        <input {...register('lunch_allowance')} type="number" placeholder="0" className={`${inputClass} pl-14 font-mono`} />
                                                    </div>
                                                </InputField>
                                                <InputField label="Other" error={errors.other_allowances}>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">UGX</span>
                                                        <input {...register('other_allowances')} type="number" placeholder="0" className={`${inputClass} pl-14 font-mono`} />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECURITY STEP */}
                                {currentStep === 3 && (
                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                                                <Lock className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-indigo-900 mb-1 text-lg">System Access</h3>
                                                <p className="text-sm text-indigo-700 leading-relaxed">
                                                    Control how they access the platform. You can grant different permissions based on their role.
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setValue('create_user', !createUser)}
                                            className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all ${createUser
                                                ? 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-500/10'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${createUser ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
                                                        }`}>
                                                        <Key className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-bold text-lg ${createUser ? 'text-indigo-900' : 'text-slate-900'}`}>Create User Account</h3>
                                                        <p className="text-sm text-slate-500">Allow them to log in to the employee portal</p>
                                                    </div>
                                                </div>
                                                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${createUser
                                                    ? 'bg-indigo-500 border-indigo-500 scale-110'
                                                    : 'border-slate-300 group-hover:border-indigo-400'
                                                    }`}>
                                                    {createUser && <CheckCircle className="h-4 w-4 text-white" />}
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {createUser && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-8 pl-1 origin-top"
                                                >
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-indigo-500" />
                                                            Login Credentials
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                                            <InputField label="Username (for login)" error={errors.username} required>
                                                                <input
                                                                    {...register('username')}
                                                                    placeholder="e.g. jdoe"
                                                                    className={inputClass}
                                                                    autoComplete="off"
                                                                />
                                                            </InputField>
                                                            <div className="space-y-3">
                                                                <div
                                                                    onClick={() => setValue('auto_password', !autoPassword)}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${autoPassword
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                                        }`}
                                                                >
                                                                    <div className={`h-5 w-5 rounded border flex items-center justify-center ${autoPassword
                                                                        ? 'bg-white/20 border-transparent'
                                                                        : 'border-slate-300'
                                                                        }`}>
                                                                        {autoPassword && <CheckCircle className="h-3 w-3 text-white" />}
                                                                    </div>
                                                                    <span className="text-sm font-semibold">Auto-generate secure password</span>
                                                                </div>
                                                                {!autoPassword && (
                                                                    <InputField label="Custom Password" error={errors.password} required>
                                                                        <input
                                                                            {...register('password')}
                                                                            type="password"
                                                                            placeholder="Minimum 8 characters"
                                                                            className={inputClass}
                                                                            autoComplete="new-password"
                                                                        />
                                                                    </InputField>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-indigo-500" />
                                                            What can they see?
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {[
                                                                { id: 'employee', label: 'Standard Employee', icon: User, desc: 'Can view their own profile, payslips, and request leave.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                                { id: 'manager', label: 'Team Manager', icon: Users, desc: 'Can manage their team, approve leave, and view reports.', color: 'text-blue-600', bg: 'bg-blue-50' },
                                                                { id: 'hr_manager', label: 'HR Administrator', icon: Shield, desc: 'Full access to all employee data and system settings.', color: 'text-purple-600', bg: 'bg-purple-50' },
                                                            ].map(role => (
                                                                <div
                                                                    key={role.id}
                                                                    onClick={() => setValue('role', role.id)}
                                                                    className={`relative p-6 rounded-2xl border-2 cursor-pointer text-left transition-all hover:shadow-lg ${watch('role') === role.id
                                                                        ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10'
                                                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                                                        }`}
                                                                >
                                                                    {watch('role') === role.id && (
                                                                        <div className="absolute top-4 right-4 text-indigo-500">
                                                                            <CheckCircle className="h-5 w-5" />
                                                                        </div>
                                                                    )}
                                                                    <role.icon className={`h-8 w-8 mb-4 ${role.color}`} />
                                                                    <p className="font-bold text-slate-900 mb-1">{role.label}</p>
                                                                    <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* DOCUMENTS STEP */}
                                {currentStep === 4 && (
                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-amber-900 mb-1 text-lg">Legal & Statutory</h3>
                                                <p className="text-sm text-amber-800 leading-relaxed">
                                                    We need these identification numbers for tax compliance and insurance.
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-amber-500" />
                                                Identification
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="National ID Number (NIN)" error={errors.national_id} required>
                                                    <div className="relative">
                                                        <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                        <input
                                                            {...register('national_id')}
                                                            placeholder="e.g. CM12345..."
                                                            className={`${inputClass} pl-12 uppercase font-mono`}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1.5">Usually found on the back of the ID card</p>
                                                </InputField>
                                                <InputField label="Passport Number" error={errors.passport_number} hint="Optional">
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                        <input
                                                            {...register('passport_number')}
                                                            placeholder="e.g. A00123..."
                                                            className={`${inputClass} pl-12 uppercase font-mono`}
                                                        />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-amber-500" />
                                                Tax & Insurance
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="TIN Number" error={errors.tin_number} hint="Optional">
                                                    <input
                                                        {...register('tin_number')}
                                                        placeholder="10 digits"
                                                        className={`${inputClass} font-mono`}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">For URA tax filing</p>
                                                </InputField>
                                                <InputField label="NSSF Number" error={errors.nssf_number} hint="Optional">
                                                    <input
                                                        {...register('nssf_number')}
                                                        placeholder="Member ID"
                                                        className={`${inputClass} font-mono`}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1.5">For social security contributions</p>
                                                </InputField>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EMERGENCY STEP */}
                                {currentStep === 5 && (
                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
                                                <Heart className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-rose-900 mb-1 text-lg">Final details</h3>
                                                <p className="text-sm text-rose-800 leading-relaxed">
                                                    Just a few last things to keep them safe and get them paid.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-rose-500" />
                                                Who should we call in an emergency?
                                            </h3>
                                            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="Contact Name" error={errors.emergency_contact_name} hint="Optional">
                                                    <input
                                                        {...register('emergency_contact_name')}
                                                        placeholder="e.g. Spouse or Parent"
                                                        className={inputClass}
                                                    />
                                                </InputField>
                                                <InputField label="Phone Number" error={errors.emergency_contact_phone} hint="Optional">
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                        <input
                                                            {...register('emergency_contact_phone')}
                                                            placeholder="+256..."
                                                            className={`${inputClass} pl-12`}
                                                        />
                                                    </div>
                                                </InputField>
                                                <div className="md:col-span-2">
                                                    <InputField label="Relationship" error={errors.emergency_contact_relationship} hint="Optional">
                                                        <select {...register('emergency_contact_relationship')} className={selectClass}>
                                                            <option value="">Choose relationship...</option>
                                                            <option value="spouse">Spouse</option>
                                                            <option value="parent">Parent</option>
                                                            <option value="sibling">Sibling</option>
                                                            <option value="child">Child</option>
                                                            <option value="friend">Friend</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </InputField>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-200" />

                                        {/* Banking Details */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                Where should we send their salary?
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="Bank Name" error={errors.bank_name} hint="Optional">
                                                    <input
                                                        {...register('bank_name')}
                                                        placeholder="e.g. Stanbic Bank"
                                                        className={inputClass}
                                                    />
                                                </InputField>
                                                <InputField label="Account Number" error={errors.bank_account_number} hint="Optional">
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                        <input
                                                            {...register('bank_account_number')}
                                                            placeholder="Account Number"
                                                            className={`${inputClass} pl-12 font-mono`}
                                                        />
                                                    </div>
                                                </InputField>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <div className="bg-slate-50 rounded-xl p-4 flex gap-4">
                                                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                                    <Info className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">Ready to submit?</h4>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Please review all the information before adding this team member. You can always edit their profile later.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <InputField label="Additional Notes" error={errors.notes} hint="Internal use only">
                                            <textarea
                                                {...register('notes')}
                                                rows={3}
                                                placeholder="Any other relevant information..."
                                                className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none"
                                            />
                                        </InputField>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={currentStep === 0 ? () => navigate('/employees') : prevStep}
                                        className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold rounded-xl"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        {currentStep === 0 ? 'Cancel' : 'Previous'}
                                    </Button>

                                    {currentStep < steps.length - 1 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all"
                                        >
                                            Continue
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isCreating || isUpdating}
                                            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all gap-2"
                                        >
                                            {isCreating || isUpdating ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    {isEditMode ? 'Update Employee' : 'Add to Team'}
                                                </>
                                            )}
                                        </Button>
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
