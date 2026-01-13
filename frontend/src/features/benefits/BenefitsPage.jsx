import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
    Plus, Heart, DollarSign, Shield, Calendar,
    TrendingUp, Search, Edit, Trash2,
    HeartPulse, Umbrella, Car, Plane, Anchor, Sparkles, Check, Info
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
    const [isEditingType, setIsEditingType] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
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
            case 'health': return 'text-rose-600 bg-rose-50';
            case 'insurance': return 'text-blue-600 bg-blue-50';
            case 'retirement': return 'text-indigo-600 bg-indigo-50';
            case 'perk': return 'text-amber-600 bg-amber-50';
            case 'transport': return 'text-emerald-600 bg-emerald-50';
            case 'vacation': return 'text-sky-600 bg-sky-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Benefits & Compensation</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Manage your health, wealth, and lifestyle benefits. Review your current coverage and explore new options.
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => { resetTypeForm(); setIsTypeDialogOpen(true); }}
                        className="rounded-xl h-11 bg-slate-900 text-white font-medium shadow-lg shadow-slate-900/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Benefit Plan
                    </Button>
                )}
            </div>

            {/* My Active Benefits */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Your Active Coverage</h2>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none rounded-lg px-2.5 py-1">
                        {myBenefitsArray.length} Active
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {myBenefitsArray.length > 0 ? (
                            myBenefitsArray.map((benefit) => (
                                <BenefitCard
                                    key={benefit.id}
                                    benefit={benefit}
                                    isEnrolled={true}
                                    onAction={() => handleUnenroll(benefit.id)}
                                    getIcon={getCategoryIcon}
                                    getColor={getCategoryColor}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <Umbrella className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="font-medium text-slate-600">No active benefits found</p>
                                <p className="text-sm text-slate-400 mt-1">Explore available plans below to get started.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Available Benefits */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Available Plans</h2>
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search plans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {availableBenefits
                        .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((benefit) => (
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
                            />
                        ))}
                </div>
            </section>

            {/* Edit/Create Dialog */}
            <Dialog open={isTypeDialogOpen} onOpenChange={(open) => { if (!open) resetTypeForm(); setIsTypeDialogOpen(open); }}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                            {isEditingType ? 'Edit Benefit Plan' : 'Create Benefit Plan'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateOrUpdateType} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Plan Name</label>
                                <Input
                                    value={typeForm.name}
                                    onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                                    placeholder="e.g. Premium Health Plus"
                                    className="bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Category</label>
                                <select
                                    value={typeForm.category}
                                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value })}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
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
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <textarea
                                value={typeForm.description}
                                onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                placeholder="What does this plan cover?"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Employee Cost (Monthly)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <Input
                                        type="number"
                                        value={typeForm.cost}
                                        onChange={e => setTypeForm({ ...typeForm, cost: parseFloat(e.target.value) })}
                                        className="pl-8 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Employer Contribution</label>
                                <div className="relative">
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    <Input
                                        type="number"
                                        value={typeForm.employer_contribution}
                                        onChange={e => setTypeForm({ ...typeForm, employer_contribution: parseFloat(e.target.value) })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsTypeDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                {isEditingType ? 'Save Changes' : 'Create Plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const BenefitCard = ({ benefit, isEnrolled, onAction, getIcon, getColor, isAdmin, onEdit, onDelete }) => {
    const data = isEnrolled ? (benefit.benefit_type || {}) : benefit;
    const Icon = getIcon(data.category);
    const colorClass = getColor(data.category);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative"
        >
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden h-full flex flex-col">
                <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between space-y-0">
                    <div className={`p-3.5 rounded-2xl ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {isAdmin && !isEnrolled && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 pt-4 flex-1 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{data.name}</h3>
                        <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                            {data.description}
                        </p>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Cost</p>
                                <p className="text-lg font-bold text-slate-900">${data.cost}<span className="text-sm font-medium text-slate-400">/mo</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coverage</p>
                                <p className="text-lg font-bold text-emerald-600">{data.employer_contribution}% Paid</p>
                            </div>
                        </div>

                        <Button
                            onClick={onAction}
                            className={`w-full h-12 rounded-xl font-bold transition-all shadow-none
                                ${isEnrolled
                                    ? 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            {isEnrolled ? 'Cancel Coverage' : 'Enroll Now'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default BenefitsPage;
