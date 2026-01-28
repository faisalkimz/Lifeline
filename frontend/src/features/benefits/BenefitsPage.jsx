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
                toast.success('Benefit plan updated successfully');
            } else {
                await createBenefitType(typeForm).unwrap();
                toast.success('New benefit plan created');
            }
            setIsTypeDialogOpen(false);
            resetTypeForm();
        } catch (error) {
            toast.error('Failed to save benefit plan');
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit plan? This action cannot be undone.')) {
            try {
                await deleteBenefitType(id).unwrap();
                toast.success('Benefit plan deleted');
            } catch (error) {
                toast.error('Failed to delete plan');
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
                toast.success('Coverage cancelled');
                setIsDetailsDialogOpen(false);
            } catch (error) {
                toast.error('Cancellation failed');
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

    // Category Config
    const CATEGORIES = {
        insurance: { label: 'Health & Care', icon: Heart, color: 'text-rose-600 bg-rose-50' },
        allowance: { label: 'Working Essentials', icon: Briefcase, color: 'text-slate-700 bg-slate-50' },
        loan: { label: 'Home & Future', icon: Home, color: 'text-indigo-600 bg-indigo-50' },
        retirement: { label: 'Relaxation', icon: Palmtree, color: 'text-emerald-600 bg-emerald-50' },
        perk: { label: 'Celebration', icon: Gift, color: 'text-amber-600 bg-amber-50' },
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
        <div className="space-y-10 pb-12">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Benefits</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your health, wealth, and future with corporate benefits.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => { resetTypeForm(); setIsTypeDialogOpen(true); }} className="h-11 px-6 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all gap-2">
                        <Plus className="h-4 w-4" /> Add benefit plan
                    </Button>
                )}
            </div>

            {/* Active Enrollments */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Active enrollments</h2>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Your current coverage</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myBenefitsArray.length > 0 ? (
                        myBenefitsArray.map((benefit) => (
                            <BenefitCard
                                key={benefit.id}
                                benefit={benefit}
                                isEnrolled={true}
                                getUiConfig={getUiConfig}
                                onClick={() => openDetails(benefit, true)}
                                onUnenroll={() => handleUnenroll(benefit.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                            <Umbrella className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-slate-900 font-bold text-lg">You don't have active plans</p>
                            <p className="text-slate-500 text-sm mb-6 max-w-xs text-center">Protect yourself and your family by enrolling in one of our comprehensive benefits.</p>
                            <Button
                                onClick={() => document.getElementById('available-plans').scrollIntoView({ behavior: 'smooth' })}
                                className="h-11 px-8 bg-slate-900 text-white font-semibold rounded-lg shadow-sm"
                            >
                                Browse plans
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Available Plans */}
            <section id="available-plans" className="space-y-6 pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Available plans</h2>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Explore options</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Find a plan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
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
                                    onEnroll={() => openEnrollDialog(benefit)}
                                />
                            ))
                    ) : (
                        <div className="col-span-full py-16 text-center text-slate-400">
                            No plans available matching your search.
                        </div>
                    )}
                </div>
            </section>

            {/* Enrollment Wizard Dialog */}
            <Dialog open={isEnrollDialogOpen} onOpenChange={(open) => { setIsEnrollDialogOpen(open); if (!open) resetEnrollForm(); }}>
                <DialogContent className="max-w-xl bg-white rounded-2xl p-0 overflow-hidden shadow-2xl border-none">
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">Enrollment wizard</DialogTitle>
                            <p className="text-xs text-slate-500 mt-0.5">Step {enrollStep} of 3</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Umbrella className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="p-8 min-h-[400px] flex flex-col">
                        {enrollStep === 1 && (
                            <div className="flex-1 space-y-8">
                                <div className="space-y-4">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${getUiConfig(selectedType?.category).color} text-3xl shadow-sm border border-slate-100`}>
                                        {React.createElement(getUiConfig(selectedType?.category).icon, { className: 'h-8 w-8' })}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedType?.name}</h2>
                                        <p className="text-slate-500 leading-relaxed max-w-sm">{selectedType?.description}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        Plan Highlights
                                    </h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            Provider: <span className="font-semibold text-slate-900">{selectedType?.provider_name || 'Internal'}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            Base Value: <span className="font-semibold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(selectedType?.default_value)}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            Tax Status: <span className="font-semibold text-slate-900">{selectedType?.is_taxable ? 'Taxable' : 'Tax Exempt'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {enrollStep === 2 && (
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Who is covered?</h2>
                                    <p className="text-slate-500">Select family members to include in your plan.</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="aspect-square rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-center cursor-default">
                                        <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 mb-2 font-bold">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">You</p>
                                        <Badge className="mt-1 bg-slate-200 text-slate-600 text-[10px] uppercase border-none">Primary</Badge>
                                    </div>

                                    {enrollForm.dependents_covered.map((dep, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-center group">
                                            <button onClick={() => removeDependent(i)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 mb-2 font-bold uppercase">
                                                {dep.substring(0, 2)}
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{dep}</p>
                                            <Badge className="mt-1 bg-blue-50 text-blue-600 text-[10px] uppercase border-none">Family</Badge>
                                        </div>
                                    ))}

                                    <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => document.getElementById('new-dep-input').focus()}>
                                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <Input
                                            id="new-dep-input"
                                            placeholder="Add member"
                                            value={newDependent}
                                            onChange={e => setNewDependent(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addDependent()}
                                            className="h-8 text-center text-sm bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {enrollStep === 3 && (
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Review & confirm</h2>
                                    <p className="text-slate-500">Confirm your benefit selection breakdown.</p>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg ${getUiConfig(selectedType?.category).color} flex items-center justify-center border border-slate-100`}>
                                                {React.createElement(getUiConfig(selectedType?.category).icon, { className: 'h-5 w-5' })}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{selectedType?.name}</p>
                                                <p className="text-xs text-slate-500">{enrollForm.dependents_covered.length > 0 ? `+ ${enrollForm.dependents_covered.length} Dependents` : 'Individual Plan'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Value</p>
                                            <p className="text-lg font-bold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(parseFloat(enrollForm.employee_contribution || 0) + parseFloat(enrollForm.employer_contribution || 0))}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your monthly contribution</label>
                                            <Input
                                                type="number"
                                                value={enrollForm.employee_contribution}
                                                onChange={e => setEnrollForm({ ...enrollForm, employee_contribution: e.target.value })}
                                                className="h-11 bg-white border-slate-200 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company contribution</label>
                                            <Input
                                                type="number"
                                                value={enrollForm.employer_contribution}
                                                onChange={e => setEnrollForm({ ...enrollForm, employer_contribution: e.target.value })}
                                                className="h-11 bg-slate-100 border-transparent font-bold text-slate-500 cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-10 flex justify-between items-center">
                            {enrollStep > 1 ? (
                                <Button variant="ghost" onClick={prevStep} className="font-semibold text-slate-500 gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </Button>
                            ) : (
                                <Button variant="ghost" onClick={() => setIsEnrollDialogOpen(false)} className="text-slate-400 hover:text-rose-500">
                                    Cancel
                                </Button>
                            )}

                            {enrollStep < 3 ? (
                                <Button onClick={nextStep} className="h-11 px-8 bg-slate-900 text-white font-semibold rounded-lg shadow-sm gap-2">
                                    Next step <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleEnrollSubmit} className="h-11 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm">
                                    Confirm enrollment
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                {viewingBenefit && (
                    <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden shadow-2xl border-none">
                        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                            <DialogTitle className="text-xl font-bold text-slate-900">Plan details</DialogTitle>
                            <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center ${getUiConfig((viewingBenefit.benefit_type?.category || viewingBenefit.category))?.color}`}>
                                {React.createElement(getUiConfig((viewingBenefit.benefit_type?.category || viewingBenefit.category))?.icon, { className: 'h-5 w-5' })}
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {viewingBenefit.benefit_type?.name || viewingBenefit.name}
                                </h2>
                                <p className="text-slate-500 mt-1">Provided by {viewingBenefit.benefit_type?.provider_name || viewingBenefit.provider_name}</p>
                            </div>

                            {viewingBenefit.isEnrolled ? (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your monthly investment</p>
                                        <p className="text-3xl font-bold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(viewingBenefit.employee_contribution)}</p>
                                    </div>

                                    {viewingBenefit.dependents_covered?.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Covered family members</p>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingBenefit.dependents_covered.map((d, i) => (
                                                    <Badge key={i} className="bg-blue-50 text-blue-700 border-none font-semibold px-3 py-1 rounded-full">{d}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={() => handleUnenroll(viewingBenefit.id)} className="w-full h-11 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-lg shadow-sm border-none">
                                        Cancel coverage
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-center text-slate-600 leading-relaxed">{viewingBenefit.description}</p>
                                    <Button onClick={() => { setIsDetailsDialogOpen(false); openEnrollDialog(viewingBenefit); }} className="w-full h-11 bg-slate-900 text-white font-semibold rounded-lg shadow-sm">
                                        Start enrollment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                )}
            </Dialog>

            {/* Create/Edit Admin Dialog */}
            <Dialog open={isTypeDialogOpen} onOpenChange={(open) => { if (!open) resetTypeForm(); setIsTypeDialogOpen(open); }}>
                <DialogContent className="max-w-xl bg-white rounded-2xl p-0 overflow-hidden shadow-2xl border-none">
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {isEditingType ? 'Edit benefit plan' : 'Create benefit plan'}
                        </DialogTitle>
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Plus className="h-5 w-5" />
                        </div>
                    </div>

                    <form onSubmit={handleCreateOrUpdateType} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan name</label>
                                <Input
                                    value={typeForm.name}
                                    onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                                    className="h-11 rounded-xl border-slate-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <select
                                    value={typeForm.category}
                                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value })}
                                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-900"
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
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default value (UGX)</label>
                                <Input
                                    type="number"
                                    value={typeForm.default_value}
                                    onChange={e => setTypeForm({ ...typeForm, default_value: parseFloat(e.target.value) })}
                                    className="h-11 rounded-xl border-slate-200"
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
                                    <span className="text-sm font-semibold text-slate-700">Taxable benefit</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider name</label>
                                <Input
                                    value={typeForm.provider_name}
                                    onChange={e => setTypeForm({ ...typeForm, provider_name: e.target.value })}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact / Policy #</label>
                                <Input
                                    value={typeForm.provider_contact}
                                    onChange={e => setTypeForm({ ...typeForm, provider_contact: e.target.value })}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                            <textarea
                                value={typeForm.description}
                                onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm min-h-[100px] outline-none resize-none focus:ring-1 focus:ring-slate-900"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsTypeDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="h-11 px-8 bg-slate-900 text-white font-semibold rounded-lg shadow-sm">
                                {isEditingType ? 'Save changes' : 'Create plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const BenefitCard = ({ benefit, isEnrolled, getUiConfig, onClick, onUnenroll, onEnroll, isAdmin, onEdit, onDelete }) => {
    const data = isEnrolled ? (benefit.benefit_type || {}) : benefit;
    const category = data.category || 'insurance';
    const config = getUiConfig(category);

    return (
        <Card
            className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            onClick={onClick}
        >
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${config.color} border border-slate-50 shadow-sm`}>
                        {React.createElement(config.icon, { className: 'h-6 w-6' })}
                    </div>
                    {isEnrolled && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold px-3 py-1 rounded-full text-[10px]">ACTIVE</Badge>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {data.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {data.description || 'Access comprehensive coverage designed for your well-being.'}
                    </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {isEnrolled ? 'Monthly cost' : 'Monthly value'}
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX', maximumSignificantDigits: 3 }).format(isEnrolled ? benefit.employee_contribution : data.default_value)}
                        </p>
                    </div>

                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        {isAdmin && !isEnrolled ? (
                            <>
                                <Button size="icon" variant="ghost" onClick={onEdit} className="h-9 w-9 text-slate-400 hover:text-slate-900 rounded-lg"><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={onDelete} className="h-9 w-9 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant={isEnrolled ? "ghost" : "default"}
                                onClick={(e) => { e.stopPropagation(); isEnrolled ? onUnenroll() : onEnroll(); }}
                                className={`h-9 px-4 font-semibold text-xs rounded-lg ${!isEnrolled && 'bg-slate-900 text-white hover:bg-slate-800'}`}
                            >
                                {isEnrolled ? 'Cancel' : 'Enroll'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BenefitsPage;
