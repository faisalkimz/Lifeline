import React, { useState } from 'react';
import {
    useGetRecruitmentIntegrationsQuery,
    useCreateRecruitmentIntegrationMutation,
    useUpdateRecruitmentIntegrationMutation
} from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import {
    Linkedin, Globe, Briefcase, Settings, Zap, AlertCircle,
    CheckCircle, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const IntegrationsPage = () => {
    const { data: integrations = [], isLoading } = useGetRecruitmentIntegrationsQuery();
    const [createIntegration] = useCreateRecruitmentIntegrationMutation();
    const [updateIntegration] = useUpdateRecruitmentIntegrationMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
    const [formData, setFormData] = useState({
        client_id: '',
        client_secret: '',
        api_key: '',
        webhook_url: '',
        is_active: true
    });

    const platforms = [
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Professional networking platform',
            features: ['Auto-post jobs', 'Candidate insights', 'Analytics']
        },
        {
            id: 'indeed',
            name: 'Indeed',
            icon: Briefcase,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            description: 'Leading job search engine',
            features: ['High traffic', 'Resume database', 'Sponsored posts']
        },
        {
            id: 'glassdoor',
            name: 'Glassdoor',
            icon: Globe,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Company reviews & jobs',
            features: ['Company branding', 'Salary insights', 'Reviews sync']
        },
        {
            id: 'fuzu',
            name: 'Fuzu',
            icon: Briefcase,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            description: 'African job platform',
            features: ['Regional focus', 'Mobile-first', 'Cost-effective']
        }
    ];

    // normalize integrations
    const integrationList = Array.isArray(integrations?.results)
        ? integrations.results
        : Array.isArray(integrations)
            ? integrations
            : [];

    const activeIntegrations = integrationList.filter(i => i.is_active);
    const totalPlatforms = platforms.length;
    const connectedPlatforms = integrationList.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createIntegration({
                platform: selectedPlatform,
                ...formData
            }).unwrap();
            toast.success("Integration saved");
            setIsDialogOpen(false);
            setFormData({ client_id: '', client_secret: '', api_key: '', webhook_url: '', is_active: true });
        } catch (error) {
            toast.error("Failed to save integration");
        }
    };

    const handleToggle = async (integration) => {
        try {
            await updateIntegration({
                id: integration.id,
                is_active: !integration.is_active
            }).unwrap();
            toast.success(`Integration ${!integration.is_active ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading integrations...</div>;

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Board Integrations</h1>
                    <p className="text-gray-500 mt-1">Connect to external platforms to auto-post jobs and expand your reach</p>
                </div>
            </div>

            {/* Integration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Connected Platforms</p>
                                <p className="text-2xl font-bold text-gray-900">{connectedPlatforms}/{totalPlatforms}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Utilization</span>
                                <span>{Math.round((connectedPlatforms / totalPlatforms) * 100)}%</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${(connectedPlatforms / totalPlatforms) * 100}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Integrations</p>
                                <p className="text-2xl font-bold text-gray-900">{activeIntegrations.length}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Automatically syncing jobs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Jobs Posted</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            External job views tracking
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                        <Zap className="h-4 w-4 mr-2" /> Connect New Platform
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect Job Board</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Platform</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                value={selectedPlatform}
                                onChange={e => setSelectedPlatform(e.target.value)}
                            >
                                {platforms.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">API Key / Client ID</label>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                type="password"
                                value={formData.client_id}
                                onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Client Secret (if applicable)</label>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                type="password"
                                value={formData.client_secret}
                                onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                            />
                        </div>
                        <div className="pt-2">
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Connection</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>


            {/* Integration Platforms */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Platforms</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {platforms.map(platform => {
                        const integration = integrationList.find(i => i.platform === platform.id) || null;
                        const isConnected = !!integration;
                        const Icon = platform.icon;

                        return (
                            <Card key={platform.id} className={`transition-all duration-200 hover:shadow-md border border-gray-200`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 ${platform.bgColor} rounded-xl ${platform.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                                <p className="text-xs text-gray-500">{platform.description}</p>
                                            </div>
                                        </div>
                                        {isConnected && (
                                            <div className="flex items-center gap-2">
                                                <Badge className={integration.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                                                    {integration.is_active ? 'Active' : 'Paused'}
                                                </Badge>
                                                <Switch
                                                    checked={integration.is_active}
                                                    onCheckedChange={() => handleToggle(integration)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="mb-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {platform.features.map((feature, index) => (
                                                <span key={index} className="text-[10px] font-medium px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    {isConnected ? (
                                        <div className="space-y-3 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                                <CheckCircle className="h-4 w-4" />
                                                Connected
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1 text-xs h-9">
                                                    <Settings className="h-3 w-3 mr-2" />
                                                    Configure
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-4 mt-2 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPlatform(platform.id);
                                                    setIsDialogOpen(true);
                                                }}
                                                className="w-full text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                Connect
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPage;
