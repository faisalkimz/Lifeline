import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/api'; // We need to create this endpoint
import { setCredentials } from './authSlice';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle, Fingerprint, KeyRound, LogIn, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Validation Schema
const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    otp_code: z.string().length(6, 'Code must be 6 digits').optional(),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading, error }] = useLoginMutation();
    const [show2FA, setShow2FA] = React.useState(false);
    const [loginData, setLoginData] = React.useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            const result = await login(show2FA ? { ...loginData, otp_code: data.otp_code } : data).unwrap();

            if (result.two_factor_required) {
                setShow2FA(true);
                setLoginData(data);
                return;
            }

            dispatch(setCredentials({
                user: result.user,
                token: result.tokens.access,
                refresh: result.tokens.refresh
            }));
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (

        <div className="w-full animate-fade-in">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sign in</h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                    New to Lifeline?{' '}
                    <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-all">
                        Create an account
                    </Link>
                </p>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-6 p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-100 dark:border-error-900/20 flex items-start gap-3"
                    >
                        <ShieldAlert className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-error-700 dark:text-error-400 font-medium">
                            <p className="font-bold">Unable to sign in</p>
                            <p className="mt-0.5 opacity-90">{error?.data?.error || 'Invalid credentials provided.'}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                    {!show2FA ? (
                        <motion.div
                            key="login-fields"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-5"
                        >
                            <Input
                                label="Username or Email"
                                placeholder="name@company.com"
                                error={errors.username?.message}
                                {...register('username')}
                                className="bg-slate-50 dark:bg-slate-900/50"
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...register('password')}
                                    className="bg-slate-50 dark:bg-slate-900/50"
                                />
                                <div className="flex justify-end pt-1">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-fields"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 py-2"
                        >
                            <div className="space-y-2 mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    A verification code has been sent to your device. Enter it below to continue.
                                </p>
                            </div>

                            <Input
                                label="Security Code"
                                type="text"
                                placeholder="000000"
                                autoFocus
                                maxLength={6}
                                error={errors.otp_code?.message}
                                {...register('otp_code')}
                                className="text-center text-2xl tracking-[0.5em] font-black h-16 bg-slate-50 border-2"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        size="xl"
                        isLoading={isLoading}
                        className="rounded-xl font-bold text-base shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 dark:shadow-none bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all"
                    >
                        <span className="flex items-center gap-2">
                            {show2FA ? 'Verify & Sign In' : 'Sign In'}
                            {!isLoading && <LogIn className="h-5 w-5" />}
                        </span>
                    </Button>

                    {show2FA && (
                        <button
                            type="button"
                            onClick={() => setShow2FA(false)}
                            className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-4 mt-2 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
