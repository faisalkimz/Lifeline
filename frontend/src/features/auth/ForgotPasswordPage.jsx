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
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                                Enter your email to receive recovery instructions.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="john@acme.com"
                                    error={errors.email?.message}
                                    {...register('email')}
                                    className="bg-slate-50 dark:bg-slate-900/50"
                                />
                            </div>

                            <div className="pt-2 space-y-4">
                                <Button
                                    type="submit"
                                    fullWidth
                                    size="xl"
                                    isLoading={isLoading}
                                    className="rounded-xl font-bold text-base shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 dark:shadow-none bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                                >
                                    Send Instructions
                                </Button>

                                <Link to="/login" className="block">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        fullWidth
                                        size="lg"
                                        className="rounded-xl font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </form>
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
