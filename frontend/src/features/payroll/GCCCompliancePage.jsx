import React, { useState } from 'react';
import {
    Globe, ShieldCheck, Calculator, Users,
    ArrowRight, CheckCircle2, Info, Building2, Save
} from 'lucide-react';
import {
    useGetGCCSettingsQuery,
    useUpdateGCCSettingsMutation,
    useGetGratuityRecordsQuery
} from '../../store/api';
import toast from 'react-hot-toast';

const GCCCompliancePage = () => {
    const { data: settings, isLoading: settingsLoading } = useGetGCCSettingsQuery();
    const { data: gratuity, isLoading: gratuityLoading } = useGetGratuityRecordsQuery();
    const [updateSettings] = useUpdateGCCSettingsMutation();

    const [activeTab, setActiveTab] = useState('settings');

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            country: formData.get('country'),
            social_insurance_enabled: formData.get('social_insurance_enabled') === 'on',
            citizen_contribution_rate: formData.get('citizen_contribution_rate'),
            employer_contribution_rate: formData.get('employer_contribution_rate'),
            base_salary_type: formData.get('base_salary_type')
        };

        try {
            await updateSettings(data).unwrap();
            toast.success('GCC Settings Updated!');
        } catch (err) {
            toast.error('Failed to update settings');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        GCC <span className="text-primary-600">Compliance</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Statutory rules and End-of-Service benefits for the Gulf region.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Regional Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('gratuity')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gratuity' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Gratuity Accruals
                    </button>
                </div>
            </div>

            {activeTab === 'settings' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card-workpay p-8">
                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Statutory Configuration</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block tracking-tight">Target Country</label>
                                        <select name="country" defaultValue={settings?.country || 'UAE'} className="input-workpay">
                                            <option value="UAE">United Arab Emirates (GPSSA)</option>
                                            <option value="KSA">Saudi Arabia (GOSI)</option>
                                            <option value="QAT">Qatar (Pension Authority)</option>
                                            <option value="OMN">Oman (PASI)</option>
                                            <option value="KWT">Kuwait (PIFSS)</option>
                                            <option value="BHR">Bahrain (SIO)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block tracking-tight">Gratuity Calculation Base</label>
                                        <select name="base_salary_type" defaultValue={settings?.base_salary_type || 'basic'} className="input-workpay">
                                            <option value="basic">Basic Salary Only</option>
                                            <option value="gross">Gross Salary (Total Pay)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-green-500" />
                                            <span className="font-bold text-slate-800 dark:text-white">Social Insurance Contributions</span>
                                        </div>
                                        <input type="checkbox" name="social_insurance_enabled" defaultChecked={settings?.social_insurance_enabled ?? true} className="h-5 w-5 rounded-md text-primary-600" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Citizen Share (%)</label>
                                            <input name="citizen_contribution_rate" type="number" step="0.01" defaultValue={settings?.citizen_contribution_rate || '5.00'} className="input-workpay" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Employer Share (%)</label>
                                            <input name="employer_contribution_rate" type="number" step="0.01" defaultValue={settings?.employer_contribution_rate || '12.50'} className="input-workpay" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Applied only to GCC National employees as per regional regulations.</p>
                                </div>

                                <button type="submit" className="btn-workpay-primary w-full py-4 flex items-center justify-center gap-2">
                                    <Save className="h-5 w-5" />
                                    Save Compliance Settings
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-6">
                        <div className="card-workpay p-6 bg-primary-600 text-white border-none">
                            <Info className="h-8 w-8 mb-4 opacity-50" />
                            <h4 className="text-lg font-bold mb-2">GCC Labor Law</h4>
                            <p className="text-sm text-primary-100 mb-4 leading-relaxed">
                                Most Gulf countries require a 21/30 day gratuity calculation based on years of service. Lifeline automates this accrual every payroll cycle.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs font-medium bg-white/10 p-2 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4" /> 1-5 Years: 21 days/year
                                </li>
                                <li className="flex items-center gap-2 text-xs font-medium bg-white/10 p-2 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4" /> 5+ Years: 30 days/year
                                </li>
                            </ul>
                        </div>

                        <div className="card-workpay p-6 border-slate-200 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Supported Authorities</h4>
                            <div className="space-y-3">
                                {['GPSSA (UAE)', 'GOSI (KSA)', 'PASI (OMN)', 'SIO (BHR)'].map(auth => (
                                    <div key={auth} className="flex items-center justify-between text-xs font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <span className="text-primary-600">{auth}</span>
                                        <ArrowRight className="h-3 w-3 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card-workpay overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calculator className="h-5 w-5 text-primary-600" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Gratuity (EOS) Accruals</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400">Total Accrued: <span className="text-slate-900 dark:text-white">AED 45,200.00</span></span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Service Period</th>
                                    <th className="px-6 py-4">Base Salary</th>
                                    <th className="px-6 py-4">Accrued Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {gratuity?.results?.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                                    {rec.employee_name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{rec.employee_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-500">{rec.total_years_service} Years</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AED {rec.last_salary_base}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-primary-600">AED {rec.accrued_amount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase">
                                                {rec.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!gratuity?.results || gratuity.results.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                                            No gratuity records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GCCCompliancePage;
