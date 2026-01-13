import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import {
    Plus, Heart, DollarSign, Shield, Calendar,
    TrendingUp, Search, Edit, Trash2,
    HeartPulse, Umbrella, Car, Plane, Anchor, Sparkles, Check, Info, ArrowRight, Zap
} from 'lucide-react';
import {
    useGetBenefitTypesQuery,
    useGetEmployeeBenefitsQuery,
    useCreateEmployeeBenefitMutation,
    useDeleteEmployeeBenefitMutation,
    useCreateBenefitTypeMutation,
    useUpdateBenefitTypeMutation,
    useDeleteBenefitTypeMutation,
    useGetCurrentUserQuery
} from '../../store/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BenefitsPage = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data: benefitTypes, isLoading: typesLoading } = useGetBenefitTypesQuery();
    const { data: myBenefits, isLoading: myLoading } = useGetEmployeeBenefitsQuery({ my_benefits: true });

    // Admin mutations
    const [createBenefitType] = useCreateBenefitTypeMutation();
    const [updateBenefitType] = useUpdateBenefitTypeMutation();
    const [deleteBenefitType] = useDeleteBenefitTypeMutation();

    // Employee mutations
    const [enrollInBenefit] = useCreateEmployeeBenefitMutation();
    const [unenrollFromBenefit] = useDeleteEmployeeBenefitMutation();

    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditingType, setIsEditingType] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [viewingBenefit, setViewingBenefit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [typeForm, setTypeForm] = useState({
        name: '',
        description: '',
        category: 'health',
        cost: 0,
        employer_contribution: 0,
        is_active: true
    });

    const benefitTypesArray = useMemo(() => Array.isArray(benefitTypes) ? benefitTypes : (benefitTypes?.results || []), [benefitTypes]);
    const myBenefitsArray = useMemo(() => Array.isArray(myBenefits) ? myBenefits : (myBenefits?.results || []), [myBenefits]);

    const enrolledBenefitIds = useMemo(() =>
        myBenefitsArray.map(b => typeof b.benefit_type === 'object' ? b.benefit_type.id : b.benefit_type),
        [myBenefitsArray]);

    const availableBenefits = useMemo(() =>
        benefitTypesArray.filter(bt => !enrolledBenefitIds.includes(bt.id) && bt.is_active),
        [benefitTypesArray, enrolledBenefitIds]);

    const isAdmin = user?.role === 'admin' || user?.role === 'hr_manager';

    const handleCreateOrUpdateType = async (e) => {
        e.preventDefault();
        try {
            if (isEditingType) {
                await updateBenefitType({ id: selectedType.id, ...typeForm }).unwrap();
                toast.success('Benefit plan updated successfully.');
            } else {
                await createBenefitType(typeForm).unwrap();
                toast.success('New benefit plan created.');
            }
            setIsTypeDialogOpen(false);
            resetTypeForm();
        } catch (error) {
            toast.error('Failed to save benefit plan.');
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit plan? This action cannot be undone.')) {
            try {
                await deleteBenefitType(id).unwrap();
                toast.success('Benefit plan deleted.');
            } catch (error) {
                toast.error('Failed to delete plan. It may have active enrollments.');
            }
        }
    };

    const handleEnroll = async (benefitTypeId) => {
        try {
            await enrollInBenefit({
                benefit_type: benefitTypeId,
                employee: user.employee_id || user.id
            }).unwrap();
            toast.success('Enrollment submitted for approval.');
            if (isDetailsDialogOpen) setIsDetailsDialogOpen(false);
        } catch (error) {
            toast.error(error?.data?.error || 'Enrollment failed.');
        }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to cancel your coverage?')) {
            try {
                await unenrollFromBenefit(enrollmentId).unwrap();
                toast.success('Coverage cancelled.');
            } catch (error) {
                toast.error('Cancellation failed.');
            }
        }
    };

    const resetTypeForm = () => {
        setTypeForm({ name: '', description: '', category: 'health', cost: 0, employer_contribution: 0, is_active: true });
        setIsEditingType(false);
        setSelectedType(null);
    };

    const openDetails = (benefit, isEnrolled = false) => {
        setViewingBenefit({ ...benefit, isEnrolled });
        setIsDetailsDialogOpen(true);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'health': return HeartPulse;
            case 'insurance': return Shield;
            case 'retirement': return Anchor;
            case 'perk': return Sparkles;
            case 'transport': return Car;
            case 'vacation': return Plane;
            default: return Umbrella;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'health': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'insurance': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'retirement': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            case 'perk': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'transport': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'vacation': return 'text-sky-600 bg-sky-50 border-sky-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 pb-12 font-sans"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 uppercase tracking-widest text-[10px] font-black px-3 py-1">
                            Rewards & Perks
                        </Badge>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl font-black text-slate-900 tracking-tight">Benefits & Compensation</motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-500 mt-2 max-w-2xl font-medium">
                        Maximize your total rewards. Manage your health, wealth, and lifestyle benefits all in one place.
                    </motion.p>
                </div>
                {isAdmin && (
                    <motion.div variants={itemVariants}>
                        <Button
                            onClick={() => { resetTypeForm(); setIsTypeDialogOpen(true); }}
                            className="rounded-xl h-12 px-6 bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-105"
                        >
                            <Plus className="h-4 w-4 mr-2" /> New Benefit Plan
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* My Active Benefits */}
            <section className="space-y-6">
                <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Check className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Your Active Coverage</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Current Enrollments</p>
                        </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none rounded-lg px-3 py-1.5 font-bold">
                        {myBenefitsArray.length} Active Plans
                    </Badge>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {myBenefitsArray.length > 0 ? (
                            myBenefitsArray.map((benefit, idx) => (
                                <BenefitCard
                                    key={benefit.id}
                                    benefit={benefit}
                                    isEnrolled={true}
                                    onAction={() => handleUnenroll(benefit.id)}
                                    getIcon={getCategoryIcon}
                                    getColor={getCategoryColor}
                                    onClick={() => openDetails(benefit, true)}
                                    index={idx}
                                />
                            ))
                        ) : (
                            <motion.div
                                variants={itemVariants}
                                className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center"
                            >
                                <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                    <Umbrella className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Coverage</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                    You haven't enrolled in any benefit plans yet. Explore the available options below to get started.
                                </p>
                                <Button
                                    onClick={() => document.getElementById('available-benefits').scrollIntoView({ behavior: 'smooth' })}
                                    className="rounded-xl h-12 px-8 bg-slate-900 text-white font-bold hover:bg-slate-800"
                                >
                                    Explore Plans
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Available Benefits */}
            <section id="available-benefits" className="space-y-6 pt-10">
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Available Plans</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Explore & Enroll</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Find a plan (e.g. Health, Gym)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all shadow-sm"
                        />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {availableBenefits.length > 0 ? (
                        availableBenefits
                            .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((benefit, idx) => (
                                <BenefitCard
                                    key={benefit.id}
                                    benefit={benefit}
                                    isEnrolled={false}
                                    onAction={() => handleEnroll(benefit.id)}
                                    getIcon={getCategoryIcon}
                                    getColor={getCategoryColor}
                                    isAdmin={isAdmin}
                                    onEdit={() => {
                                        setSelectedType(benefit);
                                        setTypeForm({ ...benefit });
                                        setIsEditingType(true);
                                        setIsTypeDialogOpen(true);
                                    }}
                                    onDelete={() => handleDeleteType(benefit.id)}
                                    onClick={() => openDetails(benefit, false)}
                                    index={idx}
                                />
                            ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-slate-400 font-medium">No new plans available for enrollment at this time.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Plan Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                {viewingBenefit && (
                    <DialogContent className="max-w-2xl bg-white rounded-[2rem] p-0 overflow-hidden shadow-2xl border-none">
                        <div className={`h-40 ${getCategoryColor(viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.category : viewingBenefit.category).replace('text-', 'bg-').split(' ')[1]} relative overflow-hidden flex items-center justify-center`}>
                            <div className="absolute inset-0 bg-black/5" />
                            {React.createElement(getCategoryIcon(viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.category : viewingBenefit.category), { className: "h-32 w-32 text-black/10 absolute -bottom-8 -right-8 rotate-12" })}
                            <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center relative z-10">
                                {React.createElement(getCategoryIcon(viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.category : viewingBenefit.category), { className: "h-10 w-10 text-slate-800" })}
                            </div>
                        </div>

                        <div className="p-8 pt-4">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">
                                    {viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.name : viewingBenefit.name}
                                </h2>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                    {(viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.category : viewingBenefit.category).toUpperCase()}
                                </Badge>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Plan Details</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.description : viewingBenefit.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Employee Cost</p>
                                        <p className="text-2xl font-black text-slate-900">
                                            ${viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.cost : viewingBenefit.cost}
                                            <span className="text-sm text-slate-400 font-medium">/mo</span>
                                        </p>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Employer Match</p>
                                        <p className="text-2xl font-black text-emerald-600">
                                            {viewingBenefit.isEnrolled ? viewingBenefit.benefit_type.employer_contribution : viewingBenefit.employer_contribution}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsDetailsDialogOpen(false)} className="rounded-xl font-bold text-slate-500">
                                Close
                            </Button>
                            {!viewingBenefit.isEnrolled ? (
                                <Button onClick={() => handleEnroll(viewingBenefit.id)} className="bg-slate-900 text-white rounded-xl px-8 font-bold shadow-lg hover:bg-slate-800">
                                    Enroll Now
                                </Button>
                            ) : (
                                <Button onClick={() => { setIsDetailsDialogOpen(false); handleUnenroll(viewingBenefit.id); }} className="bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-xl px-8 font-bold">
                                    Cancel Coverage
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                )}
            </Dialog>

            {/* Edit/Create Dialog (Admin Only) */}
            <Dialog open={isTypeDialogOpen} onOpenChange={(open) => { if (!open) resetTypeForm(); setIsTypeDialogOpen(open); }}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
                        <DialogTitle className="text-2xl font-black text-slate-900">
                            {isEditingType ? 'Edit Benefit Plan' : 'Create Benefit Plan'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateOrUpdateType} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Plan Name</label>
                                <Input
                                    value={typeForm.name}
                                    onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                                    placeholder="e.g. Premium Health Plus"
                                    className="bg-white h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                                <select
                                    value={typeForm.category}
                                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value })}
                                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-900/5 outline-none"
                                >
                                    <option value="health">Health & Wellness</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="retirement">Retirement</option>
                                    <option value="perk">Perks & Lifestyle</option>
                                    <option value="transport">Transportation</option>
                                    <option value="vacation">Vacation</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                            <textarea
                                value={typeForm.description}
                                onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-slate-900/5 outline-none resize-none font-medium text-slate-600"
                                placeholder="What does this plan cover?"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Employee Cost ($/mo)</label>
                                <Input
                                    type="number"
                                    value={typeForm.cost}
                                    onChange={e => setTypeForm({ ...typeForm, cost: parseFloat(e.target.value) })}
                                    className="bg-white h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Employer Contribution (%)</label>
                                <Input
                                    type="number"
                                    value={typeForm.employer_contribution}
                                    onChange={e => setTypeForm({ ...typeForm, employer_contribution: parseFloat(e.target.value) })}
                                    className="bg-white h-11"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsTypeDialogOpen(false)} className="font-bold text-slate-500">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8 font-bold h-11">
                                {isEditingType ? 'Save Changes' : 'Create Plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

const BenefitCard = ({ benefit, isEnrolled, onAction, getIcon, getColor, isAdmin, onEdit, onDelete, onClick, index }) => {
    const data = isEnrolled ? (benefit.benefit_type || {}) : benefit;
    const Icon = getIcon(data.category);
    const colorClasses = getColor(data.category); // e.g., 'text-rose-600 bg-rose-50 border-rose-100'

    return (
        <motion.div
            layout
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative cursor-pointer h-full"
            onClick={onClick}
        >
            <Card className="rounded-[1.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 h-full flex flex-col overflow-hidden">
                <div className={`h-2 w-full ${colorClasses.split(' ')[1].replace('bg-', 'bg-gradient-to-r from-white to-')}`} />
                <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between space-y-0">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${colorClasses}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {isAdmin && !isEnrolled && (
                        <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 w-8 flex items-center justify-center hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 pt-4 flex-1 flex flex-col">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                {data.category}
                            </Badge>
                            {isEnrolled && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold uppercase tracking-wider">
                                    Active
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">{data.name}</h3>
                        <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                            {data.description}
                        </p>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 group-hover:bg-slate-50/80 transition-colors">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost</p>
                                <p className="text-lg font-black text-slate-900">${data.cost}<span className="text-xs font-bold text-slate-400">/mo</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comp</p>
                                <p className="text-lg font-black text-emerald-600">{data.employer_contribution}%</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl font-bold border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                            >
                                Details
                            </Button>
                            <Button
                                onClick={(e) => { e.stopPropagation(); onAction(); }}
                                className={`flex-1 rounded-xl font-bold transition-all shadow-none
                                    ${isEnrolled
                                        ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'}`}
                            >
                                {isEnrolled ? 'Cancel' : 'Enroll'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default BenefitsPage;
