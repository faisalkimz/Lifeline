import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Plus, Heart, DollarSign, Shield, Calendar, CheckCircle, X
} from 'lucide-react';
import {
    useGetBenefitTypesQuery,
    useGetEmployeeBenefitsQuery,
    useCreateEmployeeBenefitMutation,
    useDeleteEmployeeBenefitMutation,
} from '../../store/api';
import toast from 'react-hot-toast';

const BenefitsPage = () => {
    const { data: benefitTypes } = useGetBenefitTypesQuery();
    const { data: myBenefits } = useGetEmployeeBenefitsQuery();
    const [enrollInBenefit] = useCreateEmployeeBenefitMutation();
    const [unenrollFromBenefit] = useDeleteEmployeeBenefitMutation();
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [selectedBenefit, setSelectedBenefit] = useState(null);

    const benefitTypesArray = Array.isArray(benefitTypes) ? benefitTypes : (benefitTypes?.results || []);
    const myBenefitsArray = Array.isArray(myBenefits) ? myBenefits : (myBenefits?.results || []);

    const handleEnroll = async (benefitTypeId) => {
        try {
            await enrollInBenefit({ benefit_type: benefitTypeId }).unwrap();
            toast.success('Enrolled successfully!');
            setIsEnrollDialogOpen(false);
        } catch (error) {
            toast.error('Failed to enroll');
        }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to unenroll from this benefit?')) {
            try {
                await unenrollFromBenefit(enrollmentId).unwrap();
                toast.success('Unenrolled successfully');
            } catch (error) {
                toast.error('Failed to unenroll');
            }
        }
    };

    const enrolledBenefitIds = myBenefitsArray.map(b => b.benefit_type?.id || b.benefit_type);
    const availableBenefits = benefitTypesArray.filter(bt => !enrolledBenefitIds.includes(bt.id));

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Benefits & Compensation</h1>
                <p className="text-gray-600 mt-1">Manage your benefits and perks</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{myBenefitsArray.length}</p>
                            <p className="text-sm text-gray-600">Enrolled Benefits</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Heart className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{availableBenefits.length}</p>
                            <p className="text-sm text-gray-600">Available Benefits</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{benefitTypesArray.length}</p>
                            <p className="text-sm text-gray-600">Total Programs</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Benefits */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Enrolled Benefits</h2>
                {myBenefitsArray.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No benefits enrolled</h3>
                        <p className="text-gray-600">Enroll in available benefits to get started</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myBenefitsArray.map(benefit => (
                            <Card key={benefit.id} className="hover:shadow-md transition-shadow border border-gray-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Heart className="h-5 w-5 text-green-600" />
                                        </div>
                                        <Badge className="bg-green-100 text-green-700 border-0">Enrolled</Badge>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.benefit_type_name || 'Benefit'}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{benefit.benefit_type?.description || 'No description'}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Enrolled on</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(benefit.enrollment_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-4 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                        onClick={() => handleUnenroll(benefit.id)}
                                    >
                                        <X className="h-4 w-4 mr-2" /> Unenroll
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Benefits */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Benefits</h2>
                {availableBenefits.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">All set!</h3>
                        <p className="text-gray-600">You're enrolled in all available benefits</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableBenefits.map(benefit => (
                            <Card key={benefit.id} className="hover:shadow-md transition-shadow border border-gray-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Heart className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700 border-0">Available</Badge>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{benefit.description}</p>
                                    <div className="space-y-2 mb-4">
                                        {benefit.employer_contribution > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Company covers</span>
                                                <span className="font-semibold text-green-600">
                                                    {benefit.employer_contribution}%
                                                </span>
                                            </div>
                                        )}
                                        {benefit.cost > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Your cost</span>
                                                <span className="font-semibold text-gray-900">
                                                    ${benefit.cost}/month
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="w-full" onClick={() => setSelectedBenefit(benefit)}>
                                                <Plus className="h-4 w-4 mr-2" /> Enroll
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Enroll in {benefit.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <p className="text-gray-600">{benefit.description}</p>
                                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Category</span>
                                                        <span className="text-sm font-medium text-gray-900">{benefit.category}</span>
                                                    </div>
                                                    {benefit.cost > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Monthly Cost</span>
                                                            <span className="text-sm font-medium text-gray-900">${benefit.cost}</span>
                                                        </div>
                                                    )}
                                                    {benefit.employer_contribution > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Company Contribution</span>
                                                            <span className="text-sm font-medium text-green-600">{benefit.employer_contribution}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button variant="outline" className="flex-1">Cancel</Button>
                                                    <Button className="flex-1" onClick={() => handleEnroll(benefit.id)}>
                                                        Confirm Enrollment
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BenefitsPage;
