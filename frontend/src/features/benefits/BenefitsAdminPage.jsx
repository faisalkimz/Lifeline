import React, { useState, useMemo } from 'react';
import {
    useGetBenefitTypesQuery,
    useCreateBenefitTypeMutation,
    useUpdateBenefitTypeMutation,
    useGetEmployeeBenefitsQuery,
    useCreateEmployeeBenefitMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
    Plus, Shield, Heart, DollarSign, Gift, Users,
    Edit, Trash2, CheckCircle, XCircle, FileText, Settings,
    Activity, ShieldCheck, Zap, TrendingUp, Filter, Loader2,
    ArrowUpRight, Search, Target, Anchor, Sparkles, HeartPulse,
    ShieldAlert, Command, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const BenefitsAdminPage = () => {
    const [activeTab, setActiveTab] = useState('catalog');

    return (
        <div className="space-y-10 pb-20">
            {/* Professional Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Benefits Administration</h1>
                <p className="text-slate-500 mt-2">Manage your company's benefit catalog, statutory contributions, and employee enrollments.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100 p-1 rounded-xl w-max flex gap-1 border border-slate-200">
                    <TabsTrigger value="catalog" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 font-semibold text-sm text-slate-600 transition-all gap-2">
                        <Gift className="h-4 w-4" /> Benefit types
                    </TabsTrigger>
                    <TabsTrigger value="nssf" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 font-semibold text-sm text-slate-600 transition-all gap-2">
                        <Shield className="h-4 w-4" /> NSSF & Statutory
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 font-semibold text-sm text-slate-600 transition-all gap-2">
                        <HeartPulse className="h-4 w-4" /> Insurance policies
                    </TabsTrigger>
                    <TabsTrigger value="enrollments" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 font-semibold text-sm text-slate-600 transition-all gap-2">
                        <Users className="h-4 w-4" /> Active enrollments
                    </TabsTrigger>
                </TabsList>

                <div className="pt-2">
                    {activeTab === 'catalog' && <BenefitsCatalog />}
                    {activeTab === 'nssf' && <NSSFManagement />}
                    {activeTab === 'insurance' && <InsuranceManagement />}
                    {activeTab === 'enrollments' && <BenefitsEnrollments />}
                </div>
            </Tabs>
        </div>
    );
};

const BenefitsCatalog = () => {
    const { data: benefitTypes, isLoading } = useGetBenefitTypesQuery();
    const [createBenefitType] = useCreateBenefitTypeMutation();
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '', description: '', category: 'insurance', is_active: true, requires_enrollment: false
    });

    const categories = [
        { value: 'insurance', label: 'Insurance', icon: ShieldCheck },
        { value: 'allowance', label: 'Allowance', icon: DollarSign },
        { value: 'perk', label: 'Perk', icon: Sparkles },
        { value: 'retirement', label: 'Retirement', icon: Anchor }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBenefitType(formData).unwrap();
            toast.success('Benefit created successfully');
            setShowForm(false);
            setFormData({ name: '', description: '', category: 'insurance', is_active: true, requires_enrollment: false });
        } catch (error) {
            toast.error('Failed to create benefit');
        }
    };

    const benefitList = Array.isArray(benefitTypes) ? benefitTypes : (benefitTypes?.results || []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Benefit types</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage the types of benefits available to your employees.</p>
                </div>
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-6 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all gap-2">
                            <Plus className="h-4 w-4" /> Add benefit type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden shadow-2xl">
                        <div className="bg-white px-8 pt-8 pb-4">
                            <DialogTitle className="text-2xl font-semibold text-slate-900">New benefit type</DialogTitle>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                Create a new category of benefits that can be assigned to employees.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Benefit name</label>
                                    <Input
                                        className="h-11 rounded-xl border-slate-200 focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                        placeholder="e.g. Health Insurance"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Category</label>
                                    <select
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    className="w-full p-4 border border-slate-200 rounded-xl font-medium min-h-[120px] focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-600 text-sm resize-none"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Explain what this benefit covers..."
                                />
                            </div>
                            <div className="space-y-4 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Active and available</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" checked={formData.requires_enrollment} onChange={e => setFormData({ ...formData, requires_enrollment: e.target.checked })} />
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Requires manual enrollment approval</span>
                                </label>
                            </div>
                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-50">
                                <Button type="button" onClick={() => setShowForm(false)} variant="ghost" className="h-11 px-6 rounded-lg font-semibold text-slate-600 hover:bg-slate-50">Cancel</Button>
                                <Button type="submit" className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm">
                                    Create benefit
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                    <p className="text-sm text-slate-500 mt-4">Loading benefits...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {benefitList.map((benefit) => {
                        const category = categories.find(cat => cat.value === benefit.category) || categories[0];
                        const Icon = category.icon;
                        return (
                            <Card key={benefit.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center",
                                            benefit.category === 'insurance' ? 'bg-blue-50 text-blue-600' :
                                                benefit.category === 'allowance' ? 'bg-emerald-50 text-emerald-600' :
                                                    benefit.category === 'perk' ? 'bg-indigo-50 text-indigo-600' :
                                                        'bg-amber-50 text-amber-600'
                                        )}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                                            benefit.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100')}>
                                            {benefit.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{benefit.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
                                        {benefit.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                                        <Button variant="ghost" size="sm" className="flex-1 h-9 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 gap-2">
                                            <Edit className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 h-9 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 gap-2">
                                            <Users className="h-3.5 w-3.5" /> Enrollees
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const NSSFManagement = () => {
    const [settings, setSettings] = useState({ employee_rate: 5, employer_rate: 10, max_earnings: 400000, is_active: true });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-900">NSSF & Statutory contributions</h2>
                <p className="text-sm text-slate-500 mt-1">Configure contribution rates and monthly earnings caps for NSSF.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 px-8 py-6">
                        <CardTitle className="text-base font-semibold text-slate-900">Contribution settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Employee contribution (%)</label>
                                <Input type="number" className="h-11 rounded-xl border-slate-200" value={settings.employee_rate} onChange={e => setSettings({ ...settings, employee_rate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Employer contribution (%)</label>
                                <Input type="number" className="h-11 rounded-xl border-slate-200" value={settings.employer_rate} onChange={e => setSettings({ ...settings, employer_rate: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Maximum monthly earnings (UGX)</label>
                            <Input type="number" className="h-11 rounded-xl border-slate-200" value={settings.max_earnings} />
                            <p className="text-[11px] text-slate-400">The maximum gross pay at which NSSF contributions are calculated.</p>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" checked={settings.is_active} id="nssf-active" />
                            <label htmlFor="nssf-active" className="text-sm font-medium text-slate-700">Enable NSSF calculation in payroll</label>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm">Save configuration</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-8">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Quick Overview</p>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-slate-400">Total contributors</p>
                                <p className="text-3xl font-bold mt-1 tracking-tight">1,247</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Monthly total (Est.)</p>
                                <p className="text-3xl font-bold mt-1 tracking-tight text-emerald-400">45,200,000 <span className="text-xs font-medium text-slate-500 ml-1">UGX</span></p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200 bg-white p-8">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">Recent activity</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">New enrollments</span>
                                <span className="font-semibold text-slate-900">+23 this month</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Average per person</span>
                                <span className="font-semibold text-slate-900">36,200 UGX</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const InsuranceManagement = () => (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Insurance policies</h2>
                <p className="text-sm text-slate-500 mt-1">Manage and track company-provided insurance for your team.</p>
            </div>
            <Button className="h-11 px-6 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all gap-2">
                <Plus className="h-4 w-4" /> Add policy
            </Button>
        </div>

        <div className="grid gap-6">
            {[1, 2].map((i) => (
                <Card key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-500">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{i === 1 ? 'Health Insurance - Jubilee' : 'Life Insurance - ICEA'}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{i === 1 ? 'Comprehensive medical cover' : 'Group life assurance'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900"><Users className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Monthly</p>
                                <p className="text-lg font-bold text-slate-900">5,000,000 UGX</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employee Part</p>
                                <p className="text-lg font-bold text-rose-600">{i === 1 ? '50,000' : '25,000'} UGX</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Members</p>
                                <p className="text-lg font-bold text-slate-900">{i === 1 ? '234' : '189'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1 rounded-full">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

const BenefitsEnrollments = () => {
    const { data: enrollments, isLoading } = useGetEmployeeBenefitsQuery({});

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Enrollment management</h2>
                <p className="text-sm text-slate-500 mt-1">Review pending benefit requests and manage active employee enrollments.</p>
            </div>

            {/* Pending Approvals */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-500" /> Pending approvals
                </h3>
                <div className="grid gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{i === 1 ? 'Sarah Mirembe' : 'John Doe'}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Requested {i === 1 ? 'Health Insurance' : 'Dental Benefit'} • 15 Dec</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button className="flex-1 h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm gap-2">
                                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button variant="ghost" className="flex-1 h-10 px-6 text-rose-600 font-semibold text-xs rounded-lg hover:bg-rose-50 gap-2">
                                    <XCircle className="h-3.5 w-3.5" /> Decline
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Enrollments Table */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 px-8 py-6">
                    <CardTitle className="text-base font-semibold text-slate-900">Active enrollments</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="px-8 h-12 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</TableHead>
                                    <TableHead className="px-8 h-12 text-xs font-bold text-slate-500 uppercase tracking-wider">Benefit</TableHead>
                                    <TableHead className="px-8 h-12 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="px-8 h-12 text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Date</TableHead>
                                    <TableHead className="px-8 h-12 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 text-slate-400 animate-spin mx-auto" /></TableCell></TableRow>
                                ) : (enrollments?.results || enrollments || []).map((enrollment) => (
                                    <TableRow key={enrollment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-8 py-6 font-semibold text-slate-900">{enrollment.employee_name}</TableCell>
                                        <TableCell className="px-8 py-6 text-sm text-slate-600">{enrollment.benefit_name}</TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Active</Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 tabular-nums text-sm text-slate-500">{new Date(enrollment.enrolled_date).toLocaleDateString()}</TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900"><Edit className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!isLoading && (!enrollments || enrollments.length === 0)) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                                            No active enrollments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BenefitsAdminPage;
