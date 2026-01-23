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
    useSetup2FAQuery,
    useEnable2FAMutation,
    useDisable2FAMutation,
    useGetSecurityLogsQuery,
    useGetTaxSettingsQuery,
    useUpdateTaxSettingsMutation,
} from '../../store/api';
import toast from 'react-hot-toast';
import { Badge } from '../../components/ui/Badge';
import { getMediaUrl } from '../../config/api';
import { Fingerprint, Download, History, ShieldCheck, AlertTriangle, Landmark, Receipt, Info } from 'lucide-react';

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
                    <TabsTrigger value="security" className="data-[state=active]:bg-white">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="taxes" className="data-[state=active]:bg-white">
                        <Landmark className="h-4 w-4 mr-2" /> Tax Settings
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

                {/* Security Tab */}
                <TabsContent value="security">
                    <SecurityTab user={user} />
                </TabsContent>

                {/* Tax Settings Tab */}
                <TabsContent value="taxes">
                    <TaxSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const SecurityTab = ({ user }) => {
    const { data: setupData, refetch: refetchSetup } = useSetup2FAQuery();
    const { data: logs } = useGetSecurityLogsQuery();
    const [enable2FA, { isLoading: isEnabling }] = useEnable2FAMutation();
    const [otpCode, setOtpCode] = useState('');

    const handleEnable = async () => {
        try {
            await enable2FA({ code: otpCode }).unwrap();
            toast.success('Two-factor authentication enabled!');
            setOtpCode('');
            refetchSetup();
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to enable 2FA');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 space-y-6">
                {/* 2FA Card */}
                <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    Add an extra layer of security to your account. To sign in, you'll need to provide a 6-digit code from your authenticator app.
                                </p>

                                {user?.two_factor_enabled ? (
                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-900 text-sm">2FA is Enabled</p>
                                            <p className="text-xs text-emerald-600">Your account is protected with two-factor authentication.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                                {setupData?.qr_code && (
                                                    <img src={setupData.qr_code} alt="QR Code" className="h-32 w-32" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <h4 className="font-bold text-slate-900 text-sm">Step 1: Scan QR Code</h4>
                                                <p className="text-xs text-slate-500">Scan this code with Google Authenticator or Authy on your mobile device.</p>
                                                <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[10px] text-slate-400 break-all">
                                                    Secret: {setupData?.secret}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <h4 className="font-bold text-slate-900 text-sm">Step 2: Enter Verification Code</h4>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="000 000"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    maxLength={6}
                                                    className="text-center font-bold tracking-[0.3em] font-mono h-11"
                                                />
                                                <Button onClick={handleEnable} isLoading={isEnabling} className="font-bold">
                                                    Verify & Enable
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Logs */}
                <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <History className="h-4 w-4 text-slate-600" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-900">Recent Security Activity</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {logs?.map((log, i) => (
                                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {log.status === 'success' ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm capitalize">{log.action.replace('_', ' ')}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                <span>{log.ip}</span>
                                                <span>•</span>
                                                <span>{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={log.status === 'success' ? 'success' : 'destructive'} className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                        {log.status}
                                    </Badge>
                                </div>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400 text-sm font-medium">No recent security events found.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* GDPR Card */}
                <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Download className="h-4 w-4 text-orange-600" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-900">Privacy & GDPR</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 text-left space-y-6">
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">Download Personal Data</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                You can request a copy of all information stored about you in our systems at any time.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full font-bold h-11 hover:bg-slate-50 border-slate-200 text-slate-700"
                                onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || '/api'}/security/export_data/`, '_blank')}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export My Information
                            </Button>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">Deactivate Account</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                Temporarily hide your profile and access. This action can be undone by an administrator.
                            </p>
                            <Button variant="outline" className="w-full font-bold h-11 border-red-200 text-red-600 hover:bg-red-50">
                                <Lock className="h-4 w-4 mr-2" />
                                Deactivate Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Policy */}
                <Card className="bg-indigo-900 text-white overflow-hidden border-0 shadow-xl shadow-indigo-900/10">
                    <CardContent className="p-6">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Password Policy</h4>
                        <ul className="space-y-2 text-indigo-100 text-xs font-medium">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                                Minimum 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                                Must include symbols & numbers
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                                Change every 90 days recommended
                            </li>
                        </ul>
                        <Button className="w-full mt-6 bg-white text-indigo-900 hover:bg-indigo-50 font-bold border-0 h-11">
                            Change My Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const TaxSettingsTab = () => {
    const { data: taxSettings, isLoading } = useGetTaxSettingsQuery();
    const [updateTaxSettings, { isLoading: isUpdating }] = useUpdateTaxSettingsMutation();

    const [form, setForm] = useState({
        nssf_employee_rate: '5',
        nssf_employer_rate: '10',
        nssf_ceiling: '0',
        personal_relief: '240000',
        insurance_relief: '50000',
        pension_fund_relief: '200000',
        local_service_tax_rate: '5',
        local_service_tax_enabled: true
    });

    useEffect(() => {
        if (taxSettings) {
            setForm({
                nssf_employee_rate: taxSettings.nssf_employee_rate?.toString() || '5',
                nssf_employer_rate: taxSettings.nssf_employer_rate?.toString() || '10',
                nssf_ceiling: taxSettings.nssf_ceiling?.toString() || '0',
                personal_relief: taxSettings.personal_relief?.toString() || '240000',
                insurance_relief: taxSettings.insurance_relief?.toString() || '50000',
                pension_fund_relief: taxSettings.pension_fund_relief?.toString() || '200000',
                local_service_tax_rate: taxSettings.local_service_tax_rate?.toString() || '5',
                local_service_tax_enabled: taxSettings.local_service_tax_enabled !== false
            });
        }
    }, [taxSettings]);

    const handleSave = async () => {
        try {
            await updateTaxSettings({
                id: taxSettings.id,
                ...form,
                nssf_employee_rate: parseFloat(form.nssf_employee_rate),
                nssf_employer_rate: parseFloat(form.nssf_employer_rate),
                nssf_ceiling: parseFloat(form.nssf_ceiling),
                personal_relief: parseFloat(form.personal_relief),
                insurance_relief: parseFloat(form.insurance_relief),
                pension_fund_relief: parseFloat(form.pension_fund_relief),
                local_service_tax_rate: parseFloat(form.local_service_tax_rate)
            }).unwrap();
            toast.success('Tax settings updated successfully');
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to update tax settings');
        }
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading tax settings...</div>;

    return (
        <div className="max-w-5xl space-y-8 text-left animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border border-slate-200 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
                                    <Landmark className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Uganda Statutory Deductions</CardTitle>
                                    <p className="text-slate-500 text-sm font-medium">Standard rates for NSSF & PAYE Reliefs</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            {/* NSSF Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <Receipt className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-bold text-slate-800 text-lg">NSSF Contributions</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Employee Rate</Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                value={form.nssf_employee_rate}
                                                onChange={(e) => setForm({ ...form, nssf_employee_rate: e.target.value })}
                                                className="pl-4 pr-10 py-6 text-lg font-black bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold px-1">Uganda Standard: <span className="text-emerald-600">5.0%</span></p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Employer Rate</Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                value={form.nssf_employer_rate}
                                                onChange={(e) => setForm({ ...form, nssf_employer_rate: e.target.value })}
                                                className="pl-4 pr-10 py-6 text-lg font-black bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold px-1">Uganda Standard: <span className="text-emerald-600">10.0%</span></p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Ceiling</Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                value={form.nssf_ceiling}
                                                onChange={(e) => setForm({ ...form, nssf_ceiling: e.target.value })}
                                                className="pl-12 pr-4 py-6 text-lg font-black bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Shs</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold px-1">0 = <span className="text-slate-900">No Limit (Default)</span></p>
                                    </div>
                                </div>
                            </section>

                            {/* PAYE Reliefs Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-bold text-slate-800 text-lg">PAYE Tax Reliefs</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Relief</Label>
                                        <Input
                                            type="number"
                                            value={form.personal_relief}
                                            onChange={(e) => setForm({ ...form, personal_relief: e.target.value })}
                                            className="px-4 py-6 text-lg font-black bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Insurance Relief</Label>
                                        <Input
                                            type="number"
                                            value={form.insurance_relief}
                                            onChange={(e) => setForm({ ...form, insurance_relief: e.target.value })}
                                            className="px-4 py-6 text-lg font-black bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Pension Relief</Label>
                                        <Input
                                            type="number"
                                            value={form.pension_fund_relief}
                                            onChange={(e) => setForm({ ...form, pension_fund_relief: e.target.value })}
                                            className="px-4 py-6 text-lg font-black bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Local Service Tax */}
                            <section className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${form.local_service_tax_enabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <Landmark className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900">Local Service Tax (LST)</h4>
                                        <p className="text-xs text-slate-500 font-bold">Apply annual LST deductions to payroll</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="checkbox"
                                        id="lst_enabled"
                                        checked={form.local_service_tax_enabled}
                                        onChange={(e) => setForm({ ...form, local_service_tax_enabled: e.target.checked })}
                                        className="h-6 w-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                    />
                                    {form.local_service_tax_enabled && (
                                        <div className="w-24 animate-in zoom-in duration-300">
                                            <Input
                                                type="number"
                                                value={form.local_service_tax_rate}
                                                onChange={(e) => setForm({ ...form, local_service_tax_rate: e.target.value })}
                                                className="h-10 font-black border-slate-200 focus:border-blue-500 rounded-xl"
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="pt-8 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    className="px-10 py-7 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/20 active:scale-95 transition-all text-lg"
                                >
                                    <Save className="h-5 w-5 mr-3" />
                                    {isUpdating ? 'Applying Changes...' : 'Save Tax Profile'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Compliance Alert */}
                    <Card className="bg-indigo-950 text-white rounded-3xl border-0 shadow-2xl overflow-hidden group">
                        <CardContent className="p-8 relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                                <ShieldCheck className="h-32 w-32" />
                            </div>
                            <div className="relative space-y-6">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-xl tracking-tight">Compliance Memo</h4>
                                    <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                                        Updated statutory rates will apply to current processing period for <b>Unpaid</b> slips.
                                    </p>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        'PAYE Bracket: 2024 Schedule',
                                        'NSSF Ceiling: Customizable',
                                        'Audit Trail: Auto-enabled'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-300">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 rounded-3xl p-8 bg-slate-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="h-5 w-5 text-slate-400" />
                            <h4 className="font-bold text-slate-900">Need Guidance?</h4>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                            Refer to the <b>Uganda Revenue Authority (URA)</b> technical guide for the 2024/25 fiscal year if you are unsure about custom rates.
                        </p>
                        <Button variant="outline" className="w-full py-6 rounded-2xl font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all">
                            View URA Tax Guide
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
