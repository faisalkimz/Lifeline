import React, { useState } from 'react';
import { useGetResignationsQuery, useCreateResignationMutation } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LogOut, AlertOctagon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import toast from 'react-hot-toast';

const OffboardingPage = () => {
    const { data: resignations, isLoading } = useGetResignationsQuery({ my_resignations: true });
    const [submitResignation] = useCreateResignationMutation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        last_working_day: '',
        reason: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitResignation(formData).unwrap();
            toast.success("Resignation submitted");
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to submit");
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Offboarding & Exit</h1>
                    <p className="text-slate-500 mt-1">Manage resignation requests and exit procedures.</p>
                </div>
                {!resignations?.length && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="gap-2 shadow-sm">
                                <LogOut className="h-4 w-4" /> Submit Resignation
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-red-600 flex items-center gap-2">
                                    <AlertOctagon className="h-5 w-5" /> Confirm Resignation
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Working Day</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-md p-2"
                                        value={formData.last_working_day}
                                        onChange={e => setFormData({ ...formData, last_working_day: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reason for Leaving</label>
                                    <textarea
                                        className="w-full border rounded-md p-2"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        rows="4"
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="destructive" className="w-full">
                                    Submit Request
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : !resignations?.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-20 text-center text-gray-500">
                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <LogOut className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">No Active Process</h3>
                        <p>You are currently employed and have no pending exit requests.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {resignations.map(res => (
                        <Card key={res.id} className="border-l-4 border-l-red-500">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Resignation Request</h3>
                                        <p className="text-gray-500 text-sm mt-1">Submitted on {new Date(res.submission_date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {res.status}
                                    </span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Last Working Day</label>
                                        <p className="font-semibold">{new Date(res.last_working_day).toLocaleDateString()}</p>
                                    </div>
                                    {res.manager_comment && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Manager Comment</label>
                                            <p className="text-gray-700">{res.manager_comment}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OffboardingPage;
