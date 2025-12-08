import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { DollarSign, FileText, Users, Briefcase } from 'lucide-react';
import { PayrollDashboard } from './PayrollDashboard';
import { PayslipPage } from './PayslipPage';
import { SalaryStructurePage } from './SalaryStructurePage';
import { LoanManagementPage } from './LoanManagementPage';


const PayrollIndex = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payroll Management System</h1>
                        <p className="text-gray-600">Complete payroll processing, salary management, and compliance</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="payslips" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Payslips</span>
                    </TabsTrigger>
                    <TabsTrigger value="salaries" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Salaries</span>
                    </TabsTrigger>
                    <TabsTrigger value="loans" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span className="hidden sm:inline">Loans</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <PayrollDashboard />
                </TabsContent>

                <TabsContent value="payslips">
                    <PayslipPage />
                </TabsContent>

                <TabsContent value="salaries">
                    <SalaryStructurePage />
                </TabsContent>

                <TabsContent value="loans">
                    <LoanManagementPage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PayrollIndex;
