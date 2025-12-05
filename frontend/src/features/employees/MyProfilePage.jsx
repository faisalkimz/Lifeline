import React from 'react';
import { useGetMyProfileQuery } from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Building2 } from 'lucide-react';

const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-600 shrink-0">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</p>
        </div>
    </div>
);

const MyProfilePage = () => {
    const { data: employee, isLoading, error } = useGetMyProfileQuery();

    if (isLoading) {
        return <div className="p-8 text-center">Loading your profile...</div>;
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-10">
                <Card className="border-error-200 bg-error-50">
                    <CardContent className="p-6 text-center text-error-700">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Profile Not Found</h3>
                        <p className="mt-2 text-sm">
                            We couldn't find an employee record linked to your account.
                            Please contact HR to ensure your email address matches your employee record.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header Card */}
            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                            {employee.photo ? (
                                <img
                                    src={employee.photo}
                                    alt={employee.full_name}
                                    className="h-full w-full rounded-full object-cover bg-gray-100"
                                />
                            ) : (
                                <div className="h-full w-full rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pt-20 pb-6 px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
                            <p className="text-lg text-gray-500 font-medium">{employee.job_title}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.employment_status === 'active'
                                        ? "bg-success-50 text-success-700 border border-success-200"
                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                    }`}>
                                    {employee.employment_status.toUpperCase()}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{employee.employee_number}</span>
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
                        <ProfileField icon={Mail} label="Email Address" value={employee.email} />
                        <ProfileField icon={Phone} label="Phone Number" value={employee.phone} />
                        <ProfileField icon={Calendar} label="Date of Birth" value={employee.date_of_birth} />
                        <ProfileField icon={MapPin} label="Address" value={`${employee.address || ''} ${employee.city ? ', ' + employee.city : ''}`} />
                    </CardContent>
                </Card>

                {/* Employment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ProfileField icon={Building2} label="Department" value={employee.department_name} />
                        <ProfileField icon={Briefcase} label="Employment Type" value={employee.employment_type?.replace('_', ' ')} />
                        <ProfileField icon={Calendar} label="Join Date" value={employee.join_date} />
                        <ProfileField icon={User} label="Manager" value={employee.manager ? 'Assigned' : 'None'} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MyProfilePage;
