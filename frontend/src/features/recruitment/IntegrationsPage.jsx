import React, { useState } from 'react';
import {
    useGetRecruitmentIntegrationsQuery,
    useCreateRecruitmentIntegrationMutation,
    useUpdateRecruitmentIntegrationMutation
} from '../../store/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Linkedin, Globe, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const IntegrationsPage = () => {
    const { data: integrations, isLoading } = useGetRecruitmentIntegrationsQuery();
    const [createIntegration] = useCreateRecruitmentIntegrationMutation();
    const [updateIntegration] = useUpdateRecruitmentIntegrationMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
    const [formData, setFormData] = useState({
        client_id: '',
        client_secret: '',
        api_key: ''
    });

    const platforms = [
        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
        { id: 'indeed', name: 'Indeed', icon: Briefcase, color: 'text-blue-500' },
        { id: 'glassdoor', name: 'Glassdoor', icon: Globe, color: 'text-green-600' },
        { id: 'fuzu', name: 'Fuzu', icon: Briefcase, color: 'text-orange-500' }
    ];

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

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Board Integrations</h1>
                    <p className="text-slate-500 mt-1">Connect to external platforms to auto-post jobs.</p>
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {platforms.map(platform => {
                    const integration = integrations?.find(i => i.platform === platform.id);
                    const isConnected = !!integration;
                    const Icon = platform.icon;

                    return (
                        <Card key={platform.id} className={isConnected ? "border-indigo-100 bg-indigo-50/10" : "opacity-60"}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-white rounded-lg shadow-sm ${platform.color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">{platform.name}</h3>
                                    </div>
                                    {isConnected && (
                                        <Switch
                                            checked={integration.is_active}
                                            onCheckedChange={() => handleToggle(integration)}
                                        />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-6 h-10">
                                    {isConnected
                                        ? "Connected and ready to auto-publish jobs."
                                        : "Connect to automatically distribute job postings."}
                                </p>
                                {isConnected ? (
                                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                        Active Connection
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setSelectedPlatform(platform.id);
                                        setIsDialogOpen(true);
                                    }}>
                                        Connect
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default IntegrationsPage;
