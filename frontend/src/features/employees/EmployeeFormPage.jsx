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
    { id: 'tax_ids', label: 'Tax & ID', icon: FileText, description: 'TIN, NSSF & ID' },
    { id: 'emergency', label: 'Emergency', icon: Heart, description: 'Contacts & bank' },
];

const InputField = ({ label, error, required, hint, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        {error && (
            <p className="text-xs text-rose-500 mt-1">
                {error.message}
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
                <p className="text-slate-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    const inputClass = "w-full h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all";
    const selectClass = "w-full h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all appearance-none cursor-pointer";

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 pb-6 border-b border-slate-200">
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">CANCEL</span>
                    </button>

                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-semibold text-slate-800 uppercase tracking-tight">
                            {isEditMode ? 'Edit Employee' : 'New Employee'}
                        </h1>
                    </div>
                </div>

                {/* Step Progress */}
                <div className="mb-10 overflow-x-auto pb-4">
                    <div className="flex items-center justify-between min-w-[800px] px-4">
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(index)}
                                className={`flex items-center gap-3 transition-all ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${index === currentStep
                                    ? 'bg-green-600 text-white'
                                    : index < currentStep
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className={`text-sm font-semibold whitespace-nowrap ${index === currentStep ? 'text-slate-800' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && (
                                    <ChevronRight className="h-4 w-4 text-slate-300 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    {/* Step Title Header */}
                    <div className="px-8 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wide">{steps[currentStep].label}</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                        {/* IDENTITY STEP */}
                        {currentStep === 0 && (
                            <div className="space-y-10">
                                {/* Full Name Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="First Name" error={errors.first_name} required>
                                        <input
                                            {...register('first_name')}
                                            placeholder="First Name"
                                            className={inputClass}
                                            autoComplete="given-name"
                                        />
                                    </InputField>
                                    <InputField label="Middle Name" error={errors.middle_name}>
                                        <input
                                            {...register('middle_name')}
                                            placeholder="Middle Name"
                                            className={inputClass}
                                            autoComplete="additional-name"
                                        />
                                    </InputField>
                                    <InputField label="Last Name" error={errors.last_name} required>
                                        <input
                                            {...register('last_name')}
                                            placeholder="Last Name"
                                            className={inputClass}
                                            autoComplete="family-name"
                                        />
                                    </InputField>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <InputField label="Email Address" error={errors.email} required>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            placeholder="Email Address"
                                            className={inputClass}
                                            autoComplete="email"
                                        />
                                    </InputField>
                                    <InputField label="Phone Number" error={errors.phone} required>
                                        <input
                                            {...register('phone')}
                                            placeholder="Phone Number"
                                            className={inputClass}
                                            autoComplete="tel"
                                        />
                                    </InputField>
                                </div>

                                {/* Personal Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                    <InputField label="Date of Birth" error={errors.date_of_birth} required>
                                        <input
                                            {...register('date_of_birth')}
                                            type="date"
                                            className={inputClass}
                                            autoComplete="bday"
                                        />
                                    </InputField>
                                    <InputField label="Gender" error={errors.gender} required>
                                        <select {...register('gender')} className={selectClass}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </InputField>
                                    <InputField label="Marital Status" error={errors.marital_status}>
                                        <select {...register('marital_status')} className={selectClass}>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="divorced">Divorced</option>
                                            <option value="widowed">Widowed</option>
                                        </select>
                                    </InputField>
                                </div>

                                {/* Address */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                    <div className="md:col-span-2">
                                        <InputField label="Street Address" error={errors.address}>
                                            <input
                                                {...register('address')}
                                                placeholder="Street Address"
                                                className={inputClass}
                                                autoComplete="street-address"
                                            />
                                        </InputField>
                                    </div>
                                    <InputField label="City" error={errors.city}>
                                        <input
                                            {...register('city')}
                                            placeholder="City"
                                            className={inputClass}
                                            autoComplete="address-level2"
                                        />
                                    </InputField>
                                </div>
                            </div>
                        )}

                        {/* EMPLOYMENT STEP */}
                        {currentStep === 1 && (
                            <div className="space-y-10">
                                {/* Role & Department */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Job Title" error={errors.job_title} required>
                                        <input
                                            {...register('job_title')}
                                            placeholder="Job Title"
                                            className={inputClass}
                                        />
                                    </InputField>
                                    <InputField label="Department" error={errors.department} required>
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

                                {/* Reporting Structure */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <InputField label="Reports To" error={errors.manager}>
                                        <select {...register('manager')} className={selectClass}>
                                            <option value="">Direct to leadership</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                            ))}
                                        </select>
                                    </InputField>
                                    <InputField label="Employment Type" error={errors.employment_type} required>
                                        <select {...register('employment_type')} className={selectClass}>
                                            <option value="full_time">Full-Time Employee</option>
                                            <option value="part_time">Part-Time Employee</option>
                                            <option value="contract">Contractor</option>
                                            <option value="intern">Intern</option>
                                            <option value="casual">Casual Worker</option>
                                        </select>
                                    </InputField>
                                </div>

                                {/* Important Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                    <InputField label="Join Date" error={errors.join_date} required>
                                        <input {...register('join_date')} type="date" className={inputClass} />
                                    </InputField>
                                    <InputField label="Probation End Date" error={errors.probation_end_date}>
                                        <input {...register('probation_end_date')} type="date" className={inputClass} />
                                    </InputField>
                                    <InputField label="Employment Status" error={errors.employment_status} required>
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
                        )}

                        {/* SALARY STEP */}
                        {currentStep === 2 && (
                            <div className="space-y-10">
                                <div className="max-w-md">
                                    <InputField label="Basic Monthly Salary" error={errors.basic_salary} required>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-slate-400 text-sm">UGX</span>
                                            <input
                                                {...register('basic_salary')}
                                                type="number"
                                                placeholder="0"
                                                className={`${inputClass} pl-12`}
                                            />
                                        </div>
                                    </InputField>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Monthly Allowances</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Housing" error={errors.housing_allowance}>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">UGX</span>
                                                <input {...register('housing_allowance')} type="number" placeholder="0" className={`${inputClass} pl-12`} />
                                            </div>
                                        </InputField>
                                        <InputField label="Transport" error={errors.transport_allowance}>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">UGX</span>
                                                <input {...register('transport_allowance')} type="number" placeholder="0" className={`${inputClass} pl-12`} />
                                            </div>
                                        </InputField>
                                        <InputField label="Medical" error={errors.medical_allowance}>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">UGX</span>
                                                <input {...register('medical_allowance')} type="number" placeholder="0" className={`${inputClass} pl-12`} />
                                            </div>
                                        </InputField>
                                        <InputField label="Lunch" error={errors.lunch_allowance}>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">UGX</span>
                                                <input {...register('lunch_allowance')} type="number" placeholder="0" className={`${inputClass} pl-12`} />
                                            </div>
                                        </InputField>
                                        <InputField label="Other" error={errors.other_allowances}>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">UGX</span>
                                                <input {...register('other_allowances')} type="number" placeholder="0" className={`${inputClass} pl-12`} />
                                            </div>
                                        </InputField>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECURITY STEP */}
                        {currentStep === 3 && (
                            <div className="space-y-10">
                                <div
                                    onClick={() => setValue('create_user', !createUser)}
                                    className={`p-6 rounded border cursor-pointer transition-all ${createUser
                                        ? 'bg-green-50/50 border-green-500'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${createUser ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <Key className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">System Access</h3>
                                                <p className="text-xs text-slate-500">Enable user account for this employee</p>
                                            </div>
                                        </div>
                                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${createUser ? 'bg-green-600 border-green-600' : 'border-slate-200'}`}>
                                            {createUser && <CheckCircle className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>
                                </div>

                                {createUser && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <InputField label="Username" error={errors.username} required>
                                            <input {...register('username')} placeholder="Username" className={inputClass} />
                                        </InputField>
                                        <InputField label="System Role" error={errors.role} required>
                                            <select {...register('role')} className={selectClass}>
                                                <option value="employee">Employee</option>
                                                <option value="hr_manager">HR Manager</option>
                                                <option value="company_admin">Company Admin</option>
                                                <option value="manager">Line Manager</option>
                                            </select>
                                        </InputField>

                                        {!autoPassword && (
                                            <InputField label="Initial Password" error={errors.password} required>
                                                <input {...register('password')} type="password" placeholder="Password" className={inputClass} />
                                            </InputField>
                                        )}

                                        <div className="md:col-span-2 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input type="checkbox" {...register('auto_password')} className="sr-only" />
                                                    <div className={`w-10 h-5 rounded-full transition-colors ${autoPassword ? 'bg-green-600' : 'bg-slate-200'}`} />
                                                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${autoPassword ? 'translate-x-5' : ''}`} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Generate random password automatically</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAX & ID STEP */}
                        {currentStep === 4 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Tax Information</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <InputField label="TIN Number" error={errors.tin_number}>
                                            <input {...register('tin_number')} placeholder="TIN" className={inputClass} />
                                        </InputField>
                                        <InputField label="NSSF Number" error={errors.nssf_number}>
                                            <input {...register('nssf_number')} placeholder="NSSF" className={inputClass} />
                                        </InputField>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Identification</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <InputField label="National ID / NIN" error={errors.national_id} required>
                                            <input {...register('national_id')} placeholder="National ID" className={inputClass} />
                                        </InputField>
                                        <InputField label="Passport Number" error={errors.passport_number}>
                                            <input {...register('passport_number')} placeholder="Passport Number" className={inputClass} />
                                        </InputField>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EMERGENCY STEP */}
                        {currentStep === 5 && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Emergency Contact</h3>
                                        <div className="space-y-6">
                                            <InputField label="Full Name" error={errors.emergency_contact_name}>
                                                <input {...register('emergency_contact_name')} placeholder="Name" className={inputClass} />
                                            </InputField>
                                            <InputField label="Phone Number" error={errors.emergency_contact_phone}>
                                                <input {...register('emergency_contact_phone')} placeholder="Phone" className={inputClass} />
                                            </InputField>
                                            <InputField label="Relationship" error={errors.emergency_contact_relationship}>
                                                <input {...register('emergency_contact_relationship')} placeholder="e.g. Spouse" className={inputClass} />
                                            </InputField>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Bank Details</h3>
                                        <div className="space-y-6">
                                            <InputField label="Bank Name" error={errors.bank_name}>
                                                <input {...register('bank_name')} placeholder="Bank Name" className={inputClass} />
                                            </InputField>
                                            <InputField label="Bank Branch" error={errors.bank_branch}>
                                                <input {...register('bank_branch')} placeholder="Branch" className={inputClass} />
                                            </InputField>
                                            <InputField label="Account Number" error={errors.bank_account_number}>
                                                <input {...register('bank_account_number')} placeholder="Account Number" className={inputClass} />
                                            </InputField>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <InputField label="Additional Notes" error={errors.notes}>
                                        <textarea
                                            {...register('notes')}
                                            rows={3}
                                            placeholder="Notes..."
                                            className="w-full p-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all resize-none"
                                        />
                                    </InputField>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={currentStep === 0 ? () => navigate('/employees') : prevStep}
                                className="px-6 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium rounded text-sm uppercase transition-all"
                            >
                                {currentStep === 0 ? 'CANCEL' : 'Previous'}
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-2.5 bg-[#88B072] hover:bg-[#7aa265] text-white font-medium rounded text-sm uppercase transition-all"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-8 py-2.5 bg-[#88B072] hover:bg-[#7aa265] text-white font-medium rounded text-sm uppercase transition-all flex items-center gap-2"
                                >
                                    {isCreating || isUpdating ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {isEditMode ? 'Update Employee' : 'Submit'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormPage;
