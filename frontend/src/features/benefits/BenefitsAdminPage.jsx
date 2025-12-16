import React, { useState } from 'react';
import {
    useGetBenefitTypesQuery,
    useCreateBenefitTypeMutation,
    useUpdateBenefitTypeMutation,
    useGetEmployeeBenefitsQuery,
    useCreateEmployeeBenefitMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
    Plus, Shield, Heart, DollarSign, Gift, Users,
    Edit, Trash2, CheckCircle, XCircle, FileText, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const BenefitsAdminPage = () => {
    const [activeTab, setActiveTab] = useState('catalog');

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Benefits Administration</h1>
                    <p className="text-gray-600 mt-2">Manage benefits catalog, NSSF, insurance, and employee enrollments</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 w-full max-w-2xl grid grid-cols-4">
                    <TabsTrigger value="catalog" className="gap-2">
                        <Gift className="h-4 w-4" /> Catalog
                    </TabsTrigger>
                    <TabsTrigger value="nssf" className="gap-2">
                        <Shield className="h-4 w-4" /> NSSF
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="gap-2">
                        <Heart className="h-4 w-4" /> Insurance
                    </TabsTrigger>
                    <TabsTrigger value="enrollments" className="gap-2">
                        <Users className="h-4 w-4" /> Enrollments
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="catalog">
                    <BenefitsCatalog />
                </TabsContent>

                <TabsContent value="nssf">
                    <NSSFManagement />
                </TabsContent>

                <TabsContent value="insurance">
                    <InsuranceManagement />
                </TabsContent>

                <TabsContent value="enrollments">
                    <BenefitsEnrollments />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const BenefitsCatalog = () => {
    const { data: benefitTypes, isLoading } = useGetBenefitTypesQuery();
    const [createBenefitType] = useCreateBenefitTypeMutation();
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'insurance',
        is_active: true,
        requires_enrollment: false
    });

    const categories = [
        { value: 'insurance', label: 'Insurance', icon: Shield },
        { value: 'allowance', label: 'Allowance', icon: DollarSign },
        { value: 'perk', label: 'Perk/Benefit', icon: Gift },
        { value: 'retirement', label: 'Retirement', icon: FileText }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBenefitType(formData).unwrap();
            toast.success('Benefit type created successfully!');
            setShowForm(false);
            setFormData({
                name: '',
                description: '',
                category: 'insurance',
                is_active: true,
                requires_enrollment: false
            });
        } catch (error) {
            toast.error('Failed to create benefit type');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Benefits Catalog</h2>
                    <p className="text-gray-600">Manage available benefit types and categories</p>
                </div>
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Benefit Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Benefit Type</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name *</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category *</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this benefit type..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.requires_enrollment}
                                        onChange={e => setFormData({ ...formData, requires_enrollment: e.target.checked })}
                                    />
                                    <span className="text-sm">Requires Enrollment</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Benefit Type</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Benefits Grid */}
            {isLoading ? (
                <div className="text-center py-8">Loading benefit types...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {(benefitTypes?.results || benefitTypes || []).map((benefit) => {
                        const category = categories.find(cat => cat.category === benefit.category) || categories[0];
                        const IconComponent = category.icon;

                        return (
                            <Card key={benefit.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${benefit.category === 'insurance' ? 'bg-blue-100 text-blue-600' :
                                            benefit.category === 'allowance' ? 'bg-green-100 text-green-600' :
                                            benefit.category === 'perk' ? 'bg-pink-100 text-pink-600' :
                                            'bg-orange-100 text-orange-600'}`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={benefit.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {benefit.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant="outline">
                                                {benefit.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{benefit.description}</p>

                                    {benefit.requires_enrollment && (
                                        <div className="flex items-center gap-2 text-sm text-orange-600 mb-4">
                                            <Settings className="h-4 w-4" />
                                            Requires enrollment approval
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Users className="h-4 w-4 mr-2" />
                                            Enrolled
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const NSSFManagement = () => {
    const [settings, setSettings] = useState({
        employee_rate: 5,
        employer_rate: 10,
        max_pensionable_earnings: 400000,
        is_active: true
    });

    const handleSave = () => {
        // Here you would save NSSF settings
        toast.success('NSSF settings updated successfully!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">NSSF Management</h2>
                <p className="text-gray-600">Configure National Social Security Fund contributions</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Contribution Rates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Employee Rate (%)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={settings.employee_rate}
                                    onChange={e => setSettings({ ...settings, employee_rate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Employer Rate (%)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={settings.employer_rate}
                                    onChange={e => setSettings({ ...settings, employer_rate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Max Pensionable Earnings (UGX)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-md"
                                value={settings.max_pensionable_earnings}
                                onChange={e => setSettings({ ...settings, max_pensionable_earnings: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="nssf-active"
                                checked={settings.is_active}
                                onChange={e => setSettings({ ...settings, is_active: e.target.checked })}
                            />
                            <label htmlFor="nssf-active" className="text-sm">NSSF contributions active</label>
                        </div>

                        <Button onClick={handleSave} className="w-full">
                            Save NSSF Settings
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">1,247</div>
                                <div className="text-sm text-blue-700">Active Contributors</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">₵45.2M</div>
                                <div className="text-sm text-green-700">Monthly Contributions</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">Recent Activity</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>New enrollments this month</span>
                                    <span className="font-medium">23</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Average contribution</span>
                                    <span className="font-medium">₵36,200</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const InsuranceManagement = () => {
    const [insurances, setInsurances] = useState([
        {
            id: 1,
            name: 'Health Insurance - Jubilee',
            type: 'health',
            provider: 'Jubilee Insurance',
            coverage: 'UGX 5M per year',
            employee_contribution: 'UGX 50,000/month',
            status: 'active',
            enrolled_employees: 234
        },
        {
            id: 2,
            name: 'Life Insurance - ICEA',
            type: 'life',
            provider: 'ICEA Insurance',
            coverage: 'UGX 10M coverage',
            employee_contribution: 'UGX 25,000/month',
            status: 'active',
            enrolled_employees: 189
        }
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Insurance Management</h2>
                    <p className="text-gray-600">Manage company insurance policies and employee coverage</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Insurance Policy
                </Button>
            </div>

            <div className="grid gap-6">
                {insurances.map((insurance) => (
                    <Card key={insurance.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{insurance.name}</h3>
                                            <p className="text-sm text-gray-600">{insurance.provider}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Coverage</p>
                                            <p className="font-semibold">{insurance.coverage}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Employee Contribution</p>
                                            <p className="font-semibold text-red-600">{insurance.employee_contribution}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Enrolled</p>
                                            <p className="font-semibold">{insurance.enrolled_employees} employees</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                            <Badge className="bg-green-100 text-green-700">
                                                {insurance.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Users className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const BenefitsEnrollments = () => {
    const { data: enrollments, isLoading } = useGetEmployeeBenefitsQuery({});

    const pendingEnrollments = [
        {
            id: 1,
            employee_name: 'Sarah Mirembe',
            benefit_name: 'Health Insurance',
            requested_date: '2025-12-15',
            status: 'pending'
        },
        {
            id: 2,
            employee_name: 'John Doe',
            benefit_name: 'Dental Coverage',
            requested_date: '2025-12-14',
            status: 'pending'
        }
    ];

    const handleApproval = (enrollmentId, approved) => {
        // Here you would approve/reject the enrollment
        toast.success(approved ? 'Enrollment approved!' : 'Enrollment rejected');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Benefits Enrollments</h2>
                <p className="text-gray-600">Review and manage employee benefit enrollment requests</p>
            </div>

            {/* Pending Approvals */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Pending Approvals ({pendingEnrollments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {enrollment.employee_name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Requested: {enrollment.benefit_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(enrollment.requested_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleApproval(enrollment.id, true)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApproval(enrollment.id, false)}
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Enrollments */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Active Enrollments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading enrollments...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Benefit</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enrolled Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(enrollments?.results || enrollments || []).map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell className="font-medium">{enrollment.employee_name}</TableCell>
                                        <TableCell>{enrollment.benefit_name}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-700">
                                                {enrollment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(enrollment.enrolled_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BenefitsAdminPage;
