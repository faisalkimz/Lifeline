import React, { useState } from 'react';
import {
    useGetBenefitTypesQuery,
    useGetEmployeeBenefitsQuery
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Shield, Heart, DollarSign, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const BenefitsPage = () => {
    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Compensation & Benefits</h1>
                <p className="text-gray-500">Manage your insurance, allowances, and perks.</p>
            </div>

            <Tabs defaultValue="my-benefits" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="my-benefits" className="gap-2">
                        <Shield className="h-4 w-4" /> My Active Benefits
                    </TabsTrigger>
                    <TabsTrigger value="available" className="gap-2">
                        <Gift className="h-4 w-4" /> Available Perks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="my-benefits">
                    <MyBenefitsList />
                </TabsContent>

                <TabsContent value="available">
                    <AvailableBenefitsList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const MyBenefitsList = () => {
    const { data: benefits, isLoading } = useGetEmployeeBenefitsQuery({ my_benefits: true });

    if (isLoading) return <div>Loading benefits...</div>;

    if (!benefits?.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                    No active benefits found.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(benefit => (
                <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
        </div>
    );
};

const BenefitCard = ({ benefit }) => {
    const categories = {
        'insurance': { icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        'allowance': { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        'perk': { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' },
        'retirement': { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' }
    };

    const style = categories[benefit.benefit_category] || categories['perk'];
    const Icon = style.icon;

    return (
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${style.bg.replace('100', '500')}`} />
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${style.bg} ${style.color}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Active
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{benefit.benefit_name}</h3>

                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-500">Coverage</span>
                        <span className="font-semibold">{benefit.coverage_amount}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-500">Employee Contrib.</span>
                        <span className="font-semibold text-red-600">-{benefit.employee_contribution}</span>
                    </div>
                </div>

                <div className="mt-4 pt-2">
                    <Button variant="outline" size="sm" className="w-full">View Policy</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const AvailableBenefitsList = () => {
    const { data: types, isLoading } = useGetBenefitTypesQuery();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            {types?.map(type => (
                <div key={type.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Gift className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{type.name}</h4>
                            <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                    </div>
                    <Button>Request Enrollment</Button>
                </div>
            ))}
        </div>
    );
};
import { Clock } from 'lucide-react'; // Added missing import

export default BenefitsPage;
