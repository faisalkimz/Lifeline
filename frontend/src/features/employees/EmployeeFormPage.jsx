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
    useUpdateSalaryStructureMutation
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
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 transition-all group-focus-within:text-primary-500 group-focus-within:translate-x-1">
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors group-focus-within:bg-primary-500" />
                {Icon && <Icon className="h-3 w-3 transition-transform group-focus-within:rotate-12" />}
                {label} {required && <span className="text-primary-500 animate-pulse">*</span>}
            </label>
        </div>
        <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/0 rounded-2xl transition-all duration-500 group-focus-within:from-primary-500/20 group-focus-within:via-indigo-500/20 group-focus-within:to-purple-500/20" />
            {children}
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-6 left-1 flex items-center gap-1.5 text-[10px] text-primary-500 font-black tracking-tight bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20 backdrop-blur-md"
                >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {error.message}
                </motion.div>
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
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary-500/30">
            {/* Animated Cosmic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] animate-bounce-slow" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-12 pb-20">
                {/* Premium Header - NEXT-GEN STYLE */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[3rem] bg-slate-900/40 border border-white/5 overflow-hidden backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                >
                    {/* Interior Glows */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]" />

                    <div className="relative z-10 px-12 py-14">
                        <div className="flex items-center gap-4 mb-10 overflow-hidden">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl"
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
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.04em] leading-[0.9] flex flex-col">
                                    {isEditMode ? (
                                        <><span>Edit</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 drop-shadow-sm">Employee</span></>
                                    ) : (
                                        <><span>New</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 drop-shadow-sm">Onboarding</span></>
                                    )}
                                </h1>
                                <p className="text-slate-400 font-bold text-xl max-w-2xl leading-relaxed opacity-80">
                                    {isEditMode
                                        ? "Update employee details and organizational information."
                                        : "Create a new employee profile in the system."}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 p-3 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                                <motion.button
                                    whileHover={{ scale: 1.05, x: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/employees')}
                                    className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white transition-all group"
                                >
                                    <ChevronLeft className="h-7 w-7 group-hover:text-primary-400 transition-colors" />
                                </motion.button>

                                {isEditMode && (
                                    <Button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        variant="ghost"
                                        className="h-16 px-10 rounded-[1.5rem] text-red-400 hover:text-red-300 hover:bg-red-500/10 font-black uppercase tracking-widest text-[11px] transition-all"
                                    >
                                        Delete Employee
                                    </Button>
                                )}

                                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isCreating || isUpdating}
                                        className="bg-primary-600 hover:bg-primary-500 text-white font-black px-12 h-16 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.6)] transition-all flex items-center gap-4 border-none text-lg tracking-tight"
                                    >
                                        <Save className="h-6 w-6" />
                                        <span>{isCreating || isUpdating ? 'Saving...' : 'Save Changes'}</span>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Visual Sidebar - ULTRA PREMIUM */}
                    <div className="lg:col-span-4 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/60 rounded-[4rem] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] sticky top-8"
                        >
                            <div className="h-56 bg-[#0a0a0a] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-purple-600/30 animate-pulse"></div>
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] hover:scale-110 transition-transform duration-[10s]"></div>
                                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent"></div>
                            </div>

                            <CardContent className="-mt-28 pb-16 px-12 flex flex-col items-center relative z-10 text-center">
                                <div className="relative mb-10 group">
                                    <motion.div
                                        className="h-52 w-52 rounded-[4rem] bg-[#0a0a0a] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10"
                                        whileHover={{ y: -10, rotate: 2 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        {previewImage ? (
                                            <img src={getImageUrl(previewImage)} alt="Preview" className="h-full w-full object-cover rounded-[3.5rem]" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-800/50 rounded-[3.5rem] flex items-center justify-center border border-white/5">
                                                <User className="h-24 w-24 text-slate-700" />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-primary-600/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-500 rounded-[3.5rem] backdrop-blur-md">
                                            <div className="p-5 bg-white/20 rounded-3xl mb-4">
                                                <Upload className="h-10 w-10 text-white" />
                                            </div>
                                            <span className="text-[14px] font-black uppercase tracking-[0.25em] text-center px-4 leading-tight">Upload Profile<br />Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </motion.div>

                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute -bottom-4 -right-4 h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 p-5 shadow-[0_15px_30px_rgba(59,130,246,0.6)] border-[6px] border-[#0a0a0a] flex items-center justify-center"
                                    >
                                        <Shield className="h-9 w-9 text-white" />
                                    </motion.div>
                                </div>

                                <div className="space-y-5">
                                    <h3 className="text-5xl font-black text-white mb-3 tracking-tighter leading-none">
                                        <span className="block truncate max-w-[280px]">{watch('first_name') || 'Pending'}</span>
                                        <span className="text-slate-500 block truncate max-w-[280px]">{watch('last_name') || 'Entity'}</span>
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <span className="text-[11px] font-black text-primary-400 uppercase tracking-[0.3em] bg-primary-500/10 px-6 py-3 rounded-2xl border border-primary-500/20 backdrop-blur-md">
                                            {watch('job_title') || 'No Title'}
                                        </span>
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                                            {watch('employment_status')?.replace('_', ' ') || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </motion.div>


                        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none transition-transform group-hover:scale-110 duration-1000"></div>

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-primary-500 transition-colors">
                                        <Sparkles className="h-6 w-6 text-primary-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg tracking-tight">Onboarding Progress</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Form Completion</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-3xl font-black text-white">{progress}%</span>
                                    <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest">Calculated</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-white/5 rounded-full mb-10 overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                />
                            </div>

                            <div className="space-y-6 relative z-10">
                                {[
                                    { icon: Info, text: "All mandatory fields must be filled correctly.", color: "text-primary-400" },
                                    { icon: Shield, text: "Role assignment determines system access levels.", color: "text-indigo-400" },
                                    { icon: AlertTriangle, text: departments.length ? "Departments loaded." : "WARN: No departments found.", color: departments.length ? "text-emerald-400" : "text-amber-500" }
                                ].map((tip, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        className="flex gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/tip"
                                    >
                                        <tip.icon className={`h-6 w-6 ${tip.color} shrink-0 group-hover/tip:scale-110 transition-transform`} />
                                        <p className="text-xs text-slate-400 leading-relaxed font-bold group-hover/tip:text-slate-200 transition-colors">{tip.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Form Fields - REDESIGNED */}
                    <div className="lg:col-span-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="flex flex-wrap h-auto p-2 bg-slate-100/50 dark:bg-slate-950/50 rounded-[2rem] mb-10 gap-2 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl">
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
                                        className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary-600 data-[state=active]:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] h-16 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/50 dark:hover:bg-white/5 relative group border-none shadow-none"
                                    >
                                        <span className="absolute top-2 right-3 text-[7px] font-black opacity-20 group-data-[state=active]:opacity-40 tracking-tighter">{tab.step}</span>
                                        <tab.icon className={`h-4 w-4 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="border-none shadow-premium bg-white dark:bg-slate-800/80 backdrop-blur-md min-h-[550px] overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                            <Sparkles className="h-32 w-32 text-primary-600" />
                                        </div>
                                        <CardContent className="p-10">
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                {/* Personal Tab */}
                                                <TabsContent value="personal" className="space-y-10 mt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <FormField label="First Name" error={errors.first_name} required icon={User}>
                                                            <Input {...register('first_name')} placeholder="First Name" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Middle Name" error={errors.middle_name} icon={User}>
                                                            <Input {...register('middle_name')} placeholder="Middle Name" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Last Name" error={errors.last_name} required icon={User}>
                                                            <Input {...register('last_name')} placeholder="Last Name" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <FormField label="Email Address" error={errors.email} required icon={Mail}>
                                                            <Input type="email" {...register('email')} placeholder="email@domain.com" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Phone Number" error={errors.phone} required icon={Phone}>
                                                            <Input {...register('phone')} placeholder="+256..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                        <FormField label="Date of Birth" error={errors.date_of_birth} required icon={Calendar}>
                                                            <Input type="date" {...register('date_of_birth')} className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
                                                        </FormField>
                                                        <FormField label="Gender" error={errors.gender} required icon={User}>
                                                            <select className="ui-select w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold focus:ring-2 focus:ring-primary-500" {...register('gender')}>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </FormField>
                                                        <FormField label="Marital Status" error={errors.marital_status} icon={Star}>
                                                            <select className="ui-select w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold focus:ring-2 focus:ring-primary-500" {...register('marital_status')}>
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
                                                            <select className="ui-select w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold focus:ring-2 focus:ring-primary-500" {...register('department')}>
                                                                <option value="">Select Department</option>
                                                                {departments.map(dept => (
                                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                                ))}
                                                            </select>
                                                        </FormField>
                                                        <FormField label="Job Title" error={errors.job_title} required icon={Briefcase}>
                                                            <Input {...register('job_title')} placeholder="e.g. Lead Architect" className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" />
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
                                                            <div className="p-5 bg-white/5 rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-inner group-hover:bg-primary-500 transition-colors duration-500">
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
                                                            <div className={`p-4 rounded-2xl transition-colors ${createUser ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
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
                                                            <Input {...register('national_id')} placeholder="CM..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase" />
                                                        </FormField>
                                                        <FormField label="Passport Number" error={errors.passport_number} icon={Shield}>
                                                            <Input {...register('passport_number')} placeholder="A..." className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase" />
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
                                                <div className="flex justify-end gap-5 pt-12 border-t border-slate-100 dark:border-slate-800 mt-12">
                                                    <Button
                                                        variant="ghost"
                                                        type="button"
                                                        onClick={() => navigate('/employees')}
                                                        className="h-16 px-10 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-black transition-all"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSubmit(onSubmit)}
                                                        disabled={isCreating || isUpdating}
                                                        className="h-16 px-12 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] transition-all flex items-center gap-3 border-none"
                                                    >
                                                        <Save className="h-6 w-6" />
                                                        {isCreating || isUpdating ? 'Saving...' : 'Save Employee'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormPage;
