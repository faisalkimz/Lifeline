import React, { useState } from 'react';
import {
    useGetBenefitTypesQuery,
    useGetEmployeeBenefitsQuery,
    useCreateEmployeeBenefitMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
    Shield, Heart, DollarSign, Gift,
    AlertCircle, CheckCircle, Clock, Plus,
    ArrowRight, Star, Sparkles, Umbrella,
    Stethoscope, Plane, Coffee, GraduationCap,
    Zap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const BenefitsPage = () => {
    return (
        <div className="space-y-10 pb-20 animate-fade-in font-sans">
            {/* High-End Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-px bg-primary-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Rewards</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase tracking-[0.05em]">Compensation & Perks</h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        A curated selection of insurance, wellness programs, and lifestyle benefits designed for your growth.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="available" className="space-y-10">
                <TabsList className="bg-slate-50 p-1.5 w-full max-w-lg grid grid-cols-2 rounded-2xl border border-slate-100 shadow-inner">
                    <TabsTrigger
                        value="available"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-slate-500"
                    >
                        <Zap className="h-4 w-4" /> Available Marketplace
                    </TabsTrigger>
                    <TabsTrigger
                        value="my-benefits"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-slate-500"
                    >
                        <Shield className="h-4 w-4" /> My Enrolled Assets
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-benefits" className="animate-slide-up">
                    <MyBenefitsList />
                </TabsContent>

                <TabsContent value="available" className="animate-slide-up">
                    <AvailableBenefitsList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const MyBenefitsList = () => {
    const { data: benefitsData, isLoading } = useGetEmployeeBenefitsQuery({ my_benefits: 'true' });
    const benefits = Array.isArray(benefitsData) ? benefitsData : (benefitsData?.results || []);

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-3xl animate-pulse border border-slate-100"></div>)}
        </div>
    );

    if (!benefits?.length) {
        return (
            <Card className="border-slate-200 border-dashed border-2 rounded-[2.5rem] bg-slate-50/50">
                <CardContent className="py-24 flex flex-col items-center text-center">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 mb-6 border border-slate-100">
                        <Umbrella className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Active Assets</h3>
                    <p className="text-slate-500 max-w-sm mt-3 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        You haven't activated any rewards yet. Browse the marketplace to secure your future.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(benefit => (
                <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
        </div>
    );
};

const BenefitCard = ({ benefit }) => {
    const categories = {
        'insurance': { icon: Stethoscope, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        'allowance': { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        'perk': { icon: Gift, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
        'wellness': { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
        'travel': { icon: Plane, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
        'lifestyle': { icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
        'education': { icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' }
    };

    const style = categories[benefit.benefit_category?.toLowerCase()] || categories['perk'];
    const Icon = style.icon;

    return (
        <Card className="border-slate-200 rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 bg-white">
            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-500", style.bg, style.color)}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="h-3 w-3" /> Active Asset
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified Enrollment</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase group-hover:text-primary-600 transition-colors">{benefit.benefit_name}</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1 line-clamp-2 opacity-70">{benefit.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Coverage</span>
                            <span className="text-sm font-black text-slate-900">{benefit.coverage_amount}</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Deduction</span>
                            <span className="text-sm font-black text-red-500">-{benefit.employee_contribution}</span>
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-2xl p-4 text-white flex justify-between items-center group-hover:bg-primary-600 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest">Co-Contribution</span>
                        <span className="text-sm font-black">+{benefit.employer_contribution}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const AvailableBenefitsList = () => {
    const { data: typesData, isLoading } = useGetBenefitTypesQuery();
    const [createEnrollment, { isLoading: isEnrolling }] = useCreateEmployeeBenefitMutation();
    const [selectedType, setSelectedType] = useState(null);
    const types = Array.isArray(typesData) ? typesData : (typesData?.results || []);

    const handleEnroll = async () => {
        if (!selectedType) return;

        try {
            await createEnrollment({
                benefit_type: selectedType.id,
                start_date: new Date().toISOString().split('T')[0],
                status: 'pending'
            }).unwrap();

            toast.success(`Deployment of ${selectedType.name} request logged!`);
            setSelectedType(null);
        } catch (error) {
            toast.error(error?.data?.error || "Failed to initiate enrollment.");
        }
    };

    if (isLoading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>)}
        </div>
    );

    if (!types?.length) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Marketplace currently offline</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {types.map(type => (
                <div key={type.id} className="group relative bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/10 group-hover:rotate-6 transition-transform">
                            <Gift className="h-10 w-10 text-primary-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest border border-primary-100">
                                Global Eligibility
                            </div>
                            <h4 className="font-black text-slate-900 text-2xl tracking-tight uppercase">{type.name}</h4>
                            <p className="text-[11px] font-bold text-slate-500 tracking-tight leading-relaxed max-w-md uppercase opacity-60">{type.description}</p>
                            <div className="flex gap-4 pt-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cap: {type.max_coverage_amount}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate: {type.default_employee_contribution}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setSelectedType(type)}
                        className="shrink-0 h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all group-hover:translate-y-[-4px]"
                    >
                        Initiate <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            ))}

            <Dialog open={!!selectedType} onOpenChange={(open) => !open && setSelectedType(null)}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 max-w-md">
                    <div className="bg-slate-900 h-32 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-transparent"></div>
                        <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Gift className="h-12 w-12 text-white opacity-20" />
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Benefit Activation</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                Proceeding will initiate a request for <span className="text-primary-600">{selectedType?.name}</span>. Enrollment is subject to administrative auditing.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Deduction Schedule</span>
                                    <span className="text-sm font-black text-slate-900">{selectedType?.default_employee_contribution}% Gross Pay</span>
                                </div>
                                <Clock className="h-6 w-6 text-slate-300" />
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col gap-3">
                            <Button
                                onClick={handleEnroll}
                                disabled={isEnrolling}
                                className="w-full h-14 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-slate-900/20"
                            >
                                {isEnrolling ? 'Processing...' : 'Authorize Enrollment'}
                            </Button>
                            <button
                                onClick={() => setSelectedType(null)}
                                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
                            >
                                Dismiss Request
                            </button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BenefitsPage;
