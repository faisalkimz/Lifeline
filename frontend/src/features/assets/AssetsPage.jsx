import React, { useState } from 'react';
import {
    Plus, Search, Filter, Laptop, Smartphone,
    Monitor, MousePointer, MoreVertical,
    CheckCircle2, AlertCircle, Clock, User,
    ArrowUpRight, Download, FilterX, Archive,
    ChevronRight, MoreHorizontal, Layout, Box, Hash
} from 'lucide-react';
import {
    useGetAssetsQuery,
    useCreateAssetMutation,
    useUpdateAssetMutation,
    useGetAssetCategoriesQuery,
    useCreateAssetCategoryMutation,
    useAssignAssetMutation
} from '../../store/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    available: { color: 'text-emerald-700 bg-emerald-50', label: 'Available' },
    assigned: { color: 'text-blue-700 bg-blue-50', label: 'Assigned' },
    maintenance: { color: 'text-orange-700 bg-orange-50', label: 'Maintenance' },
    disposed: { color: 'text-slate-500 bg-slate-50', label: 'Disposed' }
};

const AssetsPage = () => {
    // 1. Core State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // 2. API Queries
    const { data: assets, isLoading, refetch } = useGetAssetsQuery({
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
    });
    const { data: categories } = useGetAssetCategoriesQuery();
    const [createAsset] = useCreateAssetMutation();
    const [updateAsset] = useUpdateAssetMutation();
    const [createCategory] = useCreateAssetCategoryMutation();
    const [assignAsset] = useAssignAssetMutation();

    const assetsList = Array.isArray(assets?.results) ? assets.results : (Array.isArray(assets) ? assets : []);

    // 3. Handlers
    const handleCreateAsset = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            if (selectedAsset) {
                await updateAsset({ id: selectedAsset.id, ...data }).unwrap();
                toast.success('Asset updated');
            } else {
                await createAsset(data).unwrap();
                toast.success('Asset added');
            }
            setIsAddModalOpen(false);
            setSelectedAsset(null);
            refetch();
        } catch (error) { toast.error('Check your input'); }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await assignAsset({
                asset_id: selectedAsset.id,
                employee_id: formData.get('employee_id'),
                notes: formData.get('notes')
            }).unwrap();
            toast.success('Asset assigned');
            setIsAssignModalOpen(false);
            refetch();
        } catch (error) { toast.error('Failed to assign'); }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await createCategory(Object.fromEntries(formData)).unwrap();
            toast.success('Category created');
            setIsCategoryModalOpen(false);
        } catch (error) { toast.error('Failed'); }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-notion-text-light mt-2">Manage organization hardware, licenses, and equipment.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsCategoryModalOpen(true)} className="btn-notion-outline h-8">
                        <Plus className="h-3.5 w-3.5 mr-2" /> Categories
                    </Button>
                    <Button onClick={() => { setSelectedAsset(null); setIsAddModalOpen(true); }} className="btn-notion-primary h-8">
                        <Plus className="h-3.5 w-3.5 mr-2" /> Add Asset
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total items', value: assetsList.length },
                    { label: 'Available', value: assetsList.filter(a => a.status === 'available').length },
                    { label: 'Assigned', value: assetsList.filter(a => a.status === 'assigned').length },
                    { label: 'Value', value: 'UGX ' + assetsList.reduce((sum, a) => sum + (parseFloat(a.purchase_cost) || 0), 0).toLocaleString() }
                ].map((s, idx) => (
                    <div key={idx} className="space-y-1">
                        <p className="text-[11px] font-semibold text-notion-text-light uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs / Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 py-2 border-y border-notion-border items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-notion-text-light" />
                    <input
                        placeholder="Search assets..."
                        className="w-full pl-8 pr-3 py-1.5 bg-transparent border-none focus:outline-none text-sm placeholder:text-notion-text-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto whitespace-nowrap px-1">
                    <span className="text-xs font-bold text-notion-text-light uppercase tracking-tighter">Category</span>
                    <select
                        className="bg-transparent border-none text-sm font-medium focus:outline-none text-notion-text-light outline-none"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">ALL ITEMS</option>
                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name?.toUpperCase()}</option>)}
                    </select>
                    <div className="h-4 w-px bg-notion-border mx-2" />
                    <button className="p-1 hover:bg-notion-hover rounded">
                        <MoreHorizontal className="h-4 w-4 text-notion-text-light" />
                    </button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="py-24 text-center text-notion-text-light italic">Loading inventory...</div>
            ) : assetsList.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-notion-border rounded-lg">
                    <Box className="h-10 w-10 mx-auto text-notion-border mb-3" />
                    <p className="text-sm font-medium text-notion-text-light">No assets found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-notion-border">
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider w-[350px]">Asset Details</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Storage</th>
                                <th className="px-4 py-3 text-xs font-semibold text-notion-text-light uppercase tracking-wider">Purchase</th>
                                <th className="px-1 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-notion-border">
                            {assetsList.map((asset) => (
                                <tr key={asset.id} className="group hover:bg-notion-hover/40 transition-colors">
                                    <td className="px-4 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-9 w-9 bg-notion-sidebar rounded border border-notion-border flex items-center justify-center shrink-0">
                                                <Laptop className="h-4 w-4 text-notion-text-light" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[14px] truncate">{asset.name}</p>
                                                <p className="text-[11px] text-notion-text-light uppercase tracking-wide flex items-center gap-1.5">
                                                    <Hash className="h-3 w-3 opacity-40" /> {asset.serial_number}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        {asset.status === 'assigned' ? (
                                            <div className="space-y-1">
                                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">Assigned</span>
                                                <p className="text-[11px] text-notion-text-light font-medium truncate max-w-[150px]">To: {asset.assigned_to_name}</p>
                                            </div>
                                        ) : (
                                            <span className={cn(
                                                "inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                STATUS_CONFIG[asset.status]?.color || 'bg-slate-50 border-slate-100'
                                            )}>
                                                {STATUS_CONFIG[asset.status]?.label || asset.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-5">
                                        <p className="text-xs font-medium">{asset.location || 'N/A'}</p>
                                        <p className="text-[11px] text-notion-text-light">{asset.category_name}</p>
                                    </td>
                                    <td className="px-4 py-5">
                                        <p className="text-xs font-medium">UGX {parseFloat(asset.purchase_cost).toLocaleString()}</p>
                                        <p className="text-[11px] text-notion-text-light">{asset.purchase_date || 'No Date'}</p>
                                    </td>
                                    <td className="px-1 py-5 text-right">
                                        <div className="flex justify-end items-center opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => { setSelectedAsset(asset); setIsAddModalOpen(true); }}
                                                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-xs font-bold text-notion-text-light hover:text-notion-text"
                                            >
                                                Edit
                                            </button>
                                            {asset.status === 'available' && (
                                                <button
                                                    onClick={() => { setSelectedAsset(asset); setIsAssignModalOpen(true); }}
                                                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-xs font-bold text-notion-primary"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Asset Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedAsset ? 'Edit Asset' : 'New Asset'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateAsset} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <InputField label="Asset Name" name="name" defaultValue={selectedAsset?.name} required placeholder="e.g. MacBook Pro M3" />
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Category</label>
                                <select
                                    name="category"
                                    defaultValue={selectedAsset?.category}
                                    required
                                    className="w-full bg-transparent border border-notion-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-notion-text"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <InputField label="Serial Number" name="serial_number" defaultValue={selectedAsset?.serial_number} required placeholder="S/N: 123-456" />
                            <InputField label="Location" name="location" defaultValue={selectedAsset?.location} placeholder="Office Desk / Storage" />
                            <InputField label="Purchase Cost" name="purchase_cost" type="number" defaultValue={selectedAsset?.purchase_cost} placeholder="UGX" />
                            <InputField label="Purchase Date" name="purchase_date" type="date" defaultValue={selectedAsset?.purchase_date} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Status</label>
                            <select
                                name="status"
                                defaultValue={selectedAsset?.status || 'available'}
                                className="w-full bg-transparent border border-notion-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-notion-text"
                            >
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="disposed">Disposed</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-8 border-t border-notion-border">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 text-sm font-medium hover:bg-notion-hover rounded">Cancel</button>
                            <button type="submit" className="btn-notion-primary h-9 px-6">Save Asset</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Assign Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Asset</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAssign} className="p-8 space-y-6">
                        <InputField label="Employee ID" name="employee_id" required placeholder="EMP-001" />
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">Notes</label>
                            <textarea
                                name="notes"
                                className="w-full bg-transparent border border-notion-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-notion-text h-24"
                                placeholder="Condition at handover..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-notion-border">
                            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-1.5 text-sm font-medium hover:bg-notion-hover rounded">Cancel</button>
                            <button type="submit" className="btn-notion-primary h-9 px-6 text-[11px] uppercase tracking-widest font-black">Confirm Assignment</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Management Categories</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="p-8 space-y-6">
                        <InputField label="Category Name" name="name" required placeholder="e.g. Laptops" />
                        <InputField label="Description" name="description" placeholder="Short summary..." />
                        <div className="flex justify-end gap-3 pt-6 border-t border-notion-border">
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-1.5 text-sm font-medium hover:bg-notion-hover rounded">Cancel</button>
                            <button type="submit" className="btn-notion-primary h-9 px-6 text-[11px] uppercase tracking-widest font-black">Create</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-notion-text-light uppercase tracking-wider">{label}</label>
        <input
            {...props}
            className="w-full bg-transparent border border-notion-border rounded-md px-3 py-1.5 text-sm placeholder:text-notion-text-light/50 focus:outline-none focus:ring-1 focus:ring-notion-text"
        />
    </div>
);

export default AssetsPage;
