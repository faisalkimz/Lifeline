import React, { useState } from 'react';
import {
    useGetRecruitmentIntegrationsQuery,
    useCreateRecruitmentIntegrationMutation,
    useUpdateRecruitmentIntegrationMutation
} from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import {
    Linkedin, Globe, Briefcase, Settings, Zap, AlertCircle,
    CheckCircle, XCircle, RefreshCw, ExternalLink, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const IntegrationsPage = () => {
    const { data: integrations = [], isLoading, refetch } = useGetRecruitmentIntegrationsQuery();
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

    const integrationList = integrations || [];
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
            setFormData({ client_id: '', client_secret: '', api_key: '' });
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

    if (isLoading) return <div>Loading...</div>;

    // normalize integrations to an array (API may return object or results wrapper)
    const integrationList = Array.isArray(integrations?.results)
        ? integrations.results
        : Array.isArray(integrations)
            ? integrations
            : [];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Job Board Integrations</h1>
                    <p className="text-text-secondary mt-1">Connect to external platforms to auto-post jobs and expand your reach</p>
                </div>
            </div>

            {/* Integration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Connected Platforms</p>
                                <p className="text-2xl font-bold text-text-primary">{connectedPlatforms}/{totalPlatforms}</p>
                            </div>
                            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Zap className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Progress</span>
                                <span className="font-medium text-text-primary">
                                    {Math.round((connectedPlatforms / totalPlatforms) * 100)}%
                                </span>
                            </div>
                            <div className="mt-2 bg-neutral-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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
                                <p className="text-sm font-medium text-text-secondary">Active Integrations</p>
                                <p className="text-2xl font-bold text-text-primary">{activeIntegrations.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-success-600" />
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                            {activeIntegrations.length > 0
                                ? `${activeIntegrations.length} platform${activeIntegrations.length > 1 ? 's' : ''} actively posting jobs`
                                : 'No active integrations'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Jobs Posted</p>
                                <p className="text-2xl font-bold text-text-primary">0</p>
                            </div>
                            <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-warning-600" />
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary mt-2">
                            Total jobs posted via integrations
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary-600 hover:bg-primary-700 shadow-sm">Connect New Platform</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Connect Job Board</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Platform</label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={selectedPlatform}
                                    onChange={e => setSelectedPlatform(e.target.value)}
                                >
                                    {platforms.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">API Key / Client ID</label>
                                <input
                                    className="w-full border rounded-md p-2"
                                    type="password"
                                    value={formData.client_id}
                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Client Secret (if applicable)</label>
                                <input
                                    className="w-full border rounded-md p-2"
                                    type="password"
                                    value={formData.client_secret}
                                    onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full">Save Connection</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Integration Platforms */}
            <div>
                <h2 className="text-xl font-semibold text-text-primary mb-6">Available Platforms</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {platforms.map(platform => {
                        const integration = integrationList.find(i => i.platform === platform.id) || null;
                        const isConnected = !!integration;
                        const Icon = platform.icon;

                        return (
                            <Card key={platform.id} className={`transition-all duration-200 hover:shadow-lg ${isConnected ? "border-primary-200 bg-primary-50/30" : "border-border-light"}`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 ${platform.bgColor} rounded-xl ${platform.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-text-primary">{platform.name}</h3>
                                                <p className="text-xs text-text-secondary">{platform.description}</p>
                                            </div>
                                        </div>
                                        {isConnected && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant={integration.is_active ? 'success' : 'secondary'} size="sm">
                                                    {integration.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Switch
                                                    checked={integration.is_active}
                                                    onCheckedChange={() => handleToggle(integration)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-text-secondary mb-2">Features:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {platform.features.map((feature, index) => (
                                                <Badge key={index} variant="outline" size="sm">
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    {isConnected ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-success-600 font-medium">
                                                <CheckCircle className="h-4 w-4" />
                                                Connected & Configured
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Configure
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <AlertCircle className="h-4 w-4" />
                                                Not Connected
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPlatform(platform.id);
                                                    setIsDialogOpen(true);
                                                }}
                                                className="w-full"
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                Connect Platform
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
        </div>
    );
};

export default IntegrationsPage;
