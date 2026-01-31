import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { DollarSign, FileText, Users, Briefcase } from 'lucide-react';
import PayrollDashboard from './PayrollDashboard';
import { PayslipPage } from './PayslipPage';
import { SalaryStructurePage } from './SalaryStructurePage';
import LoanManagementPage from './LoanManagementPage';

const PayrollIndex = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="space-y-6 sm:space-y-10 animate-fade-in">
            {/* Centralized Header with Search */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pb-4 sm:pb-8 border-b border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">Payroll</h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-lg">Manage organizational compensation and records.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Navigation Tabs - Modern Responsive Control */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="w-full overflow-x-auto scrollbar-hide mb-10">
                    <div className="bg-slate-100/50 backdrop-blur-sm p-1 sm:p-2 rounded-xl sm:rounded-[2rem] inline-flex border border-slate-200/50 shadow-inner min-w-full sm:min-w-0">
                        <TabsList className="bg-transparent border-none p-0 flex gap-0.5 sm:gap-1">
                            {[
                                { id: 'dashboard', label: 'Overview', icon: DollarSign },
                                { id: 'payslips', label: 'Payslips', icon: FileText },
                                { id: 'salaries', label: 'Structures', icon: Users },
                                { id: 'loans', label: 'Loans', icon: Briefcase }
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)] rounded-[1.5rem] px-4 sm:px-8 py-2 sm:py-3.5 text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 border border-transparent data-[state=active]:border-slate-100"
                                >
                                    <tab.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeTab === tab.id ? 'text-primary-500' : 'text-slate-400'}`} />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>

                <div className="mt-2">
                    <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                        <PayrollDashboard setActiveTab={setActiveTab} />
                    </TabsContent>

                    <TabsContent value="payslips" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                        <PayslipPage />
                    </TabsContent>

                    <TabsContent value="salaries" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                        <SalaryStructurePage />
                    </TabsContent>

                    <TabsContent value="loans" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                        <LoanManagementPage />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default PayrollIndex;
