import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Plus, Search, Users,
    MoreVertical, Edit, Trash2
} from 'lucide-react';
import { useGetDepartmentsQuery, useGetEmployeesQuery, useDeleteDepartmentMutation } from '../../store/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../../components/ui/Table';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../auth/authSlice';
import toast from 'react-hot-toast';

const DepartmentListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Check authentication
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Force login check
    React.useEffect(() => {
        console.log('👤 Auth Check:', {
            isAuthenticated,
            user: user?.username,
            token: localStorage.getItem('token')?.substring(0, 20) + '...',
            userCompany: user?.company?.name
        });

        if (!isAuthenticated || !user) {
            console.log('🚨 User not authenticated - redirecting to login');
            // Don't redirect automatically, let user see the logs
        }
    }, [isAuthenticated, user]);

    // Fetch data
    const { data: departments, isLoading, refetch, error } = useGetDepartmentsQuery();
    const { data: employees } = useGetEmployeesQuery({ employment_status: 'active' });
    const [deleteDepartment] = useDeleteDepartmentMutation();

    // Debug auth status
    console.log('Auth status:', {
        user: user?.username,
        userId: user?.id,
        company: user?.company?.name,
        companyId: user?.company?.id,
        isAuthenticated
    });

    // Calculate employee count for each department
    const departmentsWithCounts = React.useMemo(() => {
        return departments?.map(dept => ({
            ...dept,
            employee_count: employees?.filter(emp => emp.department === dept.id).length || 0
        })) || [];
    }, [departments, employees]);

    // Test API connection
    React.useEffect(() => {
        const testApi = async () => {
            console.log('🔍 Testing API connection...');
            try {
                const token = localStorage.getItem('token');
                console.log('📝 Token present:', !!token);

                const response = await fetch('http://localhost:8000/api/departments/', {
                    method: 'GET',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 API Response Status:', response.status, response.statusText);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ API Test Success - Data:', data);
                } else {
                    const errorText = await response.text();
                    console.log('❌ API Test Error:', errorText);
                    console.log('🔐 Auth header sent:', !!token);
                }
            } catch (err) {
                console.log('🚫 API Test Network Error:', err);
                console.log('🌐 Trying without proxy...');
                // Try direct backend URL
                try {
                    const response2 = await fetch('http://localhost:8000/api/', {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    console.log('🔄 Direct backend test:', response2.status);
                } catch (err2) {
                    console.log('💥 Direct backend also failed:', err2);
                }
            }
        };

        testApi();
    }, []);

    // Debug logging - check if user is authenticated
    React.useEffect(() => {
        console.log('Departments data:', departments);
        console.log('Employees data:', employees);
        console.log('Departments with counts:', departmentsWithCounts);
        console.log('Departments error:', error);
        console.log('Departments loading:', isLoading);
        console.log('Departments count:', departments?.length || 0);
    }, [departments, employees, departmentsWithCounts, error, isLoading]);

    // Filter departments
    const filteredDepartments = departmentsWithCounts?.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await deleteDepartment(id).unwrap();
                toast.success('Department deleted successfully!');
                refetch();
            } catch (error) {
                toast.error(error?.data?.error || 'Failed to delete department');
                console.error('Failed to delete department:', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Debug Info */}
            {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium">⚠️ Not authenticated</p>
                    <p className="text-yellow-700 text-sm">Please log in to view departments.</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your company's organizational structure.
                        {isAuthenticated && user && (
                            <span className="block text-xs text-gray-400 mt-1">
                                Logged in as: {user.first_name} {user.last_name} ({user.company?.name})
                            </span>
                        )}
                    </p>
                </div>
                <Button onClick={() => navigate('/departments/new')} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Departments"
                    value={departmentsWithCounts?.length || 0}
                    icon={Building2}
                    color="primary"
                />
                <StatCard
                    title="Total Employees"
                    value={departmentsWithCounts?.reduce((acc, dept) => acc + (dept.employee_count || 0), 0) || 0}
                    icon={Users}
                    color="success"
                />
                <StatCard
                    title="Avg. Team Size"
                    value={departmentsWithCounts?.length ? Math.round(departmentsWithCounts.reduce((acc, dept) => acc + (dept.employee_count || 0), 0) / departmentsWithCounts.length) : 0}
                    icon={Users}
                    color="warning"
                />
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search departments..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Departments Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Manager</TableHead>
                                <TableHead className="text-center">Employees</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Loading departments...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                                        Error loading departments: {error?.message || 'Unknown error'}
                                        <br />
                                        <div className="mt-2 text-xs text-gray-600">
                                            Status: {error?.status} | Original Status: {error?.originalStatus}
                                            {error?.data && <div>Data: {JSON.stringify(error.data)}</div>}
                                        </div>
                                        <button
                                            onClick={() => refetch()}
                                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                        >
                                            Retry
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDepartments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No departments found. Add one to get started!
                                        <br />
                                        <span className="text-xs text-gray-400 block mt-1">
                                            If you just created a department, try refreshing the page.
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDepartments?.map((dept) => (
                                    <TableRow
                                        key={dept.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/departments/${dept.id}/edit`)}
                                    >
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">{dept.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{dept.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600 font-mono">
                                                {dept.code}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {dept.manager_name ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-700 font-bold">
                                                        {dept.manager_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="text-sm text-gray-700">{dept.manager_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                                                {dept.employee_count || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.is_active
                                                    ? "bg-success-50 text-success-700 border border-success-200"
                                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                                }`}>
                                                {dept.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-primary-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/departments/${dept.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-error-600"
                                                    onClick={(e) => handleDelete(dept.id, e)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default DepartmentListPage;
