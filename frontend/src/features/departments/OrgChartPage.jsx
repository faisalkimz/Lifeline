import React, { useState } from 'react';
import { useGetManagersQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Users, ChevronDown, ChevronRight, User,
    Briefcase, MapPin, Mail, Phone, Network,
    Maximize2, Minimize2, Search, Filter,
    Download, Share2, Printer
} from 'lucide-react';
import { cn } from '../../utils/cn';

const OrgChartPage = () => {
    const { data: managers, isLoading } = useGetManagersQuery();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const toggleNode = (id) => {
        const newSet = new Set(expandedNodes);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedNodes(newSet);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) return path;
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const OrgNode = ({ person, isRoot = false }) => {
        const hasSubordinates = person.subordinates && person.subordinates.length > 0;
        const isExpanded = expandedNodes.has(person.id);

        return (
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        "relative p-6 rounded-3xl border-2 transition-all duration-300 group cursor-pointer w-72",
                        isRoot ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20" : "bg-white border-slate-100 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-400/10 shadow-sm"
                    )}
                    onClick={() => hasSubordinates && toggleNode(person.id)}
                >
                    {/* Connection Line Top */}
                    {!isRoot && (
                        <div className="absolute -top-10 left-1/2 w-0.5 h-10 bg-slate-200"></div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl overflow-hidden border-2",
                            isRoot ? "border-slate-800" : "border-slate-50"
                        )}>
                            {person.photo ? (
                                <img src={getImageUrl(person.photo)} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={cn("font-black text-sm uppercase tracking-tight truncate", isRoot ? "text-white" : "text-slate-900")}>
                                {person.first_name} {person.last_name}
                            </h3>
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate", isRoot ? "text-primary-400" : "text-primary-600")}>
                                {person.job_title}
                            </p>
                            <p className={cn("text-[9px] font-bold uppercase tracking-tight mt-1 opacity-50", isRoot ? "text-slate-400" : "text-slate-500")}>
                                {person.department_name || 'Global Ops'}
                            </p>
                        </div>
                        {hasSubordinates && (
                            <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center transition-transform", isExpanded ? "rotate-180" : "", isRoot ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400")}>
                                <ChevronDown className="h-3 w-3" />
                            </div>
                        )}
                    </div>

                    {/* Connection Line Bottom */}
                    {hasSubordinates && isExpanded && (
                        <div className="absolute -bottom-10 left-1/2 w-0.5 h-10 bg-slate-200"></div>
                    )}
                </div>

                {hasSubordinates && isExpanded && (
                    <div className="relative pt-10 flex gap-8">
                        {/* Horizontal Connection Line */}
                        {person.subordinates.length > 1 && (
                            <div className="absolute top-10 left-[144px] right-[144px] h-0.5 bg-slate-200"></div>
                        )}

                        {person.subordinates.map(sub => (
                            <OrgNode key={sub.id} person={sub} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const rootManagers = managers?.filter(m => !m.manager) || [];

    return (
        <div className="space-y-8 pb-20 animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <Network className="h-8 w-8 text-primary-600" /> Organizational Topology
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-tight text-[10px] opacity-70">
                        Visualizing corporate genetic structure and reporting vectors.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-2">
                        <Download className="h-4 w-4 mr-2" /> Export PDF
                    </Button>
                    <Button className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest bg-slate-900 shadow-2xl shadow-slate-900/20">
                        <Printer className="h-4 w-4 mr-2" /> Print Map
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH PERSONNEL OR DEPARTMENTS..."
                        className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] tracking-widest uppercase focus:border-primary-400 outline-none transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
                    <Filter className="h-4 w-4 mr-2" /> Filter Hierarchy
                </Button>
                <div className="bg-primary-50 rounded-2xl border-2 border-primary-100 flex items-center justify-between px-14 group cursor-pointer hover:bg-primary-100 transition-all">
                    <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Active Headcount</span>
                    <span className="text-xl font-black text-primary-900 tracking-tighter">{managers?.length || 0}</span>
                </div>
            </div>

            <div className="relative min-h-[600px] overflow-auto bg-slate-50/50 rounded-[3rem] border-4 border-white shadow-inner p-20 flex justify-center selection:bg-primary-100">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-12 w-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Topology...</p>
                    </div>
                ) : rootManagers.length > 0 ? (
                    <div className="flex flex-col items-center gap-20">
                        {rootManagers.map(root => (
                            <OrgNode key={root.id} person={root} isRoot />
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <Users className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Organizational Structure Detected</h3>
                    </div>
                )}
            </div>

            <div className="fixed bottom-10 right-10 z-50">
                <Card className="border-none shadow-2xl shadow-slate-900/10 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl w-64 border-t border-white">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Legend</h4>
                            <Minimize2 className="h-3 w-3 text-slate-300" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-slate-900 shadow-lg shadow-slate-900/20"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Executive</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-white border-2 border-slate-100"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Personnel</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-0.5 w-6 bg-slate-200"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Reporting Line</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrgChartPage;
