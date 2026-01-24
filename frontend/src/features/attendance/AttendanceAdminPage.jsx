import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Settings, MapPin, QrCode, Shield, Save,
    Plus, Trash2, Globe, Wifi, Camera, Loader2
} from 'lucide-react';
import {
    useGetAttendancePolicyQuery,
    useUpdateAttendancePolicyMutation,
    useGetWorkLocationsQuery,
    useCreateWorkLocationMutation
} from '../../store/api';
import toast from 'react-hot-toast';

const AttendanceAdminPage = () => {
    const { data: policies, isLoading: isLoadingPolicies } = useGetAttendancePolicyQuery();
    const { data: locations = [] } = useGetWorkLocationsQuery();
    const [updatePolicy, { isLoading: isUpdating }] = useUpdateAttendancePolicyMutation();
    const [createLocation, { isLoading: isAddingLoc }] = useCreateWorkLocationMutation();

    const policy = Array.isArray(policies) ? policies[0] : (policies?.results?.[0] || policies);

    const [newLoc, setNewLoc] = useState({ name: '', latitude: '', longitude: '', radius_meters: 100 });
    const [isAddingMode, setIsAddingMode] = useState(false);

    const handleTogglePolicy = async (field, value) => {
        if (!policy?.id) {
            toast.error('Policy not found. Please refresh.');
            return;
        }
        try {
            await updatePolicy({ id: policy.id, [field]: value }).unwrap();
            toast.success('Policy updated.');
        } catch (error) {
            toast.error('Failed to update policy.');
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        try {
            await createLocation(newLoc).unwrap();
            toast.success('Location added.');
            setIsAddingMode(false);
            setNewLoc({ name: '', latitude: '', longitude: '', radius_meters: 100 });
        } catch (error) {
            toast.error('Failed to add location.');
        }
    };

    if (isLoadingPolicies) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-emerald-600">Attendance Configuration</h1>
                <p className="text-slate-500 mt-2">Manage geofencing, QR codes, and office locations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Features Toggle */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-emerald-500" />
                                Security Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Geofencing</p>
                                        <p className="text-xs text-slate-500">Require GPS coords</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 accent-emerald-500"
                                    checked={policy?.enable_geofencing}
                                    onChange={(e) => handleTogglePolicy('enable_geofencing', e.target.checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <QrCode className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">QR Clock-In</p>
                                        <p className="text-xs text-slate-500">Require QR scan</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 accent-emerald-500"
                                    checked={policy?.enable_qr_clock_in}
                                    onChange={(e) => handleTogglePolicy('enable_qr_clock_in', e.target.checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Photo Verification</p>
                                        <p className="text-xs text-slate-500">Biometric selfie</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 accent-emerald-500"
                                    checked={policy?.require_photo_clock_in}
                                    onChange={(e) => handleTogglePolicy('require_photo_clock_in', e.target.checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Office Locations */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-500" />
                                Work Locations
                            </CardTitle>
                            <Button size="sm" onClick={() => setIsAddingMode(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10">
                                <Plus className="h-4 w-4" />
                                Add Location
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isAddingMode && (
                                <form onSubmit={handleAddLocation} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-300">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Location Name</label>
                                            <input
                                                type="text" required
                                                className="w-full h-11 px-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                placeholder="e.g. Main Office / HQ"
                                                value={newLoc.name}
                                                onChange={e => setNewLoc({ ...newLoc, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Latitude</label>
                                            <input
                                                type="number" step="any" required
                                                className="w-full h-11 px-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                placeholder="0.3476"
                                                value={newLoc.latitude}
                                                onChange={e => setNewLoc({ ...newLoc, latitude: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Longitude</label>
                                            <input
                                                type="number" step="any" required
                                                className="w-full h-11 px-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                placeholder="32.5825"
                                                value={newLoc.longitude}
                                                onChange={e => setNewLoc({ ...newLoc, longitude: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Radius (Meters)</label>
                                            <input
                                                type="number" required
                                                className="w-full h-11 px-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                value={newLoc.radius_meters}
                                                onChange={e => setNewLoc({ ...newLoc, radius_meters: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setIsAddingMode(false)}>Cancel</Button>
                                        <Button type="submit" className="bg-emerald-600" disabled={isAddingLoc}>
                                            {isAddingLoc ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Location"}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4">
                                {locations.map(loc => (
                                    <div key={loc.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-emerald-200 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{loc.name}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Coordinates: {loc.latitude}, {loc.longitude} | Radius: {loc.radius_meters}m
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right mr-4">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">QR Token</p>
                                                <p className="text-xs font-mono text-slate-600">{loc.qr_token.substring(0, 8)}...</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {locations.length === 0 && (
                                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                                        <Globe className="h-12 w-12 text-slate-100 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400 font-medium">No locations configured yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAdminPage;
