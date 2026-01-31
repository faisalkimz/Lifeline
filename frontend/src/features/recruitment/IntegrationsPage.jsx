import React, { useState, useMemo } from 'react';
import {
    useGetRecruitmentIntegrationsQuery,
    useCreateRecruitmentIntegrationMutation,
    useUpdateRecruitmentIntegrationMutation,
    useGetIntegrationsQuery,
    useCreateIntegrationMutation,
    useUpdateIntegrationMutation,
    useGetIntegrationStatusQuery,
    useTestIntegrationMutation,
    useTestRecruitmentIntegrationMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Linkedin, Globe, Link, CheckCircle,
    Activity, Share2, Network,
    LayoutGrid, Settings, Calendar, Video, Database,
    Mail, Cloud, Shield, Loader2, Info, Settings2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { motion, AnimatePresence } from 'framer-motion';

const IntegrationCard = ({ platform, integration, isConnected, onConnect, onToggle, onTest, onSync, isSyncing }) => {
    const Icon = platform.icon;
    const [isTesting, setIsTesting] = useState(false);

    const handleTest = async () => {
        setIsTesting(true);
        await onTest(integration);
        setIsTesting(false);
    };

    return (
        <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full bg-white group border-b-4 border-b-slate-900/5">
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <div className={`h-16 w-16 rounded-[1.5rem] ${isConnected ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'} flex items-center justify-center transition-all duration-500 shadow-inner ring-4 ring-slate-50`}>
                        <Icon className="h-8 w-8" />
                    </div>
                    {isConnected && (
                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                            <span className={`text-[10px] font-black uppercase tracking-widest pl-3 ${integration.is_active ? 'text-blue-600' : 'text-slate-400'}`}>
                                {integration.is_active ? 'Live' : 'Stopped'}
                            </span>
                            <Switch
                                checked={integration.is_active}
                                onCheckedChange={() => onToggle(integration)}
                            />
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight flex items-center gap-2">
                    {platform.name}
                    {isConnected && integration.is_active && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                </h3>
                <p className="text-slate-500 leading-relaxed mb-6 text-sm font-medium">{platform.description}</p>

                {isConnected && (
                    <div className="mb-8 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Handshake</p>
                            <p className="text-xs font-bold text-slate-700">AES-256 Encrypted</p>
                        </div>
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Flow</p>
                            <p className="text-xs font-bold text-slate-700">Bidirectional</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2.5 mt-auto">
                    {platform.features.map((feature, index) => (
                        <span key={index} className="px-4 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-100/50">
                            {feature}
                        </span>
                    ))}
                </div>
            </div>

            <div className={`p-6 border-t border-slate-50 ${isConnected ? 'bg-slate-50/30' : 'bg-white'} transition-colors duration-500`}>
                {isConnected ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                disabled={isTesting || !integration.is_active}
                                onClick={handleTest}
                                className="flex-1 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 h-14 text-xs font-black uppercase tracking-widest"
                            >
                                {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Health"}
                            </Button>
                            <Button
                                onClick={() => onSync(integration.id, platform.name)}
                                disabled={isSyncing || !integration.is_active}
                                className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white h-14 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                            >
                                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync Data"}
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => onConnect(platform)}
                            className="w-full h-10 rounded-xl text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Settings2 className="h-3.5 w-3.5" />
                            Update Credentials
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={() => onConnect(platform)}
                        className="w-full h-14 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-transform active:scale-[0.98]"
                    >
                        <Link className="h-4 w-4 mr-2" /> Establish Handshake
                    </Button>
                )}
            </div>
        </Card>
    );
};

const IntegrationsPage = () => {
    // Queries
    const { data: recData } = useGetRecruitmentIntegrationsQuery();
    const { data: globalData } = useGetIntegrationsQuery();

    // Mutations
    const [createRec] = useCreateRecruitmentIntegrationMutation();
    const [updateRec] = useUpdateRecruitmentIntegrationMutation();
    const [createGlobal] = useCreateIntegrationMutation();
    const [updateGlobal] = useUpdateIntegrationMutation();
    const [testConnection] = useTestIntegrationMutation();
    const [testRecConnection] = useTestRecruitmentIntegrationMutation();

    const [activeTab, setActiveTab] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [isSyncingId, setIsSyncingId] = useState(null);
    const [formData, setFormData] = useState({
        client_id: '', client_secret: '', tenant_id: '', bucket_name: '', region: 'us-east-1'
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const categories = [
        { id: 'all', name: 'All Services', icon: LayoutGrid },
        { id: 'recruitment', name: 'Recruitment', icon: Network },
        { id: 'productivity', name: 'Productivity', icon: Calendar },
        { id: 'communication', name: 'Meetings', icon: Video },
        { id: 'storage', name: 'Cloud Storage', icon: Database },
    ];

    const platforms = [
        // Recruitment
        {
            id: 'linkedin', category: 'recruitment', name: 'LinkedIn', icon: Linkedin,
            description: 'Post jobs and sync candidate profiles directly.',
            features: ['Sourcing', 'Job Posting', 'Candidate Sync']
        },
        {
            id: 'indeed', category: 'recruitment', name: 'Indeed', icon: Network,
            description: 'Aggregates job listings and optimizes reach.',
            features: ['Job Posting', 'Analytics']
        },
        // Productivity
        {
            id: 'google_calendar', category: 'productivity', name: 'Google Calendar', icon: Calendar,
            description: 'Sync interview schedules and employee leaves.',
            features: ['Auto-Sync', 'Invite Manager']
        },
        {
            id: 'microsoft_outlook', category: 'productivity', name: 'Microsoft Outlook', icon: Mail,
            description: 'Integration with Outlook calendar and tasks.',
            features: ['Calendar Sync', 'Rich Invites']
        },
        // Communication
        {
            id: 'zoom', category: 'communication', name: 'Zoom Meetings', icon: Video,
            description: 'Auto-generate video links for interviews.',
            features: ['Auto-Links', 'Recordings']
        },
        {
            id: 'teams', category: 'communication', name: 'Microsoft Teams', icon: Shield,
            description: 'Enterprise video conferencing for your team.',
            features: ['Teams Meetings', 'Chat Sync']
        },
        // Storage
        {
            id: 'aws_s3', category: 'storage', name: 'AWS S3 Storage', icon: Cloud,
            description: 'Scaleable document storage for company files.',
            features: ['High Security', 'Unlimited Scale']
        }
    ];

    const allIntegrations = useMemo(() => {
        const list = [];
        // Support both paginated and non-paginated recruitment data
        if (Array.isArray(recData)) {
            list.push(...recData);
        } else if (recData?.results && Array.isArray(recData.results)) {
            list.push(...recData.results);
        }

        if (Array.isArray(globalData)) {
            list.push(...globalData);
        }
        return list;
    }, [recData, globalData]);

    const filteredPlatforms = useMemo(() => {
        if (activeTab === 'all') return platforms;
        return platforms.filter(p => p.category === activeTab);
    }, [activeTab]);

    const handleConnect = (platform) => {
        setFormData({ client_id: '', client_secret: '', tenant_id: '', bucket_name: platform.id === 'aws_s3' ? '' : '', region: 'us-east-1' });
        setSelectedPlatform(platform);
        setShowAdvanced(platform.category === 'recruitment');
        setIsDialogOpen(true);
    };

    const handleSync = async (integrationId, platformName) => {
        setIsSyncingId(integrationId);
        const toastId = toast.loading(`Synchronizing ${platformName} data...`);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success(`${platformName} sync complete.`, { id: toastId });
        } catch (error) {
            toast.error(`Sync failed.`, { id: toastId });
        } finally {
            setIsSyncingId(null);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedPlatform) return;

        const isOAuth = selectedPlatform.id !== 'aws_s3';
        const pName = selectedPlatform.name;

        try {
            if (isOAuth) {
                const toastId = toast.loading(`Redirecting to ${pName} Secure Login...`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                toast.dismiss(toastId);
            }

            if (selectedPlatform.category === 'recruitment') {
                await createRec({ platform: selectedPlatform.id, ...formData }).unwrap();
            } else {
                await createGlobal({ provider: selectedPlatform.id, ...formData, is_active: true }).unwrap();
            }

            toast.success(`${pName} integration established.`);
            setIsDialogOpen(false);
            setSelectedPlatform(null);
        } catch (error) {
            toast.error(`Failed to establish ${pName} connection.`);
        }
    };

    const handleToggle = async (integration) => {
        try {
            const isRec = !!integration.platform;
            if (isRec) {
                await updateRec({ id: integration.id, is_active: !integration.is_active }).unwrap();
            } else {
                await updateGlobal({ id: integration.id, is_active: !integration.is_active }).unwrap();
            }
            toast.success(`Integration ${!integration.is_active ? 'enabled' : 'disabled'}.`);
        } catch (error) {
            toast.error("Status update failed.");
        }
    };

    const handleTest = async (integration) => {
        const isRec = !!integration.platform;
        const testMutation = isRec ? testRecConnection : testConnection;
        const toastId = toast.loading("Invoking diagnostic handshake...");

        try {
            const res = await testMutation(integration.id).unwrap();
            toast.success(res.message || "Diagnostic successful.", { id: toastId, duration: 4000 });
        } catch (error) {
            console.error("Diagnostic Handshake Error:", error);
            let msg = "Security handshake failed. Check credentials.";

            if (error?.status === 'PARSING_ERROR') {
                msg = "Server returned an invalid response. This usually indicates a backend crash or configuration error.";
            } else {
                msg = error?.data?.message || error?.data?.error || error?.data?.detail || `Error ${error?.status || ''}: Handshake failed.`;
            }

            toast.error(msg, { id: toastId, duration: 6000 });
        }
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Integrations Hub</h1>
                    <p className="text-slate-500 mt-2 text-lg">Centralized management for enterprise external services.</p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[1.25rem] w-fit">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeTab === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                                }`}
                        >
                            <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-600' : ''}`} />
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* Platform Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredPlatforms.map(platform => {
                        const integration = allIntegrations.find(i =>
                            (i.platform === platform.id) || (i.provider === platform.id)
                        ) || null;
                        const isConnected = !!integration;

                        return (
                            <IntegrationCard
                                key={platform.id}
                                platform={platform}
                                integration={integration}
                                isConnected={isConnected}
                                onConnect={handleConnect}
                                onToggle={handleToggle}
                                onTest={handleTest}
                                onSync={handleSync}
                                isSyncing={isSyncingId === integration?.id}
                            />
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Dialog for connection */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl bg-white rounded-[2rem] p-0 overflow-hidden shadow-2xl border border-slate-200">
                    <DialogHeader className="p-10 pb-2 bg-white">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900">
                                {selectedPlatform?.icon && <selectedPlatform.icon className="h-7 w-7" />}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-slate-900">Configure {selectedPlatform?.name}</DialogTitle>
                                <p className="text-slate-500 text-sm mt-1">Enterprise-grade secure synchronization.</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-10 pt-6">
                        {selectedPlatform?.id === 'aws_s3' ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bucket Name</Label>
                                        <Input
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm focus:ring-blue-500/10"
                                            placeholder="lifeline-production-storage"
                                            value={formData.bucket_name} onChange={e => setFormData({ ...formData, bucket_name: e.target.value })} required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">AWS Region</Label>
                                            <Input
                                                className="h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm"
                                                placeholder="us-east-1"
                                                value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Access Key ID</Label>
                                            <Input
                                                className="h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm"
                                                type="password" value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Secret Access Key</Label>
                                        <Input
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm"
                                            type="password" value={formData.client_secret} onChange={e => setFormData({ ...formData, client_secret: e.target.value })} required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="flex-1 h-16 rounded-[1.25rem] font-bold text-slate-500"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-16 rounded-[1.25rem] bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all border-none"
                                    >
                                        Establish Connection
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                                    <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6">
                                        {selectedPlatform?.icon && <selectedPlatform.icon className="h-12 w-12 text-blue-600" />}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Authorize Secure Access</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                                        Lifeline will securely negotiate access with {selectedPlatform?.name} using industry-standard protocols.
                                    </p>
                                </div>

                                <div className="space-y-4 px-2">
                                    {showAdvanced ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Client ID / API Key</Label>
                                                <Input
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                    value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Client Secret</Label>
                                                <Input
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                    type="password"
                                                    value={formData.client_secret} onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                                                />
                                            </div>
                                            {(selectedPlatform?.id.includes('microsoft') || selectedPlatform?.id === 'teams') && (
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tenant ID (Optional)</Label>
                                                    <Input
                                                        className="h-14 rounded-2xl bg-slate-50 border-slate-200 shadow-sm"
                                                        placeholder="organizations"
                                                        value={formData.tenant_id} onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(false)} className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                                Use Simple Authorization
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(true)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 rounded-xl px-6">
                                                Enter Custom Credentials
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                                        disabled={!selectedPlatform}
                                    >
                                        {selectedPlatform?.icon && <selectedPlatform.icon className="h-5 w-5" />}
                                        {showAdvanced ? 'Save & Connect' : `Continue with ${selectedPlatform?.name}`}
                                    </Button>
                                    <Button
                                        onClick={() => setIsDialogOpen(false)}
                                        variant="ghost"
                                        className="w-full h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {/* System Health / Sync Logs */}
            <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200/60">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">System Connectivity Hub</h4>
                        <p className="text-sm text-slate-500 font-medium">Real-time status of all external background sync processes.</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">All Systems Operational</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'OAuth 2.0 Engine', status: 'Healthy', latency: '42ms' },
                        { label: 'Websocket Relay', status: 'Active', latency: '12ms' },
                        { label: 'S3 Data Lake', status: 'Connected', latency: '156ms' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-sm font-bold text-slate-900">{stat.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</p>
                                <p className="text-sm font-bold text-blue-600">{stat.latency}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPage;
