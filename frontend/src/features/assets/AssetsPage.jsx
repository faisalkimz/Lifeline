import React, { useState } from 'react';
import {
    Laptop, Monitor, Smartphone, Box, Plus, Search, Filter,
    User, CheckCircle, RefreshCw, RotateCcw, PenSquare, Trash2
} from 'lucide-react';
import {
    useGetAssetsQuery,
    useGetAssetCategoriesQuery,
    useGetEmployeesQuery,
    useCreateAssetMutation,
    useUpdateAssetMutation,
    useDeleteAssetMutation,
    useAssignAssetMutation,
    useReturnAssetMutation,
    useCreateAssetCategoryMutation
} from '../../store/api';
import toast from 'react-hot-toast';
import { Skeleton } from '../../components/ui/Skeleton';

const AssetsPage = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Queries
    const { data: assets, isLoading } = useGetAssetsQuery();
    const { data: categories } = useGetAssetCategoriesQuery();
    const { data: employees } = useGetEmployeesQuery();

    // Mutations
    const [createAsset] = useCreateAssetMutation();
    const [updateAsset] = useUpdateAssetMutation();
    const [deleteAsset] = useDeleteAssetMutation();
    const [assignAsset] = useAssignAssetMutation();
    const [returnAsset] = useReturnAssetMutation();
    const [createCategory] = useCreateAssetCategoryMutation();

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Derived state
    const assetsList = assets?.results || [];
    const categoriesList = categories?.results || categories || [];

    const filteredAssets = assetsList.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.assigned_to_details?.first_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: assets?.count || assetsList.length || 0,
        assigned: assetsList.filter(a => a.status === 'assigned').length,
        available: assetsList.filter(a => a.status === 'available').length,
        maintenance: assetsList.filter(a => a.status === 'maintenance').length,
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await createCategory(data).unwrap();
            toast.success('Category created successfully');
            setIsCategoryModalOpen(false);
        } catch (err) {
            toast.error('Failed to create category');
        }
    };

    const handleCreateAsset = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (selectedAsset) {
                await updateAsset({ id: selectedAsset.id, ...data }).unwrap();
                toast.success('Asset updated successfully');
            } else {
                await createAsset(data).unwrap();
                toast.success('Asset created successfully');
            }
            setIsAddModalOpen(false);
            setSelectedAsset(null);
        } catch (err) {
            toast.error('Failed to save asset');
            console.error(err);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await assignAsset({ id: selectedAsset.id, ...data }).unwrap();
            toast.success('Asset assigned successfully');
            setIsAssignModalOpen(false);
            setSelectedAsset(null);
        } catch (err) {
            toast.error(err.data?.error || 'Failed to assign asset');
        }
    };

    const handleReturn = async (asset) => {
        if (!window.confirm(`Mark ${asset.name} as returned?`)) return;
        try {
            await returnAsset({ id: asset.id, condition: asset.condition }).unwrap();
            toast.success('Asset returned successfully');
        } catch (err) {
            toast.error('Failed to return asset');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            await deleteAsset(id).unwrap();
            toast.success('Asset deleted');
        } catch (err) {
            toast.error('Failed to delete asset');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assets Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage company hardware and licenses</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="btn-workpay-secondary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                    <button
                        onClick={() => { setSelectedAsset(null); setIsAddModalOpen(true); }}
                        className="btn-workpay-primary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Asset
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Assets" value={stats.total} icon={Box} color="bg-blue-500" loading={isLoading} />
                <StatCard label="Assigned" value={stats.assigned} icon={User} color="bg-green-500" loading={isLoading} />
                <StatCard label="Available" value={stats.available} icon={CheckCircle} color="bg-indigo-500" loading={isLoading} />
                <StatCard label="Maintenance" value={stats.maintenance} icon={RefreshCw} color="bg-orange-500" loading={isLoading} />
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {['inventory', 'categories'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                className="pl-10 input-workpay"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                                className="pl-10 input-workpay appearance-none pr-8"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {activeTab === 'inventory' && (
                    <div className="overflow-x-auto">
                        <table className="table-workpay">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Serial / Tag</th>
                                    <th>Status</th>
                                    <th>Assignee</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="p-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                                            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="p-4"><div className="space-y-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-16" /></div></td>
                                            <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                            <td className="p-4"><div className="flex items-center gap-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-4 w-24" /></div></td>
                                            <td className="p-4"><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></div></td>
                                        </tr>
                                    ))
                                ) : filteredAssets?.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-slate-500">No assets found</td></tr>
                                ) : (
                                    filteredAssets?.map(asset => (
                                        <tr key={asset.id} className="group">
                                            <td className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                        {getIconForCategory(asset.category_details?.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 dark:text-white font-medium">{asset.name}</p>
                                                        <p className="text-xs text-slate-500">Purchased: {asset.purchase_date || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{asset.category_details?.name || 'Uncategorized'}</td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono">{asset.serial_number}</span>
                                                    <span className="text-[10px] text-slate-400">Tag: {asset.asset_tag || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={asset.status} />
                                            </td>
                                            <td>
                                                {asset.assigned_to_details ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                                                            {asset.assigned_to_details.first_name[0]}{asset.assigned_to_details.last_name[0]}
                                                        </div>
                                                        <span className="text-sm">{asset.assigned_to_details.first_name} {asset.assigned_to_details.last_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {asset.status === 'available' && (
                                                        <button
                                                            onClick={() => { setSelectedAsset(asset); setIsAssignModalOpen(true); }}
                                                            title="Assign Asset"
                                                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors"
                                                        >
                                                            <User className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {asset.status === 'assigned' && (
                                                        <button
                                                            onClick={() => handleReturn(asset)}
                                                            title="Return Asset"
                                                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-orange-600 transition-colors"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setSelectedAsset(asset); setIsAddModalOpen(true); }}
                                                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        <PenSquare className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(asset.id)}
                                                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="overflow-x-auto">
                        <table className="table-workpay">
                            <thead>
                                <tr>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                    <th>Assets Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                                            <td className="p-4"><Skeleton className="h-4 w-full" /></td>
                                            <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        </tr>
                                    ))
                                ) : categoriesList.map(cat => (
                                    <tr key={cat.id}>
                                        <td className="font-medium text-slate-900 dark:text-white capitalize">{cat.name}</td>
                                        <td className="text-slate-500">{cat.description || '-'}</td>
                                        <td>
                                            <span className="badge-workpay badge-neutral">
                                                {assetsList.filter(a => a.category === cat.id).length} Items
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Asset Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4">{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
                        <form onSubmit={handleCreateAsset} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                                    <input name="name" required defaultValue={selectedAsset?.name} className="input-workpay" placeholder="e.g. MacBook Pro" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                    <select name="category" defaultValue={selectedAsset?.category} className="input-workpay">
                                        <option value="">Select Category</option>
                                        {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Serial Number</label>
                                    <input name="serial_number" defaultValue={selectedAsset?.serial_number} className="input-workpay" placeholder="S/N 12345" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset Tag</label>
                                    <input name="asset_tag" defaultValue={selectedAsset?.asset_tag} className="input-workpay" placeholder="TAG-001" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Purchase Date</label>
                                    <input name="purchase_date" type="date" defaultValue={selectedAsset?.purchase_date} className="input-workpay" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost (UGX)</label>
                                    <input name="purchase_cost" type="number" defaultValue={selectedAsset?.purchase_cost} className="input-workpay" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Condition</label>
                                <select name="condition" defaultValue={selectedAsset?.condition || 'new'} className="input-workpay">
                                    <option value="new">New</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-workpay-secondary">Cancel</button>
                                <button type="submit" className="btn-workpay-primary">Save Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {isAssignModalOpen && selectedAsset && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-1">Assign Asset</h2>
                        <p className="text-sm text-slate-500 mb-4">Assigning <strong>{selectedAsset.name}</strong> to an employee.</p>

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Employee *</label>
                                <select name="employee_id" required className="input-workpay">
                                    <option value="">-- Choose Employee --</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assignment Date</label>
                                <input name="assigned_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="input-workpay" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                                <textarea name="notes" rows="3" className="input-workpay" placeholder="Any specific notes upon checkout..." />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn-workpay-secondary">Cancel</button>
                                <button type="submit" className="btn-workpay-primary">Confirm Assignment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4">Create Asset Category</h2>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category Name *</label>
                                <input name="name" required className="input-workpay" placeholder="e.g. Laptops, Furniture" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                <textarea name="description" rows="3" className="input-workpay" placeholder="Describe this category..." />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn-workpay-secondary">Cancel</button>
                                <button type="submit" className="btn-workpay-primary">Create Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${color.replace('bg-', 'bg-').replace('500', '100')} dark:bg-opacity-20 flex items-center justify-center text-${color.replace('bg-', '')}`}>
            <Icon className={`h-6 w-6 text-${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
            {loading ? (
                <Skeleton className="h-8 w-16 mt-1 rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            )}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        available: 'badge-success',
        assigned: 'badge-info',
        maintenance: 'badge-warning',
        retired: 'badge-neutral',
        lost: 'badge-error'
    };

    return (
        <span className={`badge-workpay ${styles[status] || 'badge-neutral'} uppercase`}>
            {status}
        </span>
    );
};

const getIconForCategory = (categoryName) => {
    if (!categoryName) return <Box className="h-4 w-4" />;
    const name = categoryName.toLowerCase();
    if (name.includes('laptop') || name.includes('macbook')) return <Laptop className="h-4 w-4" />;
    if (name.includes('monitor') || name.includes('screen')) return <Monitor className="h-4 w-4" />;
    if (name.includes('phone') || name.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    return <Box className="h-4 w-4" />;
};

export default AssetsPage;
