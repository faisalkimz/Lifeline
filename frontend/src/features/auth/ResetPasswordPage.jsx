import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { CheckCircle2, KeyRound, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResetPasswordMutation, useVerifyResetTokenMutation } from '../../store/api';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
    new_password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must include an uppercase letter')
        .regex(/[0-9]/, 'Must include a number')
        .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const { uid, token } = useParams();
    const [verifyToken] = useVerifyResetTokenMutation();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const [tokenStatus, setTokenStatus] = useState('verifying'); // 'verifying', 'valid', 'invalid'
    const [userEmail, setUserEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onChange'
    });

    const password = watch('new_password', '');

    const calculatePasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = calculatePasswordStrength(password);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const result = await verifyToken({ uid, token }).unwrap();
                if (result.valid) {
                    setTokenStatus('valid');
                    setUserEmail(result.email);
                } else {
                    setTokenStatus('invalid');
                }
            } catch (error) {
                setTokenStatus('invalid');
            }
        };

        if (uid && token) {
            checkToken();
        }
    }, [uid, token, verifyToken]);

    const onSubmit = async (data) => {
        try {
            await resetPassword({
                uid,
                token,
                new_password: data.new_password
            }).unwrap();

            setResetSuccess(true);
            toast.success('Password reset successfully!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to reset password');
        }
    };

    if (tokenStatus === 'verifying') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="w-full max-w-md p-12 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Verifying reset link...</p>
                </Card>
            </div>
        );
    }

    if (tokenStatus === 'invalid') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="w-full max-w-md">
                    <CardContent className="p-12 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-error-100 dark:bg-error-900/30 text-error-600 mb-4"
                        >
                            <AlertTriangle className="h-10 w-10" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                This password reset link is invalid or has expired.
                            </p>
                        </div>
                        <Link to="/forgot-password">
                            <Button variant="primary" fullWidth className="rounded-xl h-12 font-bold">
                                Request a New Link
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (resetSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="w-full max-w-md">
                    <CardContent className="p-12 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                            className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-success-100 dark:bg-success-900/30 text-success-600 mb-4"
                        >
                            <CheckCircle2 className="h-10 w-10" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Password Reset Complete!</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your password has been successfully updated. Redirecting you to login...
                            </p>
                        </div>
                        <Link to="/login">
                            <Button variant="primary" fullWidth className="rounded-xl h-12 font-bold">
                                Continue to Sign In
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4"
                    >
                        <KeyRound className="h-8 w-8" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create New Password</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">For {userEmail}</p>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-gray-900/50 border-slate-100 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.new_password?.message}
                                    {...register('new_password')}
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
                                                            : 'bg-slate-200'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                                            Security Rank: <span className={cn(
                                                strength <= 2 ? 'text-error-500' : strength === 3 ? 'text-warning-500' : 'text-success-500'
                                            )}>
                                                {strength <= 1 ? 'Vulnerable' : strength === 2 ? 'Weak' : strength === 3 ? 'Moderate' : 'Unbreakable'}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.confirm_password?.message}
                                {...register('confirm_password')}
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    isLoading={isLoading}
                                    className="rounded-xl h-14 font-black text-base shadow-xl dark:shadow-none bg-primary-600 hover:bg-primary-700"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
