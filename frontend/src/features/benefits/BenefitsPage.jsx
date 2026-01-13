import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
    Plus, Shield, DollarSign, Wallet, Anchor, Sparkles,
    Check, Search, Edit, Trash2, Umbrella,
    User, Users, ChevronRight, ChevronLeft, Building, Zap, Info,
    Heart, Smile, Home, Palmtree, Gift, Briefcase
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
    const { data: benefitTypes } = useGetBenefitTypesQuery();
    const { data: myBenefits } = useGetEmployeeBenefitsQuery({ my_benefits: true });

    // Admin mutations
    const [createBenefitType] = useCreateBenefitTypeMutation();
    const [updateBenefitType] = useUpdateBenefitTypeMutation();
    const [deleteBenefitType] = useDeleteBenefitTypeMutation();

    // Employee mutations
    const [enrollInBenefit] = useCreateEmployeeBenefitMutation();
    const [unenrollFromBenefit] = useDeleteEmployeeBenefitMutation();

    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditingType, setIsEditingType] = useState(false);

    // State
    const [selectedType, setSelectedType] = useState(null);
    const [viewingBenefit, setViewingBenefit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [enrollStep, setEnrollStep] = useState(1); // 1: Info, 2: People, 3: Review

    // Forms
    const [typeForm, setTypeForm] = useState({
        name: '', description: '', category: 'insurance',
        default_value: 0, is_taxable: false, provider_name: '', provider_contact: ''
    });

    const [enrollForm, setEnrollForm] = useState({
        start_date: new Date().toISOString().split('T')[0],
        coverage_amount: 0,
        employee_contribution: 0,
        employer_contribution: 0,
        dependents_covered: []
    });

    const [newDependent, setNewDependent] = useState('');

    const benefitTypesArray = useMemo(() => Array.isArray(benefitTypes) ? benefitTypes : (benefitTypes?.results || []), [benefitTypes]);
    const myBenefitsArray = useMemo(() => Array.isArray(myBenefits) ? myBenefits : (myBenefits?.results || []), [myBenefits]);

    // Robust ID extraction handling both object (from backend serializer update) and ID
    const enrolledBenefitIds = useMemo(() =>
        myBenefitsArray.map(b => b.benefit_type?.id || b.benefit_type),
        [myBenefitsArray]);

    const availableBenefits = useMemo(() =>
        benefitTypesArray.filter(bt => !enrolledBenefitIds.includes(bt.id)),
        [benefitTypesArray, enrolledBenefitIds]);

    const isAdmin = user?.role === 'admin' || user?.role === 'company_admin' || user?.role === 'super_admin' || user?.role === 'hr_manager';

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
                toast.error('Failed to delete plan.');
            }
        }
    };

    const handleEnrollSubmit = async () => {
        try {
            const employeeId = user.employee_id || user.employee || user.id;

            if (!employeeId) {
                toast.error("Could not verify employee profile. Please contact HR.");
                return;
            }

            await enrollInBenefit({
                benefit_type: selectedType.id,
                employee: employeeId,
                ...enrollForm,
                coverage_amount: enrollForm.coverage_amount || selectedType.default_value
            }).unwrap();

            toast.success('Enrollment submitted successfully!');
            setIsEnrollDialogOpen(false);
            resetEnrollForm();
        } catch (error) {
            console.error("Enrollment Error:", error);
            const msg = error?.data?.detail || error?.data?.non_field_errors?.[0] || 'Enrollment failed. Please try again.';
            toast.error(msg);
        }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to cancel your coverage? This action is immediate.')) {
            try {
                await unenrollFromBenefit(enrollmentId).unwrap();
                toast.success('Coverage cancelled.');
                setIsDetailsDialogOpen(false);
            } catch (error) {
                toast.error('Cancellation failed.');
            }
        }
    };

    const resetTypeForm = () => {
        setTypeForm({
            name: '', description: '', category: 'insurance',
            default_value: 0, is_taxable: false, provider_name: '', provider_contact: ''
        });
        setIsEditingType(false);
        setSelectedType(null);
    };

    const resetEnrollForm = () => {
        setEnrollForm({
            start_date: new Date().toISOString().split('T')[0],
            coverage_amount: 0,
            employee_contribution: 0,
            employer_contribution: 0,
            dependents_covered: []
        });
        setEnrollStep(1);
    };

    const openEnrollDialog = (benefitType) => {
        setSelectedType(benefitType);
        setEnrollForm(prev => ({
            ...prev,
            coverage_amount: benefitType.default_value,
            employee_contribution: (benefitType.default_value * 0.2).toFixed(2),
            employer_contribution: (benefitType.default_value * 0.8).toFixed(2)
        }));
        setIsEnrollDialogOpen(true);
    };

    const openDetails = (benefit, isEnrolled = false) => {
        setViewingBenefit({ ...benefit, isEnrolled });
        setIsDetailsDialogOpen(true);
    };

    // Category Config - Human Oriented Icons
    const CATEGORIES = {
        insurance: { label: 'Health & Care', icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        allowance: { label: 'Working Essentials', icon: Briefcase, color: 'text-slate-700 bg-slate-50 border-slate-200' },
        loan: { label: 'Home & Future', icon: Home, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        retirement: { label: 'Relaxation', icon: Palmtree, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        perk: { label: 'Celebration', icon: Gift, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    };
    const getUiConfig = (catKey) => CATEGORIES[catKey] || CATEGORIES.insurance;

    const addDependent = () => {
        if (newDependent.trim()) {
            setEnrollForm(prev => ({
                ...prev,
                dependents_covered: [...prev.dependents_covered, newDependent.trim()]
            }));
            setNewDependent('');
        }
    };

    const removeDependent = (idx) => {
        setEnrollForm(prev => ({
            ...prev,
            dependents_covered: prev.dependents_covered.filter((_, i) => i !== idx)
        }));
    };

    // Form Wizard Logic
    const nextStep = () => setEnrollStep(s => s + 1);
    const prevStep = () => setEnrollStep(s => s - 1);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-12 font-sans">
            {/* Human Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Your Benefits, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{user?.first_name}</span>.
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        Manage your health, wealth, and future with Lifeline.
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => { resetTypeForm(); setIsTypeDialogOpen(true); }} className="rounded-xl px-6 bg-slate-900 text-white shadow-lg hover:scale-105 transition-all">
                        <Plus className="h-4 w-4 mr-2" /> New Plan
                    </Button>
                )}
            </div>

            {/* My Enrollments */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Active Enrollments</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Your Current Coverage</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {myBenefitsArray.length > 0 ? (
                            myBenefitsArray.map((benefit, idx) => (
                                <BenefitCard
                                    key={benefit.id}
                                    benefit={benefit}
                                    isEnrolled={true}
                                    getUiConfig={getUiConfig}
                                    onClick={() => openDetails(benefit, true)}
                                    // Pass actions
                                    onUnenroll={() => handleUnenroll(benefit.id)}
                                />
                            ))
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 group hover:border-slate-300 transition-colors cursor-pointer" onClick={() => document.getElementById('available-plans').scrollIntoView({ behavior: 'smooth' })}>
                                <div className="h-16 w-16 bg-white rounded-full shadow-lg shadow-slate-200/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Umbrella className="h-8 w-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <p className="text-slate-900 font-bold text-lg mb-1">You don't have active plans.</p>
                                <p className="text-slate-500 font-medium text-sm mb-6 max-w-xs text-center">Protect yourself and your family by enrolling in one of our comprehensive benefits.</p>
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8 shadow-lg shadow-slate-900/10">
                                    Start Enrollment <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Available Plans */}
            <section id="available-plans" className="space-y-6 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Available Plans</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Explore Options</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Find a plan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {availableBenefits.length > 0 ? (
                        availableBenefits
                            .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((benefit) => (
                                <BenefitCard
                                    key={benefit.id}
                                    benefit={benefit}
                                    isEnrolled={false}
                                    getUiConfig={getUiConfig}
                                    onClick={() => openDetails(benefit, false)}
                                    isAdmin={isAdmin}
                                    onEdit={() => {
                                        setSelectedType(benefit);
                                        setTypeForm({
                                            name: benefit.name, description: benefit.description, category: benefit.category,
                                            default_value: benefit.default_value, is_taxable: benefit.is_taxable,
                                            provider_name: benefit.provider_name, provider_contact: benefit.provider_contact
                                        });
                                        setIsEditingType(true);
                                        setIsTypeDialogOpen(true);
                                    }}
                                    onDelete={() => handleDeleteType(benefit.id)}
                                    // Action
                                    onEnroll={() => openEnrollDialog(benefit)}
                                />
                            ))
                    ) : (
                        <div className="col-span-full py-16 text-center text-slate-400">
                            No new plans available matching your search.
                        </div>
                    )}
                </div>
            </section>

            {/* ENROLLMENT WIZARD DIALOG */}
            <Dialog open={isEnrollDialogOpen} onOpenChange={(open) => { setIsEnrollDialogOpen(open); if (!open) resetEnrollForm(); }}>
                <DialogContent className="max-w-xl bg-white rounded-[2rem] p-0 overflow-hidden shadow-2xl border-none">
                    <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                        <h3 className="text-lg font-bold">Enrollment Wizard</h3>
                        <Badge variant="outline" className="text-white border-white/20 bg-white/10">Step {enrollStep} of 3</Badge>
                    </div>

                    <div className="p-8 min-h-[400px] flex flex-col">
                        {enrollStep === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
                                <div className="text-center space-y-2 mb-8">
                                    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${getUiConfig(selectedType?.category).color.replace('border-', '')} text-3xl`}>
                                        {React.createElement(getUiConfig(selectedType?.category).icon, { className: 'h-8 w-8' })}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedType?.name}</h2>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">{selectedType?.description}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-indigo-500" /> Plan Highlights
                                    </h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            Provider: <span className="font-bold text-slate-900">{selectedType?.provider_name || 'Internal'}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            Base Value: <span className="font-bold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(selectedType?.default_value)}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            Tax Status: <span className="font-bold text-slate-900">{selectedType?.is_taxable ? 'Taxable' : 'Tax Exempt'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {enrollStep === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Who is covered?</h2>
                                    <p className="text-slate-500 mb-6">Select family members to include in your plan.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {/* Primary User Card */}
                                    <div className="aspect-square rounded-2xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center p-4 text-center cursor-default">
                                        <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 mb-2 font-bold">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">You</p>
                                        <Badge className="mt-1 bg-slate-200 text-slate-600 text-[10px] uppercase">Primary</Badge>
                                    </div>

                                    {/* Dependents */}
                                    {enrollForm.dependents_covered.map((dep, i) => (
                                        <motion.div layout key={i} className="relative aspect-square rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex flex-col items-center justify-center p-4 text-center group">
                                            <button onClick={() => removeDependent(i)} className="absolute top-2 right-2 text-indigo-300 hover:text-red-500 transition-colors">
                                                <div className="bg-white rounded-full p-1 shadow-sm"><Trash2 className="h-3 w-3" /></div>
                                            </button>
                                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2 font-bold uppercase">
                                                {dep.substring(0, 2)}
                                            </div>
                                            <p className="text-sm font-bold text-indigo-900 line-clamp-1">{dep}</p>
                                            <Badge className="mt-1 bg-indigo-100 text-indigo-600 text-[10px] uppercase">Family</Badge>
                                        </motion.div>
                                    ))}

                                    {/* Add Button */}
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center hover:border-indigo-400 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => document.getElementById('new-dep-input').focus()}>
                                        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-2 transition-colors">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <Input
                                            id="new-dep-input"
                                            placeholder="Add Name"
                                            value={newDependent}
                                            onChange={e => setNewDependent(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addDependent()}
                                            className="h-8 text-center text-sm bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-slate-400"
                                        />
                                        <p className="text-[10px] text-slate-400 pointer-events-none mt-1">Press Enter</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {enrollStep === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Review & Confirm</h2>
                                    <p className="text-slate-500 mb-6">Confirm your benefit selection breakdown.</p>
                                </div>

                                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl ${getUiConfig(selectedType?.category).color.split(' ')[1]} flex items-center justify-center ${getUiConfig(selectedType?.category).color.split(' ')[0]}`}>
                                                {React.createElement(getUiConfig(selectedType?.category).icon, { className: 'h-5 w-5' })}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{selectedType?.name}</p>
                                                <p className="text-xs text-slate-500">{enrollForm.dependents_covered.length > 0 ? `+ ${enrollForm.dependents_covered.length} Dependents` : 'Individual Plan'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Total Value</p>
                                            <p className="text-lg font-black text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(parseFloat(enrollForm.employee_contribution || 0) + parseFloat(enrollForm.employer_contribution || 0))}<span className="text-xs text-slate-400">/mo</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-sm font-medium text-slate-600">Your Contribution</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-400">UGX</span>
                                                <Input
                                                    type="number"
                                                    value={enrollForm.employee_contribution}
                                                    onChange={e => setEnrollForm({ ...enrollForm, employee_contribution: e.target.value })}
                                                    className="w-24 h-8 text-right font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                                            <p className="text-sm font-medium text-emerald-700">Company Contribution</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-emerald-500">UGX</span>
                                                <Input
                                                    type="number"
                                                    value={enrollForm.employer_contribution}
                                                    onChange={e => setEnrollForm({ ...enrollForm, employer_contribution: e.target.value })}
                                                    className="w-24 h-8 text-right font-bold text-emerald-700 bg-transparent border-none focus:ring-0 p-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-center text-slate-400">
                                    By clicking confirm, you agree to the deduction from your payroll.
                                </p>
                            </motion.div>
                        )}

                        {/* Wizard Actions */}
                        <div className="mt-auto pt-8 flex justify-between items-center">
                            {enrollStep > 1 ? (
                                <button onClick={prevStep} className="text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center gap-2 transition-colors">
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
                            ) : (
                                <button onClick={() => setIsEnrollDialogOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-sm transition-colors">
                                    Cancel
                                </button>
                            )}

                            {enrollStep < 3 ? (
                                <Button onClick={nextStep} className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8 py-6 text-lg shadow-xl shadow-slate-900/20 hover:scale-105 transition-all">
                                    Next Step <ChevronRight className="h-5 w-5 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleEnrollSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all">
                                    Confirm Enrollment <Check className="h-5 w-5 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                {viewingBenefit && (
                    <DialogContent className="max-w-md bg-white rounded-[2rem] p-6 shadow-2xl border-none">
                        <div className="text-center mb-6">
                            <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${getUiConfig((viewingBenefit.benefit_type?.category || viewingBenefit.category))?.color} mb-4`}>
                                {React.createElement(getUiConfig((viewingBenefit.benefit_type?.category || viewingBenefit.category))?.icon, { className: 'h-10 w-10' })}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">
                                {viewingBenefit.benefit_type?.name || viewingBenefit.name}
                            </h2>
                            <p className="text-slate-500 font-medium">Provided by {viewingBenefit.benefit_type?.provider_name || viewingBenefit.provider_name}</p>
                        </div>

                        {viewingBenefit.isEnrolled ? (
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Your Monthly Cost</p>
                                    <p className="text-2xl font-black text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(viewingBenefit.employee_contribution)}</p>
                                </div>

                                {viewingBenefit.dependents_covered?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Covered Family Members</p>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingBenefit.dependents_covered.map((d, i) => (
                                                <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700">{d}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Button onClick={() => handleUnenroll(viewingBenefit.id)} className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none">
                                    Unenroll
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-center text-slate-600 text-sm">{viewingBenefit.description}</p>
                                <Button onClick={() => { setIsDetailsDialogOpen(false); openEnrollDialog(viewingBenefit); }} className="w-full bg-slate-900 text-white">
                                    Start Enrollment
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                )}
            </Dialog>

            {/* Create/Edit Admin Dialog */}
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
                                    className="bg-white h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                                <select
                                    value={typeForm.category}
                                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value })}
                                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none"
                                >
                                    <option value="insurance">Insurance</option>
                                    <option value="allowance">Allowance</option>
                                    <option value="loan">Loan / Advance</option>
                                    <option value="retirement">Retirement / Pension</option>
                                    <option value="perk">Perk / Lifestyle</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Default Value (UGX)</label>
                                <Input
                                    type="number"
                                    value={typeForm.default_value}
                                    onChange={e => setTypeForm({ ...typeForm, default_value: parseFloat(e.target.value) })}
                                    className="bg-white h-11"
                                />
                            </div>
                            <div className="space-y-2 flex items-center pt-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={typeForm.is_taxable}
                                        onChange={e => setTypeForm({ ...typeForm, is_taxable: e.target.checked })}
                                        className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Taxable Benefit</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Provider Name</label>
                                <Input
                                    value={typeForm.provider_name}
                                    onChange={e => setTypeForm({ ...typeForm, provider_name: e.target.value })}
                                    className="bg-white h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contact / Policy #</label>
                                <Input
                                    value={typeForm.provider_contact}
                                    onChange={e => setTypeForm({ ...typeForm, provider_contact: e.target.value })}
                                    className="bg-white h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                            <textarea
                                value={typeForm.description}
                                onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm min-h-[100px] outline-none resize-none"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsTypeDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8 h-11">
                                {isEditingType ? 'Save Changes' : 'Create Plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </motion.div>
    );
};

const BenefitCard = ({ benefit, isEnrolled, getUiConfig, onClick, onUnenroll, onEnroll, isAdmin, onEdit, onDelete }) => {
    // Robustly handle if benefit is the enrollment (has benefit_type object) or the type itself
    const data = isEnrolled ? (benefit.benefit_type || {}) : benefit;
    // Fallback if data is empty (prevents crash on slow serializer update)
    const category = data.category || 'insurance';
    const config = getUiConfig(category);

    // Extract color for border/text
    const accentColor = config.color.split(' ')[0];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
            onClick={onClick}
        >
            <div className="h-full bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-100 transition-all cursor-pointer flex flex-col relative overflow-hidden group">

                {/* Status Pill - Floating */}
                {isEnrolled && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-100/50 text-emerald-700 text-xs font-bold rounded-full backdrop-blur-sm border border-emerald-100">
                        Active Plan
                    </div>
                )}

                {/* Friendly Icon Bubble */}
                <div className={`h-16 w-16 rounded-2xl ${config.color.split(' ')[1]} flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 ${accentColor}`}>
                    {React.createElement(config.icon, { className: 'h-8 w-8' })}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-900 transition-colors">
                        {data.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed mb-6">
                        {data.description || 'Access comprehensive coverage designed for your well-being.'}
                    </p>
                </div>

                {/* Human-centric Footer */}
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                            {isEnrolled ? 'Your Investment' : 'Value'}
                        </p>
                        <p className={`text-lg font-black ${isEnrolled ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX', maximumSignificantDigits: 3 }).format(isEnrolled ? benefit.employee_contribution : data.default_value)}
                            <span className="text-xs text-slate-400 font-bold ml-0.5">/mo</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {isAdmin && !isEnrolled ? (
                            <>
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-10 w-10 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100"><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-10 w-10 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                            </>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); isEnrolled ? onUnenroll() : onEnroll(); }}
                                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${isEnrolled
                                    ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'
                                    : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 group-hover:scale-110 group-hover:bg-indigo-600'
                                    }`}
                            >
                                {isEnrolled ? <Trash2 className="h-5 w-5" /> : <ChevronRight className="h-6 w-6" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Decorative Organic Shape */}
                <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-current to-transparent opacity-[0.05] rounded-full blur-2xl ${accentColor}`} />
            </div>
        </motion.div>
    );
};

export default BenefitsPage;
