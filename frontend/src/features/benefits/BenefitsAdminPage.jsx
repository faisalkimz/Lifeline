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
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-12 pb-24"
        >
            {/* Global Admin Hero */}
            <div className="relative rounded-[4rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-none p-12 lg:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full -mt-96 -mr-96 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full -mb-96 -ml-96 blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                    <div className="flex-1 space-y-10 text-center xl:text-left">
                        <div className="space-y-4">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full">
                                Welfare Governance Command
                            </Badge>
                            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                                Admin <br />
                                <span className="text-emerald-500">Registry</span>
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                                <Command className="h-4 w-4 text-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">System Control: Elevated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
                <TabsList className="bg-slate-900/5 p-2 rounded-[2rem] w-full xl:w-max flex flex-wrap gap-2 backdrop-blur-md border border-white/10">
                    <TabsTrigger value="catalog" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all gap-3 italic">
                        <Gift className="h-4 w-4" /> Protocol Catalog
                    </TabsTrigger>
                    <TabsTrigger value="nssf" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all gap-3 italic">
                        <Shield className="h-4 w-4" /> NSSF Governance
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all gap-3 italic">
                        <HeartPulse className="h-4 w-4" /> Defense Panels
                    </TabsTrigger>
                    <TabsTrigger value="enrollments" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all gap-3 italic relative">
                        <Users className="h-4 w-4" /> Asset Roster
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white">2</span>
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TabsContent value="catalog">
                            <BenefitsCatalog />
                        </TabsContent>

                        <TabsContent value="nssf">
                            <NSSFManagement />
                        </TabsContent>

                        <TabsContent value="insurance">
                            <InsuranceManagement />
                        </TabsContent>

                        <TabsContent value="enrollments">
                            <BenefitsEnrollments />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </motion.div>
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
        { value: 'insurance', label: 'Shield (Insurance)', icon: ShieldCheck },
        { value: 'allowance', label: 'Flux (Allowance)', icon: DollarSign },
        { value: 'perk', label: 'E-Boost (Perk)', icon: Sparkles },
        { value: 'retirement', label: 'Anchor (Retirement)', icon: Anchor }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBenefitType(formData).unwrap();
            toast.success('Welfare Protocol Committed.');
            setShowForm(false);
            setFormData({ name: '', description: '', category: 'insurance', is_active: true, requires_enrollment: false });
        } catch (error) {
            toast.error('Commitment Failure: Data Integrity Violation.');
        }
    };

    const benefitList = Array.isArray(benefitTypes) ? benefitTypes : (benefitTypes?.results || []);

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Protocol <span className="text-emerald-500">Manifest</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized corporate welfare configurations</p>
                </div>
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button className="h-20 px-10 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl hover:bg-slate-800 transition-all gap-4 italic shrink-0">
                            <Plus className="h-5 w-5 text-emerald-500" /> INITIALIZE PROTOCOL
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl bg-white rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden">
                        <DialogHeader className="bg-slate-900 p-12">
                            <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                                Protocol <span className="text-emerald-500">Entry</span>
                            </DialogTitle>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic font-bold">Welfare System Definition Console</p>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Identifier (Name)</label>
                                    <Input
                                        className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 px-6"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Classification</label>
                                    <select
                                        className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none uppercase text-xs"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Strategic Context (Description)</label>
                                <textarea
                                    className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-medium min-h-[140px] focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 shadow-inner resize-none"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Define the scope and utility..."
                                />
                            </div>
                            <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="h-6 w-6 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol Active</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer border-l border-slate-200 pl-8">
                                    <input type="checkbox" className="h-6 w-6 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500" checked={formData.requires_enrollment} onChange={e => setFormData({ ...formData, requires_enrollment: e.target.checked })} />
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-[#f59e0b]">Requires Synchronization Approval</span>
                                </label>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <Button type="button" onClick={() => setShowForm(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase text-[10px]">ABORT</Button>
                                <Button type="submit" className="flex-1 h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl">
                                    ESTABLISH PROTOCOL
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-8">
                    <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
                    <p className="font-black text-slate-400 uppercase tracking-[0.5em] text-xs animate-pulse italic">Scanning Welfare Grid...</p>
                </div>
            ) : (
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {benefitList.map((benefit) => {
                        const category = categories.find(cat => cat.value === benefit.category) || categories[0];
                        const Icon = category.icon;
                        return (
                            <Card key={benefit.id} className="rounded-[3.5rem] border border-slate-50 bg-white shadow-xl overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500">
                                <CardContent className="p-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className={cn(
                                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all group-hover:rotate-12",
                                            benefit.category === 'insurance' ? 'bg-blue-100 text-blue-600' :
                                                benefit.category === 'allowance' ? 'bg-emerald-100 text-emerald-600' :
                                                    benefit.category === 'perk' ? 'bg-indigo-100 text-indigo-600' :
                                                        'bg-amber-100 text-amber-600'
                                        )}>
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic",
                                                benefit.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white')}>
                                                {benefit.is_active ? 'Energized' : 'Dormant'}
                                            </Badge>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">{benefit.category}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 truncate uppercase italic tracking-tighter group-hover:text-emerald-600 transition-colors leading-none">{benefit.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 mb-8 line-clamp-2 leading-relaxed opacity-60">{benefit.description || 'Global welfare module for personnel stabilization.'}</p>
                                    {benefit.requires_enrollment && (
                                        <div className="flex items-center gap-3 text-[10px] font-black text-amber-500 mb-8 uppercase italic border-l-2 border-amber-500 pl-4 py-1">
                                            <ShieldAlert className="h-4 w-4" /> REQ: SYNC APPROVAL
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="ghost" className="h-14 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 gap-3">
                                            <Edit className="h-4 w-4" /> REVISE
                                        </Button>
                                        <Button variant="ghost" className="h-14 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 gap-3">
                                            <Users className="h-4 w-4" /> ROSTER
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
        <div className="space-y-12">
            <div className="px-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">NSSF <span className="text-emerald-500">Security Node</span></h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure National Social Security Fund global constants</p>
            </div>

            <div className="grid gap-12 xl:grid-cols-2">
                <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden p-0">
                    <CardHeader className="bg-slate-900 p-12">
                        <CardTitle className="text-xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                            <Anchor className="h-6 w-6 text-emerald-500" /> Rate <span className="text-emerald-500">Configuration</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 space-y-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Personnel Extract (%)</label>
                                <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900" value={settings.employee_rate} onChange={e => setSettings({ ...settings, employee_rate: e.target.value })} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Corp Contribution (%)</label>
                                <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900" value={settings.employer_rate} onChange={e => setSettings({ ...settings, employer_rate: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Max Monthly Sync Cap (UGX)</label>
                            <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl font-black text-slate-900" value={settings.max_earnings} />
                        </div>
                        <div className="flex items-center gap-4 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                            <input type="checkbox" className="h-8 w-8 rounded-xl border-emerald-200 text-emerald-500 focus:ring-emerald-500" checked={settings.is_active} id="nssf-active" />
                            <label htmlFor="nssf-active" className="text-sm font-black text-emerald-900 uppercase tracking-widest italic">NSSF PROTOCOL ACTIVE IN SYSTEMS</label>
                        </div>
                        <Button className="w-full h-20 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl hover:bg-slate-800 transition-all italic">SAVE CONFIGURATION</Button>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-8">
                    <Card className="rounded-[3.5rem] border-none shadow-xl bg-slate-900 text-white p-12 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mt-32 -mr-32 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <Target className="h-12 w-12 text-emerald-400" />
                            <Badge className="bg-white/10 text-white border-white/10 text-[8px] font-black uppercase tracking-widest px-4 py-1 italic">REAL-TIME TELEMETRY</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2 text-center p-8 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Contributors</p>
                                <p className="text-4xl font-black text-white italic tracking-tighter">1,247</p>
                            </div>
                            <div className="space-y-2 text-center p-8 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Monthly Flux</p>
                                <p className="text-4xl font-black text-emerald-500 italic tracking-tighter">₵45.2M</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[3.5rem] border-none shadow-xl bg-white p-12 space-y-8">
                        <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">System <span className="text-emerald-500">Log</span></h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Sync Nodes</span>
                                <span className="text-xs font-black text-slate-900">+23 This Cycle</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Payload Sync</span>
                                <span className="text-xs font-black text-slate-900">₵36,200 / Unit</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const InsuranceManagement = () => (
    <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6">
            <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Defense <span className="text-emerald-500">Panels</span></h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise insurance policy orchestration</p>
            </div>
            <Button className="h-20 px-10 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl hover:bg-slate-800 transition-all gap-4 italic shrink-0">
                <Plus className="h-5 w-5 text-emerald-500" /> INITIALIZE DEFENSE
            </Button>
        </div>

        <div className="grid gap-8">
            {[1, 2].map((i) => (
                <Card key={i} className="rounded-[3.5rem] border border-slate-50 bg-white shadow-xl overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <CardContent className="p-12">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center text-emerald-500 shadow-2xl group-hover:rotate-6 transition-transform">
                                    <ShieldCheck className="h-10 w-10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{i === 1 ? 'Health Defense - Jubilee' : 'Life Shield - ICEA'}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{i === 1 ? 'Jubilee Multi-Carrier' : 'ICEA Secure Node'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-300 hover:text-slate-900 transition-colors"><Edit className="h-6 w-6" /></Button>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-300 hover:text-emerald-500 transition-colors"><Users className="h-6 w-6" /></Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Payload Tier</p>
                                <p className="text-lg font-black text-slate-900 italic">₵5M / Cycle</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Personnel Extract</p>
                                <p className="text-lg font-black text-rose-500 italic">₵{i === 1 ? '50,000' : '25,000'} /Mo</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Synced Assets</p>
                                <p className="text-lg font-black text-slate-900 italic">{i === 1 ? '234' : '189'} Units</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Grid Status</p>
                                <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic">Operational</Badge>
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
            <div className="px-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Asset <span className="text-emerald-500">Roster</span></h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic font-bold">Comprehensive personnel sync status and request audit</p>
            </div>

            {/* Tactical Request Queue */}
            <Card className="rounded-[3.5rem] border-none shadow-2xl bg-slate-50 p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mt-32 -mr-32"></div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-10 flex items-center gap-4">
                    <Activity className="h-6 w-6 text-amber-500 animate-pulse" /> Pending <span className="text-amber-500">Handshakes</span>
                </h3>
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col md:flex-row items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex items-center gap-6 mb-6 md:mb-0">
                                <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                                    <Users className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-slate-900 italic leading-none">{i === 1 ? 'Sarah Mirembe' : 'John Doe'}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Req: {i === 1 ? 'Health Defense' : 'Dental Component'} // 15 DEC</p>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button className="flex-1 h-14 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-500/20 gap-3 hover:bg-emerald-600 transition-all"><CheckCircle className="h-4 w-4" /> AUTHORIZE</Button>
                                <Button variant="ghost" className="flex-1 h-14 bg-slate-50 text-rose-500 font-black uppercase tracking-widest text-[10px] rounded-2xl gap-3 hover:bg-rose-50 transition-all"><XCircle className="h-4 w-4" /> DENY</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Global Registry Table */}
            <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 p-12">
                    <CardTitle className="text-xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                        <FileText className="h-6 w-6 text-emerald-500" /> Authorized <span className="text-emerald-500">Personnel Units</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-none">
                                <TableRow className="border-none">
                                    <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Asset Identity</TableHead>
                                    <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Module Protocol</TableHead>
                                    <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Sync Status</TableHead>
                                    <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Epoch Sync</TableHead>
                                    <TableHead className="px-12 h-16 font-black text-[10px] uppercase tracking-widest text-slate-400 italic text-right">Console</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="py-20 text-center"><Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" /></TableCell></TableRow>
                                ) : (enrollments?.results || enrollments || []).map((enrollment) => (
                                    <TableRow key={enrollment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-12 py-8 font-black text-slate-900 italic">{enrollment.employee_name}</TableCell>
                                        <TableCell className="px-12 py-8 font-bold text-slate-500 text-xs italic">{enrollment.benefit_name}</TableCell>
                                        <TableCell className="px-12 py-8">
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest italic px-4 py-1.5 rounded-full">Operational</Badge>
                                        </TableCell>
                                        <TableCell className="px-12 py-8 tabular-nums font-bold text-slate-400 text-xs">{new Date(enrollment.enrolled_date).toLocaleDateString()}</TableCell>
                                        <TableCell className="px-12 py-8 text-right">
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm text-slate-300 hover:text-slate-900"><Edit className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BenefitsAdminPage;
