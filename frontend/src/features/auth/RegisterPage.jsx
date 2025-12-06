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
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Validation Schema
const registerSchema = z.object({
    company_name: z.string().min(2, 'Company name is required'),
    company_email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password2: z.string().min(8, 'Confirm Password is required'),
}).refine((data) => data.password === data.password2, {
    message: "Passwords don't match",
    path: ["password2"],
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [registerUser, { isLoading, error }] = useRegisterMutation();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            const result = await registerUser(data).unwrap();
            dispatch(setCredentials({
                user: result.user,
                token: result.tokens.access
            }));
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    return (
        <div className="animate-fade-in py-8">
            <div className="text-center mb-8 lg:hidden">
                <h2 className="text-3xl font-bold text-gray-900">LahHR</h2>
                <p className="mt-2 text-gray-600">Start your free trial</p>
            </div>

            <Card className="border-none shadow-none bg-transparent lg:bg-white lg:border lg:shadow-sm max-w-2xl mx-auto">
                <CardHeader className="text-center lg:text-left px-0 lg:px-6">
                    <CardTitle className="text-2xl lg:text-3xl">Create your account</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Get started with LahHR for your company today.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-0 lg:px-6">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-error-700">
                                <p className="font-medium">Registration failed</p>
                                <p>{error?.data?.company_name || error?.data?.username || 'Please check your details and try again.'}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Company Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <Input
                                    label="Company Name"
                                    placeholder="Acme Inc."
                                    error={errors.company_name?.message}
                                    {...register('company_name')}
                                />
                                <Input
                                    label="Company Email"
                                    type="email"
                                    placeholder="contact@acme.com"
                                    error={errors.company_email?.message}
                                    {...register('company_email')}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 pt-2">Admin Account</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    error={errors.first_name?.message}
                                    {...register('first_name')}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    error={errors.last_name?.message}
                                    {...register('last_name')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Username"
                                    placeholder="johndoe"
                                    error={errors.username?.message}
                                    {...register('username')}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="john@acme.com"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
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
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center px-0 lg:px-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
