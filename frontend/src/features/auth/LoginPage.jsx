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
        <div className="animate-fade-in py-8 sm:py-0">
            <div className="text-center mb-10">
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4"
                >
                    <Fingerprint className="h-8 w-8" />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Security Checkpoint</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Access your enterprise workspace</p>
            </div>

            <Card className="border-none shadow-none lg:shadow-xl lg:shadow-slate-200/50 dark:lg:shadow-none bg-transparent lg:bg-white dark:lg:bg-slate-900/50 lg:border border-slate-100 dark:border-slate-800 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0 sm:p-8">
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
                                    <p className="font-bold">Access Denied</p>
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
                                        label="Identity ID"
                                        placeholder="johndoe"
                                        error={errors.username?.message}
                                        {...register('username')}
                                    />

                                    <div className="space-y-1">
                                        <Input
                                            label="Secret Key"
                                            type="password"
                                            placeholder="••••••••"
                                            error={errors.password?.message}
                                            {...register('password')}
                                        />
                                        <div className="flex justify-end pt-1">
                                            <Link
                                                to="/forgot-password"
                                                className="text-[11px] font-bold text-slate-400 hover:text-primary-600 uppercase tracking-wider transition-colors"
                                            >
                                                Recovery Mode?
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
                                    <div className="text-center space-y-2 mb-6">
                                        <div className="flex justify-center">
                                            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 mb-2">
                                                <KeyRound className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verify Identity</h3>
                                        <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                                            A 2FA signal was detected. Please provide your 6-digit authentication token.
                                        </p>
                                    </div>

                                    <Input
                                        label="Authorization Token"
                                        type="text"
                                        placeholder="000000"
                                        autoFocus
                                        maxLength={6}
                                        error={errors.otp_code?.message}
                                        {...register('otp_code')}
                                        className="text-center text-2xl tracking-[0.4em] font-black h-16 bg-slate-50 border-2"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isLoading}
                                className="rounded-xl h-14 font-black text-base shadow-xl dark:shadow-none bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    {show2FA ? 'Authorize Access' : 'Initialize Session'}
                                    {!isLoading && <LogIn className="h-5 w-5" />}
                                </span>
                            </Button>

                            {show2FA && (
                                <button
                                    type="button"
                                    onClick={() => setShow2FA(false)}
                                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest py-4 mt-2 transition-colors"
                                >
                                    Abort 2FA & Return
                                </button>
                            )}
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center p-8 border-t border-slate-50 dark:border-slate-800/50">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        New to the ecosystem?{' '}
                        <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                            Provision a Workspace
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
