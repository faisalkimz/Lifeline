import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
    Building, Users, Shield, Bell, Lock,
    Mail, Globe, Phone, Save, UserPlus,
    MoreHorizontal, CheckCircle, XCircle, Clock,
    Layout, CreditCard, Key, Upload, MapPin, Briefcase, Activity, Zap, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {
    useGetUsersQuery,
    useGetCompanyQuery,
    useUpdateCompanyMutation,
    useGetEmployeesQuery
} from '../../store/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';




const SettingsPage = () => {
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();

    // Fetch data
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
                const fullLogoUrl = companyData.logo.startsWith('http')
                    ? companyData.logo
                    : `http://localhost:8000${companyData.logo}`;
                setLogoPreview(fullLogoUrl);
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

            toast.success('Organization profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error?.data?.error || 'Failed to update organization');
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

    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Control Center</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Enterprise configuration and governance dashboard.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="company" className="space-y-8">
                <TabsList className="bg-slate-50 p-1.5 w-full max-w-4xl grid grid-cols-4 rounded-2xl border border-slate-100 shadow-inner">
                    <TabsTrigger
                        value="company"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-500"
                    >
                        <Building className="h-4 w-4 mr-2" /> Organization
                    </TabsTrigger>
                    <TabsTrigger
                        value="automations"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-500"
                    >
                        <Zap className="h-4 w-4 mr-2" /> Orchestration
                    </TabsTrigger>
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-500"
                    >
                        <Users className="h-4 w-4 mr-2" /> Permissions
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-500"
                    >
                        <Lock className="h-4 w-4 mr-2" /> Security
                    </TabsTrigger>
                </TabsList>

                {/* Organization Tab */}
                <TabsContent value="company" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                                <CardHeader className="bg-slate-900 p-8 text-white">
                                    <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                        <Building className="h-5 w-5 text-primary-400" /> General Information
                                    </CardTitle>
                                    <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-tighter">Public profile for your organization</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Legal Entity Name</Label>
                                            <Input
                                                value={companyForm.name}
                                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                className="rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Core Industry</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                <select
                                                    className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                                                    value={companyForm.industry}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                                                >
                                                    <option value="">Select Sector</option>
                                                    <option value="fintech">Fintech & Finance</option>
                                                    <option value="technology">Information Technology</option>
                                                    <option value="manufacturing">Manufacturing</option>
                                                    <option value="healthcare">Healthcare</option>
                                                    <option value="retail">Retail & E-commerce</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Official Website</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={companyForm.website}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                    className="pl-11 rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white"
                                                    placeholder="https://company.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Headquarters Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={companyForm.email}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                                                    className="pl-11 rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white"
                                                    type="email"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Operational Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        value={companyForm.address}
                                                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                        className="pl-11 rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">City / Region</Label>
                                                <Input
                                                    value={companyForm.city}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                                                    className="rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Tax Identification Number (TIN)</Label>
                                            <Input
                                                value={companyForm.tax_id}
                                                onChange={(e) => setCompanyForm({ ...companyForm, tax_id: e.target.value })}
                                                placeholder="e.g. 1000123456"
                                                className="rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Registration Matrix (Reg No)</Label>
                                            <Input
                                                value={companyForm.registration_number}
                                                onChange={(e) => setCompanyForm({ ...companyForm, registration_number: e.target.value })}
                                                placeholder="e.g. 8002000123"
                                                className="rounded-2xl border-slate-100 bg-slate-50/50 h-12 font-bold focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Operation Currency</Label>
                                            <select
                                                className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none cursor-pointer"
                                                value={companyForm.currency}
                                                onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                                            >
                                                <option value="UGX">UGX (Uganda Shilling)</option>
                                                <option value="USD">USD (US Dollar)</option>
                                                <option value="KES">KES (Kenya Shilling)</option>
                                                <option value="EUR">EUR (Euro)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Temporal Date Format</Label>
                                            <select
                                                className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none cursor-pointer"
                                                value={companyForm.date_format}
                                                onChange={(e) => setCompanyForm({ ...companyForm, date_format: e.target.value })}
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-8 border-t border-slate-100">
                                        <Button onClick={handleUpdateCompany} disabled={isUpdating} className="rounded-2xl h-14 px-12 font-black uppercase tracking-widest bg-slate-900 shadow-2xl shadow-slate-900/20 text-xs">
                                            {isUpdating ? 'Synchronizing...' : 'Save Configuration'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-slate-900 text-white group">
                                <CardContent className="p-8">
                                    <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <Layout className="h-6 w-6 text-primary-400" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Ecosystem Branding</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-loose mb-10">
                                        Customize the graphical identity of your platform instance.
                                    </p>

                                    <div className="relative aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden group/logo">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-8" />
                                        ) : (
                                            <>
                                                <Upload className="h-10 w-10 text-slate-600 group-hover/logo:text-primary-400 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Select Asset</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleLogoChange}
                                            accept="image/*"
                                        />
                                        {logoPreview && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl">Replace Asset</Button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        SVG, PNG, or WEBP (Max 2MB)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 bg-blue-600 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Users className="h-24 w-24" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-80">Workspace Stats</h4>
                                    <p className="text-4xl font-black">{companyData?.employee_count || 0}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Active Personnel</p>
                                    <Button onClick={() => navigate('/employees')} variant="ghost" className="mt-8 p-0 text-white hover:bg-transparent h-auto font-black uppercase text-[10px] tracking-widest group">
                                        Manage Roster <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="automations" className="mt-0">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 p-8 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                            <Zap className="h-6 w-6 text-primary-400" /> Neural Orchestration Hub
                                        </CardTitle>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configure reactive system intelligence and triggers.</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                    <AutomationToggle
                                        title="Smart Onboarding Flow"
                                        description="Automatically transmit encrypted credentials and welcome artifacts to new hires."
                                        icon={<Mail className="h-5 w-5" />}
                                        enabled={companyForm.automated_onboarding_email}
                                        onChange={(val) => setCompanyForm({ ...companyForm, automated_onboarding_email: val })}
                                    />
                                    <AutomationToggle
                                        title="Disciplinary Vigilance"
                                        description="Real-time signaling to HR when a disciplinary case exceeds defined severity thresholds."
                                        icon={<Shield className="h-5 w-5" />}
                                        enabled={companyForm.disciplinary_alerts}
                                        onChange={(val) => setCompanyForm({ ...companyForm, disciplinary_alerts: val })}
                                    />
                                    <AutomationToggle
                                        title="Attendance Anomaly Detection"
                                        description="Instant notification of clock-in deviations or unauthorized IP access attempts."
                                        icon={<Activity className="h-5 w-5" />}
                                        enabled={companyForm.attendance_exceptions_alerts}
                                        onChange={(val) => setCompanyForm({ ...companyForm, attendance_exceptions_alerts: val })}
                                    />
                                    <AutomationToggle
                                        title="Strategic Leave Awareness"
                                        description="Synchronize team leadership when mission-critical staff request temporal departure."
                                        icon={<Bell className="h-5 w-5" />}
                                        enabled={companyForm.leave_request_notifications}
                                        onChange={(val) => setCompanyForm({ ...companyForm, leave_request_notifications: val })}
                                    />
                                </div>

                                <div className="flex justify-end pt-8 border-t border-slate-100">
                                    <Button onClick={handleUpdateCompany} disabled={isUpdating} className="rounded-2xl h-14 px-12 font-black uppercase tracking-widest bg-slate-900 shadow-2xl shadow-slate-900/20 text-xs">
                                        {isUpdating ? 'Synchronizing...' : 'Deploy Orchestration'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Access Governance Registry</CardTitle>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Audit log of system-authorized personas</p>
                            </div>
                            <Button onClick={() => navigate('/employees/new')} className="bg-slate-900 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] h-11">
                                <UserPlus className="h-3.5 w-3.5 mr-2" /> Add Persona
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Identity Descriptor</th>
                                            <th className="px-8 py-5">System Role</th>
                                            <th className="px-8 py-5">Auth Status</th>
                                            <th className="px-8 py-5">Telemetry</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {usersLoading ? (
                                            [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-20 bg-white"></tr>)
                                        ) : users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-200 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                            {u.first_name?.[0]}{u.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900 text-sm tracking-tight">{u.full_name || `${u.first_name} ${u.last_name}`}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border",
                                                        u.role === 'hr_manager' ? "bg-purple-100 text-purple-700 border-purple-200" :
                                                            u.role === 'manager' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                                "bg-slate-100 text-slate-600 border-slate-200"
                                                    )}>
                                                        {u.role?.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-2 w-2 rounded-full", u.is_active ? "bg-emerald-500" : "bg-slate-300")}></div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                                                            {u.is_active ? 'Nominal' : 'Revoked'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <span className="text-slate-900">{u.last_login ? new Date(u.last_login).toLocaleDateString('en-GB') : 'PENDING'}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-emerald-500" /> Security Protocol
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="flex items-center justify-between py-2">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-slate-900 tracking-wide">Multi-Factor Authentication</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global enforcement for all system users</p>
                                    </div>
                                    <div className="h-7 w-12 bg-slate-200 rounded-full relative cursor-pointer p-1">
                                        <div className="h-5 w-5 bg-white rounded-full shadow-md"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-slate-900 tracking-wide">Entropy Enforcement</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complex password requirements (12+ Chars)</p>
                                    </div>
                                    <div className="h-7 w-12 bg-emerald-500 rounded-full relative cursor-pointer p-1">
                                        <div className="h-5 w-5 bg-white rounded-full shadow-md ml-auto"></div>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full rounded-2xl h-14 text-xs font-black uppercase tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50">
                                    <Key className="h-4 w-4 mr-2" /> Global Credential Reset
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-slate-900 text-white relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
                            <CardHeader className="p-8 border-b border-white/5 relative z-10">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-300">Session Lifecycle</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-10 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Idle State Timeout</span>
                                        <span className="text-white">30 Minutes</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-loose text-center tracking-widest">
                                        Active sessions are automatically terminated after 30 minutes of inactivity to ensure regulatory safety compliance.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="billing" className="space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] p-16 text-center bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                        <div className="inline-flex p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8 transform hover:rotate-12 transition-transform duration-500">
                            <CreditCard className="h-10 w-10 text-slate-900" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Enterprise Nexus</h3>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.5em] mt-2 mb-12 flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" /> License Active
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Tier</p>
                                <p className="text-xl font-black text-slate-900 uppercase">Pro Elite</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renewal Date</p>
                                <p className="text-xl font-black text-slate-900 uppercase">12/01/2026</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                <p className="text-xl font-black text-slate-900 uppercase">500 Seats</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6">
                            <Button variant="outline" className="rounded-2xl h-14 px-10 font-black uppercase text-[10px] tracking-widest border-2 border-slate-100 hover:bg-slate-50">Billing History</Button>
                            <Button className="rounded-2xl h-14 px-12 font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white shadow-2xl shadow-slate-900/20">Upgrade Ecosystem</Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const AutomationToggle = ({ title, description, icon, enabled, onChange }) => (
    <div className="flex gap-6 group">
        <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500",
            enabled ? "bg-slate-900 text-white rotate-6 shadow-xl" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"
        )}>
            {icon}
        </div>
        <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-black text-slate-900 uppercase italic text-sm tracking-tight">{title}</h4>
                <button
                    onClick={() => onChange(!enabled)}
                    className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        enabled ? "bg-emerald-500" : "bg-slate-200"
                    )}
                >
                    <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                        enabled ? "right-1" : "left-1"
                    )} />
                </button>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed font-bold">{description}</p>
        </div>
    </div>
);

export default SettingsPage;
