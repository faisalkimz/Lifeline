import React from 'react';
import { Link } from 'react-router-dom';
import { useGetMyProfileQuery } from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Building2 } from 'lucide-react';

const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="h-10 w-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm text-primary-600 dark:text-primary-300 shrink-0">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value || 'N/A'}</p>
        </div>
    </div>
);

const MyProfilePage = () => {
    const { data: employee, isLoading, error } = useGetMyProfileQuery();

    // Construct image URL helper
    const getImageUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http')) return photoPath;

        if (photoPath.startsWith('/')) {
            return `${window.location.origin}${photoPath}`;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        if (baseUrl && baseUrl.startsWith('http')) {
            return `${baseUrl.replace(/\/$/, '')}/${photoPath.replace(/^\//, '')}`;
        }

        return photoPath;
    };

    // Fallback mock data for development/demo purposes
    const displayEmployee = employee || {
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        employee_number: 'EMP001',
        email: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        job_title: 'Software Engineer',
        department_name: 'Engineering',
        employment_status: 'active',
        join_date: '2024-01-15',
        address: '123 Main St, City, State 12345',
        national_id: '123-45-6789',
        bank_account_number: '****-****-****-1234'
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading your profile...</div>;
    }

    if (error) {
        const is404 = error?.status === 404;
        const is401 = error?.status === 401;

        return (
            <div className="max-w-2xl mx-auto mt-10">
                <Card className={`border-${is401 ? 'warning' : 'error'}-200 bg-${is401 ? 'warning' : 'error'}-50`}>
                    <CardContent className="p-6 text-center text-${is401 ? 'warning' : 'error'}-700">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">
                            {is401 ? 'Authentication Required' : 'Profile Not Found'}
                        </h3>
                        <p className="mt-2 text-sm">
                            {is401
                                ? 'Please log in to view your profile.'
                                : 'We couldn\'t find your employee profile. This might happen if:'
                            }
                        </p>
                        {!is401 && (
                            <ul className="mt-3 text-sm text-left list-disc list-inside space-y-1">
                                <li>You haven't been added as an employee yet</li>
                                <li>Your account is not properly linked to an employee record</li>
                                <li>There's a temporary issue with our servers</li>
                            </ul>
                        )}
                        <div className="mt-6 space-y-3">
                            {is401 ? (
                                <Link to="/login">
                                    <Button className="w-full">Go to Login</Button>
                                </Link>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.reload()}
                                        className="w-full"
                                    >
                                        Try Again
                                    </Button>
                                    <p className="text-xs text-gray-500">
                                        If this issue persists, please contact your HR administrator.
                                    </p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header Card */}
            <Card className="overflow-hidden">
                    <div className="h-32 bg-white relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                            {employee?.photo ? (
                                <img
                                    src={getImageUrl(employee.photo)}
                                    alt={employee.full_name}
                                    className="h-full w-full rounded-full object-cover bg-gray-100"
                                    onError={(e) => { e.target.style.display = 'none'; console.warn('Profile image failed to load:', e.target.src); }}
                                />
                            ) : (
                                <div className="h-full w-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pt-20 pb-6 px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{displayEmployee.full_name}</h1>
                            <p className="text-lg text-gray-500 font-medium">{displayEmployee.job_title}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${displayEmployee.employment_status === 'active'
                                        ? "bg-success-50 text-success-700 border border-success-200"
                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                    }`}>
                                    {displayEmployee.employment_status.toUpperCase()}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{displayEmployee.employee_number}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ProfileField icon={Mail} label="Email Address" value={displayEmployee.email} />
                        <ProfileField icon={Phone} label="Phone Number" value={displayEmployee.phone} />
                        <ProfileField icon={Calendar} label="Date of Birth" value={displayEmployee.date_of_birth} />
                        <ProfileField icon={MapPin} label="Address" value={`${displayEmployee.address || ''} ${displayEmployee.city ? ', ' + displayEmployee.city : ''}`} />
                    </CardContent>
                </Card>

                {/* Employment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ProfileField icon={Building2} label="Department" value={displayEmployee.department_name} />
                        <ProfileField icon={Briefcase} label="Employment Type" value={displayEmployee.employment_type?.replace('_', ' ')} />
                        <ProfileField icon={Calendar} label="Join Date" value={displayEmployee.join_date} />
                        <ProfileField icon={User} label="Manager" value={displayEmployee.manager_name || 'None'} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MyProfilePage;
