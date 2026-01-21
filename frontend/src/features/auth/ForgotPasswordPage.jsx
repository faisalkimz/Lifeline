import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequestPasswordResetMutation } from '../../store/api';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordPage = () => {
    const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
    const [emailSent, setEmailSent] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const email = watch('email');

    const onSubmit = async (data) => {
        try {
            await requestReset(data).unwrap();
            setEmailSent(true);
        } catch (error) {
            // Even on error, show success message for security
            setEmailSent(true);
        }
    };

    return (
        <div className="animate-fade-in py-8 sm:py-0">
            <AnimatePresence mode="wait">
                {!emailSent ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="text-center mb-10">
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mb-4"
                            >
                                <Shield className="h-8 w-8" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recovery Mode</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">We'll send a secure reset link to your email</p>
                        </div>

                        <Card className="border-none shadow-none lg:shadow-xl lg:shadow-slate-200/50 dark:lg:shadow-none bg-transparent lg:bg-white dark:lg:bg-slate-900/50 lg:border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                            <CardContent className="p-0 sm:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="john@acme.com"
                                            error={errors.email?.message}
                                            {...register('email')}
                                        />
                                        <p className="text-xs text-slate-400 px-1 font-medium flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" />
                                            Enter the email associated with your account
                                        </p>
                                    </div>

                                    <div className="pt-2 space-y-3">
                                        <Button
                                            type="submit"
                                            fullWidth
                                            size="lg"
                                            isLoading={isLoading}
                                            className="rounded-xl h-14 font-black text-base shadow-xl dark:shadow-none bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Send Reset Link
                                        </Button>

                                        <Link to="/login">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                fullWidth
                                                size="lg"
                                                className="rounded-xl h-12 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Back to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>

                            <CardFooter className="flex justify-center p-8 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Notice</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                                        For your protection, you'll only receive an email if your account exists.
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-center mb-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-success-100 dark:bg-success-900/30 text-success-600 mb-6"
                            >
                                <CheckCircle2 className="h-10 w-10" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Check Your Inbox</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Reset instructions are on the way</p>
                        </div>

                        <Card className="border-none shadow-none lg:shadow-xl lg:shadow-slate-200/50 dark:lg:shadow-none bg-transparent lg:bg-white dark:lg:bg-slate-900/50 lg:border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                            <CardContent className="p-8 sm:p-10">
                                <div className="space-y-6 text-center">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-3">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            We've sent a password reset link to:
                                        </p>
                                        <p className="text-lg font-black text-primary-600 dark:text-primary-400">
                                            {email}
                                        </p>
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">
                                                1
                                            </div>
                                            <p className="text-left font-medium">Check your email inbox (and spam folder)</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">
                                                2
                                            </div>
                                            <p className="text-left font-medium">Click the secure reset link we sent you</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">
                                                3
                                            </div>
                                            <p className="text-left font-medium">Create a new strong password for your account</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Link to="/login">
                                            <Button
                                                variant="outline"
                                                fullWidth
                                                size="lg"
                                                className="rounded-xl h-12 font-bold border-2"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Return to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ForgotPasswordPage;
