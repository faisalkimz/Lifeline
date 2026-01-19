import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
    Building, Users, Shield, Bell, Lock,
    Mail, Globe, Phone, Save, UserPlus,
    Zap, Calendar, Video, Cloud
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {
    useGetUsersQuery,
    useGetCompanyQuery,
    useUpdateCompanyMutation,
    useGetIntegrationStatusQuery,
} from '../../store/api';
import toast from 'react-hot-toast';
import { Badge } from '../../components/ui/Badge';
import { getMediaUrl } from '../../config/api';

const SettingsPage = () => {
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();

    const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
    const { data: companyData, isLoading: companyLoading } = useGetCompanyQuery(user?.company);
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

    const users = Array.isArray(usersData) ? usersData : (usersData?.results || []);

    const [companyForm, setCompanyForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'UG',
        website: '',
        industry: '',
        tax_id: '',
        registration_number: '',
        currency: 'UGX',
        date_format: 'DD/MM/YYYY',
        automated_onboarding_email: true,
        disciplinary_alerts: true,
        leave_request_notifications: true,
        attendance_exceptions_alerts: true
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (companyData) {
            setCompanyForm({
                name: companyData.name || '',
                email: companyData.email || '',
                phone: companyData.phone || '',
                address: companyData.address || '',
                city: companyData.city || '',
                country: companyData.country || 'UG',
                website: companyData.website || '',
                industry: companyData.industry || '',
                tax_id: companyData.tax_id || '',
                registration_number: companyData.registration_number || '',
                currency: companyData.currency || 'UGX',
                date_format: companyData.date_format || 'DD/MM/YYYY',
                automated_onboarding_email: companyData.automated_onboarding_email !== false,
                disciplinary_alerts: companyData.disciplinary_alerts !== false,
                leave_request_notifications: companyData.leave_request_notifications !== false,
                attendance_exceptions_alerts: companyData.attendance_exceptions_alerts !== false
            });
            if (companyData.logo) {
                setLogoPreview(getMediaUrl(companyData.logo));
            }
        }
    }, [companyData]);

    const handleUpdateCompany = async () => {
        try {
            const formData = new FormData();
            Object.keys(companyForm).forEach(key => {
                formData.append(key, companyForm[key]);
            });

            if (logo) {
                formData.append('logo', logo);
            }

            await updateCompany({
                id: user.company,
                formData
            }).unwrap();

            toast.success('Company updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error?.data?.error || 'Failed to update company');
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const { data: integrationStatus } = useGetIntegrationStatusQuery();

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
                <p className="text-gray-600 mt-1">Manage your company information and preferences</p>
            </div>

            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="company" className="data-[state=active]:bg-white">
                        <Building className="h-4 w-4 mr-2" /> Company
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
                        <Bell className="h-4 w-4 mr-2" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-white">
                        <Users className="h-4 w-4 mr-2" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="data-[state=active]:bg-white">
                        <Zap className="h-4 w-4 mr-2" /> Integrations
                    </TabsTrigger>
                </TabsList>

                {/* Company Tab */}
                <TabsContent value="company">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card className="border border-gray-200">
                                <CardHeader className="border-b border-gray-100">
                                    <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                                            <Input
                                                value={companyForm.name}
                                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Industry</Label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500"
                                                value={companyForm.industry}
                                                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                                            >
                                                <option value="">Select...</option>
                                                <option value="fintech">Fintech</option>
                                                <option value="technology">Technology</option>
                                                <option value="manufacturing">Manufacturing</option>
                                                <option value="healthcare">Healthcare</option>
                                                <option value="retail">Retail</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                                            <Input
                                                type="email"
                                                value={companyForm.email}
                                                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Phone</Label>
                                            <Input
                                                value={companyForm.phone}
                                                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Website</Label>
                                        <Input
                                            value={companyForm.website}
                                            onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                                            className="mt-1"
                                            placeholder="https://company.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Address</Label>
                                            <Input
                                                value={companyForm.address}
                                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">City</Label>
                                            <Input
                                                value={companyForm.city}
                                                onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Tax ID</Label>
                                            <Input
                                                value={companyForm.tax_id}
                                                onChange={(e) => setCompanyForm({ ...companyForm, tax_id: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Registration Number</Label>
                                            <Input
                                                value={companyForm.registration_number}
                                                onChange={(e) => setCompanyForm({ ...companyForm, registration_number: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Currency</Label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500"
                                                value={companyForm.currency}
                                                onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                                            >
                                                <option value="UGX">UGX</option>
                                                <option value="USD">USD</option>
                                                <option value="KES">KES</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Date Format</Label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500"
                                                value={companyForm.date_format}
                                                onChange={(e) => setCompanyForm({ ...companyForm, date_format: e.target.value })}
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button onClick={handleUpdateCompany} disabled={isUpdating}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border border-gray-200">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Company Logo</h3>
                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <span className="text-gray-400 text-sm">No logo uploaded</span>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleLogoChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2 text-center">Click to upload logo</p>
                                </CardContent>
                            </Card>

                            <Card className="border border-gray-200">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Employees</h3>
                                    <p className="text-3xl font-bold text-gray-900">{companyData?.employee_count || 0}</p>
                                    <Button onClick={() => navigate('/employees')} variant="outline" className="w-full mt-4" size="sm">
                                        Manage Employees
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Onboarding Emails</p>
                                    <p className="text-sm text-gray-600">Send welcome emails to new employees</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded"
                                    checked={companyForm.automated_onboarding_email}
                                    onChange={(e) => setCompanyForm({ ...companyForm, automated_onboarding_email: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Disciplinary Alerts</p>
                                    <p className="text-sm text-gray-600">Notify HR about disciplinary cases</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded"
                                    checked={companyForm.disciplinary_alerts}
                                    onChange={(e) => setCompanyForm({ ...companyForm, disciplinary_alerts: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Leave Notifications</p>
                                    <p className="text-sm text-gray-600">Notify managers about leave requests</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded"
                                    checked={companyForm.leave_request_notifications}
                                    onChange={(e) => setCompanyForm({ ...companyForm, leave_request_notifications: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Attendance Alerts</p>
                                    <p className="text-sm text-gray-600">Notify about attendance exceptions</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded"
                                    checked={companyForm.attendance_exceptions_alerts}
                                    onChange={(e) => setCompanyForm({ ...companyForm, attendance_exceptions_alerts: e.target.checked })}
                                />
                            </div>
                            <div className="pt-4">
                                <Button onClick={handleUpdateCompany} disabled={isUpdating}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isUpdating ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold">System Users</CardTitle>
                            <Button onClick={() => navigate('/employees/new')}>
                                <UserPlus className="h-4 w-4 mr-2" /> Add User
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr className="text-left">
                                            <th className="px-6 py-3 text-xs font-medium text-gray-600">Name</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-600">Role</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-600">Status</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-600">Last Login</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {usersLoading ? (
                                            [1, 2, 3].map(i => <tr key={i} className="h-16 bg-gray-50 animate-pulse"></tr>)
                                        ) : users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{u.full_name || `${u.first_name} ${u.last_name}`}</div>
                                                        <div className="text-sm text-gray-600">{u.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`
                                                        ${u.role === 'hr_manager' ? 'bg-purple-100 text-purple-700' : ''}
                                                        ${u.role === 'manager' ? 'bg-blue-100 text-blue-700' : ''}
                                                        ${u.role === 'employee' ? 'bg-gray-100 text-gray-700' : ''}
                                                        border-0
                                                    `}>
                                                        {u.role?.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-2 text-sm ${u.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                        <span className={`h-2 w-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-100 p-8">
                            <div className="flex justify-between items-center text-left">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Connected Applications</CardTitle>
                                    <p className="text-slate-500 mt-1 text-sm">Sync Lifeline with external tools like Google Calendar, Zoom, and AWS.</p>
                                </div>
                                <Button
                                    onClick={() => navigate('/recruitment/integrations')}
                                    className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg shadow-slate-900/10"
                                >
                                    <Globe className="h-4 w-4" />
                                    Manage Connections
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { id: 'microsoft_outlook', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { id: 'zoom', name: 'Zoom Meetings', icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                    { id: 'aws_s3', name: 'AWS S3 Storage', icon: Cloud, color: 'text-amber-500', bg: 'bg-amber-50' }
                                ].map((int, i) => {
                                    const isConnected = integrationStatus?.[int.id]?.connected;
                                    return (
                                        <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group ${isConnected ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-100 text-emerald-600' : `${int.bg} ${int.color}`}`}>
                                                <int.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{int.name}</p>
                                                <p className={`text-[11px] font-bold uppercase tracking-wider ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {isConnected ? 'Connected' : 'Ready to sync'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-6">
                                <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Shield className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-900">Enterprise Security</h4>
                                    <p className="text-sm text-slate-500">All external connections use secure OAuth 2.0 and industry-standard encryption for data in transit.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
