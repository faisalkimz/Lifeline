import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../store/api';
import { setCredentials } from './authSlice';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

// Validation Schema
const registerSchema = z.object({
    company_name: z.string().min(2, 'Company name is too short'),
    company_email: z.string().email('Enter a valid company email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Enter a valid personal email'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must include an uppercase letter')
        .regex(/[0-9]/, 'Must include a number')
        .regex(/[^A-Za-z0-9]/, 'Must include a special character')
        .refine((val) => !['password', 'password123', 'admin123', 'qwertyuiop', '12345678'].includes(val.toLowerCase()), {
            message: "This password is too common - choose something unique"
        }),
    password2: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password2, {
    message: "Passwords don't match",
    path: ["password2"],
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [registerUser, { isLoading, error }] = useRegisterMutation();

    const { register, handleSubmit, formState: { errors, touchedFields }, watch } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onChange'
    });

    const password = watch('password', '');

    const calculatePasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = calculatePasswordStrength(password);

    const onSubmit = async (data) => {
        try {
            const registrationData = {
                ...data,
                company_phone: '',
                company_address: '',
                company_city: '',
                company_country: 'UG',
                phone: '',
                tax_id: ''
            };

            const result = await registerUser(registrationData).unwrap();
            dispatch(setCredentials({
                user: result.user,
                token: result.tokens.access
            }));
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
            // Error is automatically handled by RTK Query and displayed via the error state
        }
    };

    return (

        <div className="w-full animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                    Already using Lifeline?{' '}
                    <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-all">
                        Sign in
                    </Link>
                </p>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-100 dark:border-error-900/20 flex items-start gap-3 overflow-hidden"
                    >
                        <AlertCircle className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-error-700 dark:text-error-400">
                            <p className="font-bold">Registration Failed</p>
                            {error?.data && typeof error.data === 'object' && !Array.isArray(error.data) ? (
                                <div className="mt-1 opacity-90 space-y-1">
                                    {Object.entries(error.data).map(([field, messages]) => {
                                        const message = Array.isArray(messages) ? messages[0] : messages;
                                        const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        return (
                                            <p key={field}>
                                                <span className="font-semibold">{fieldLabel}:</span> {message}
                                            </p>
                                        );
                                    })}
                                </div>
                            ) : error?.data?.detail ? (
                                <p className="mt-1 opacity-90">{error.data.detail}</p>
                            ) : error?.data?.message ? (
                                <p className="mt-1 opacity-90">{error.data.message}</p>
                            ) : (
                                <p className="mt-1 opacity-90">Please check your details and try again.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section: Company */}
                <div className="space-y-5">
                    <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Details</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                        <Input
                            label="Organization Name"
                            placeholder="e.g. Acme Corporation"
                            error={errors.company_name?.message}
                            {...register('company_name')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                        <Input
                            label="Business Email"
                            type="email"
                            placeholder="hello@acme.com"
                            error={errors.company_email?.message}
                            {...register('company_email')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                    </div>
                </div>

                {/* Section: Admin */}
                <div className="space-y-5">
                    <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin Access</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="First Name"
                            placeholder="John"
                            error={errors.first_name?.message}
                            {...register('first_name')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                        <Input
                            label="Last Name"
                            placeholder="Doe"
                            error={errors.last_name?.message}
                            {...register('last_name')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="Public ID"
                            placeholder="johndoe"
                            error={errors.username?.message}
                            {...register('username')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                        <Input
                            label="Personal Email"
                            type="email"
                            placeholder="john@personal.com"
                            error={errors.email?.message}
                            {...register('email')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Input
                                label="Secure Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register('password')}
                                className="bg-slate-50 dark:bg-slate-900/50"
                            />
                            {/* Strength Meter */}
                            {password && (
                                <div className="px-1 space-y-1.5">
                                    <div className="flex gap-1 h-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-full flex-1 rounded-full transition-all duration-500",
                                                    i <= strength
                                                        ? (strength <= 2 ? 'bg-error-500' : strength === 3 ? 'bg-warning-500' : 'bg-success-500')
                                                        : 'bg-slate-200 dark:bg-slate-800'
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Security: <span className={cn(
                                            strength <= 2 ? 'text-error-500' : strength === 3 ? 'text-warning-500' : 'text-success-500'
                                        )}>
                                            {strength <= 1 ? 'Poor' : strength === 2 ? 'Weak' : strength === 3 ? 'Good' : 'Strong'}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password2?.message}
                            {...register('password2')}
                            className="bg-slate-50 dark:bg-slate-900/50"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        size="xl"
                        isLoading={isLoading}
                        className="rounded-xl font-bold text-base shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 dark:shadow-none bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all"
                    >
                        Launch Workspace
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
