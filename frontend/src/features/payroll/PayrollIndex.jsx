import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { DollarSign, FileText, Users, Briefcase } from 'lucide-react';
import { PayrollDashboard } from './PayrollDashboard';
import { PayslipPage } from './PayslipPage';
import { SalaryStructurePage } from './SalaryStructurePage';
import LoanManagementPage from './LoanManagementPage';

const PayrollIndex = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
                <p className="text-slate-500 mt-1">Complete payroll processing, salary management, and compliance.</p>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1 rounded-lg w-full max-w-2xl grid grid-cols-4 mb-8">
                    <TabsTrigger
                        value="dashboard"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 text-sm font-medium transition-all"
                    >
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                        value="payslips"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 text-sm font-medium transition-all"
                    >
                        Payslips
                    </TabsTrigger>
                    <TabsTrigger
                        value="salaries"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 text-sm font-medium transition-all"
                    >
                        Salaries
                    </TabsTrigger>
                    <TabsTrigger
                        value="loans"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md py-2 text-sm font-medium transition-all"
                    >
                        Loans
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-0">
                    <PayrollDashboard />
                </TabsContent>

                <TabsContent value="payslips" className="mt-0">
                    <PayslipPage />
                </TabsContent>

                <TabsContent value="salaries" className="mt-0">
                    <SalaryStructurePage />
                </TabsContent>

                <TabsContent value="loans" className="mt-0">
                    <LoanManagementPage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PayrollIndex;
