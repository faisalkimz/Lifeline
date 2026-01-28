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
        <div className="animate-fade-in-up py-8 sm:py-0 w-full max-w-2xl mx-auto">
            <div className="text-center mb-10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-premium-lg mb-6"
                >
                    <UserPlus className="h-10 w-10 text-primary-600" />
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Get Started</h2>
                <p className="text-gray-500 text-lg">Create your enterprise workspace</p>
            </div>

            <Card className="border-none shadow-premium-xl bg-white/80 backdrop-blur-xl border border-white/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500" />
                <CardContent className="p-8 sm:p-10">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-4 shadow-sm overflow-hidden"
                            >
                                <div className="p-2 bg-red-100 rounded-lg shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="text-sm text-red-800">
                                    <p className="font-bold text-base mb-1">Registration Failed</p>
                                    <div className="opacity-90 space-y-1">
                                        {error?.data && typeof error.data === 'object' && !Array.isArray(error.data) && error.data !== null ? (
                                            Object.entries(error.data).map(([field, messages]) => {
                                                const message = Array.isArray(messages) ? messages[0] : messages;
                                                const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                return (
                                                    <p key={field}>
                                                        <span className="font-semibold">{fieldLabel}:</span> {message}
                                                    </p>
                                                );
                                            })
                                        ) : error?.data?.detail ? (
                                            <p>{error.data.detail}</p>
                                        ) : error?.data?.message ? (
                                            <p>{error.data.message}</p>
                                        ) : (
                                            <p>Please review your details and try again.</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        {/* Section: Company */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <Sparkle className="h-4 w-4 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Organization Details</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Company Name"
                                    placeholder="e.g. Acme Corporation"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.company_name?.message}
                                    {...register('company_name')}
                                />
                                <Input
                                    label="Work Email"
                                    type="email"
                                    placeholder="hello@company.com"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.company_email?.message}
                                    {...register('company_email')}
                                />
                            </div>
                        </div>

                        {/* Section: Admin */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Admin Account</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.first_name?.message}
                                    {...register('first_name')}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.last_name?.message}
                                    {...register('last_name')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Admin Username"
                                    placeholder="johndoe"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.username?.message}
                                    {...register('username')}
                                />
                                <Input
                                    label="Personal Email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                    {/* Strength Meter */}
                                    {password && (
                                        <div className="px-1 space-y-2 pt-1">
                                            <div className="flex gap-1 h-1.5">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-full flex-1 rounded-full transition-all duration-500",
                                                            i <= strength
                                                                ? (strength <= 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : strength === 3 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]')
                                                                : 'bg-gray-100'
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-gray-400">Strength check</span>
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider transition-colors",
                                                    strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-amber-500' : 'text-emerald-600'
                                                )}>
                                                    {strength <= 1 ? 'Too Weak' : strength === 2 ? 'Weak' : strength === 3 ? 'Good' : 'Example'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                    error={errors.password2?.message}
                                    {...register('password2')}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isLoading}
                                className="h-14 font-bold text-base rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-500"
                            >
                                Launch Workspace
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                    <p className="text-center text-sm font-medium text-gray-600">
                        Already have a workspace?{' '}
                        <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </Card>

            <p className="text-center mt-8 text-xs font-medium text-gray-400">
                &copy; {new Date().getFullYear()} Lifeline HR. Start your 14-day free trial.
            </p>
        </div>
    );
};

export default RegisterPage;
