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
        <div className="animate-fade-in-up py-8 sm:py-0 w-full max-w-[420px] mx-auto">
            <div className="text-center mb-10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-premium-lg mb-6"
                >
                    <Fingerprint className="h-10 w-10 text-primary-600" />
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Welcome Back</h2>
                <p className="text-gray-500 text-lg">Enter your workspace securely</p>
            </div>

            <Card className="border-none shadow-premium-xl bg-white/80 backdrop-blur-xl border border-white/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
                <CardContent className="p-8 sm:p-10">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-4 shadow-sm"
                            >
                                <div className="p-2 bg-red-100 rounded-lg shrink-0">
                                    <ShieldAlert className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="text-sm text-red-800">
                                    <p className="font-bold text-base mb-1">Access Denied</p>
                                    <p className="opacity-90 leading-relaxed text-red-700">{error?.data?.error || 'The credentials you provided are incorrect.'}</p>
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
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Input
                                            label="Username"
                                            placeholder="e.g. johndoe"
                                            className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                            error={errors.username?.message}
                                            {...register('username')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700">Password</label>
                                            <Link
                                                to="/forgot-password"
                                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-base"
                                            error={errors.password?.message}
                                            {...register('password')}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="otp-fields"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8 py-4"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="h-16 w-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                                <KeyRound className="h-8 w-8" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h3>
                                            <p className="text-sm text-gray-500 mt-2 max-w-[260px] mx-auto">
                                                Please enter the 6-digit code from your authenticator app.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block text-center">Security Code</label>
                                        <Input
                                            type="text"
                                            placeholder="000 000"
                                            autoFocus
                                            maxLength={6}
                                            error={errors.otp_code?.message}
                                            {...register('otp_code')}
                                            className="text-center text-3xl tracking-[0.5em] font-bold h-20 bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 rounded-2xl shadow-inner transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4 space-y-4">
                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isLoading}
                                className="h-14 text-base font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-500"
                            >
                                <span className="flex items-center gap-2">
                                    {show2FA ? 'Verify & Login' : 'Sign In'}
                                    {!isLoading && <LogIn className="h-5 w-5" />}
                                </span>
                            </Button>

                            {show2FA && (
                                <button
                                    type="button"
                                    onClick={() => setShow2FA(false)}
                                    className="w-full text-sm font-semibold text-gray-500 hover:text-gray-800 py-2 transition-colors flex items-center justify-center gap-2"
                                >
                                    Cancel verification
                                </button>
                            )}
                        </div>
                    </form>
                </CardContent>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                    <p className="text-center text-sm font-medium text-gray-600">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all">
                            Create an account
                        </Link>
                    </p>
                </div>
            </Card>

            <p className="text-center mt-8 text-xs font-medium text-gray-400">
                &copy; {new Date().getFullYear()} Lifeline HR. Secure Enterprise Portal.
            </p>
        </div>
    );
};

export default LoginPage;
