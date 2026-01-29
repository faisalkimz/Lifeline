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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Premium Header Removed as per user request to avoid redundancy */}

            {/* Navigation Tabs - Modern Segmented Control */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-slate-100/50 backdrop-blur-sm p-2 rounded-[2rem] inline-flex mb-10 border border-slate-200/50 shadow-inner">
                    <TabsList className="bg-transparent border-none p-0 flex gap-1">
                        {[
                            { id: 'dashboard', label: 'Overview', icon: DollarSign },
                            { id: 'payslips', label: 'Payslip Audit', icon: FileText },
                            { id: 'salaries', label: 'Salary Units', icon: Users },
                            { id: 'loans', label: 'Credit & Loans', icon: Briefcase }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)] rounded-[1.5rem] px-8 py-3.5 text-sm font-black transition-all duration-300 flex items-center gap-2 border border-transparent data-[state=active]:border-slate-100"
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-500' : 'text-slate-400'}`} />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
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
