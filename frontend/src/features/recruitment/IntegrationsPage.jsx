import React, { useState, useMemo } from 'react';
import {
    useGetRecruitmentIntegrationsQuery,
    useCreateRecruitmentIntegrationMutation,
    useUpdateRecruitmentIntegrationMutation
} from '../../store/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Linkedin, Globe, Zap, CheckCircle,
    Activity, Share2, Network,
    LayoutGrid, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';

const IntegrationsPage = () => {
    const { data: integrations = [], isLoading } = useGetRecruitmentIntegrationsQuery();
    const [createIntegration] = useCreateRecruitmentIntegrationMutation();
    const [updateIntegration] = useUpdateRecruitmentIntegrationMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
    const [formData, setFormData] = useState({
        client_id: '', client_secret: '', api_key: '', webhook_url: '', is_active: true
    });

    const platforms = [
        {
            id: 'linkedin', name: 'LinkedIn', icon: Linkedin,
            description: 'Connect with the world‘s largest professional network.',
            features: ['Sourcing', 'Job Posting', 'Candidate Sync']
        },
        {
            id: 'indeed', name: 'Indeed', icon: Network,
            description: 'Reach more candidates with Indeed integration.',
            features: ['Job Posting', 'Analytics', 'Quick Apply']
        },
        {
            id: 'glassdoor', name: 'Glassdoor', icon: Globe,
            description: 'Manage employer branding and reviews.',
            features: ['Reviews', 'Branding', 'Salary Data']
        },
        {
            id: 'fuzu', name: 'Fuzu', icon: Share2,
            description: 'Localised recruitment for African markets.',
            features: ['Local Talent', 'Mobile First', 'Assessment']
        }
    ];

    const integrationList = useMemo(() => {
        if (Array.isArray(integrations?.results)) return integrations.results;
        if (Array.isArray(integrations)) return integrations;
        return [];
    }, [integrations]);

    const activeIntegrations = useMemo(() => integrationList.filter(i => i.is_active), [integrationList]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createIntegration({ platform: selectedPlatform, ...formData }).unwrap();
            toast.success("Integration connected successfully.");
            setIsDialogOpen(false);
            setFormData({ client_id: '', client_secret: '', api_key: '', webhook_url: '', is_active: true });
        } catch (error) {
            toast.error("Failed to connect integration.");
        }
    };

    const handleToggle = async (integration) => {
        try {
            await updateIntegration({ id: integration.id, is_active: !integration.is_active }).unwrap();
            toast.success(`Integration ${!integration.is_active ? 'enabled' : 'disabled'}.`);
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Integrations</h1>
                    <p className="text-slate-500 mt-2">Connect your recruitment tools and expand your reach.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-11 bg-slate-900 text-white font-medium shadow-lg shadow-slate-900/20">
                            <Zap className="h-4 w-4 mr-2" /> Connect New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-8 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-bold text-slate-900">Connect Integration</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Platform</label>
                                <select
                                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                    value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}
                                >
                                    {platforms.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Client ID / API Key</label>
                                <Input
                                    className="bg-white"
                                    type="password" value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Client Secret (Optional)</label>
                                <Input
                                    className="bg-white"
                                    type="password" value={formData.client_secret} onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                    Connect
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active</p>
                            <p className="text-2xl font-bold text-slate-900">{activeIntegrations.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available</p>
                            <p className="text-2xl font-bold text-slate-900">{platforms.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
                            <p className="text-sm font-bold text-slate-900">Operational</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Platform Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {platforms.map(platform => {
                    const integration = integrationList.find(i => i.platform === platform.id) || null;
                    const isConnected = !!integration;
                    const Icon = platform.icon;

                    return (
                        <Card key={platform.id} className="rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full bg-white">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    {isConnected && (
                                        <Switch
                                            checked={integration.is_active}
                                            onCheckedChange={() => handleToggle(integration)}
                                        />
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1">{platform.name}</h3>
                                <p className="text-sm text-slate-500 mb-4">{platform.description}</p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {platform.features.map((feature, index) => (
                                        <span key={index} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                {isConnected ? (
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 border-slate-200 bg-white hover:bg-slate-50">
                                            <Settings className="h-4 w-4 mr-2" /> Configure
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => { setSelectedPlatform(platform.id); setIsDialogOpen(true); }}
                                        className="w-full bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        <Zap className="h-4 w-4 mr-2" /> Connect
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default IntegrationsPage;
