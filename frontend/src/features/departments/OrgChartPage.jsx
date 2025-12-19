import React, { useState } from 'react';
import { useGetManagersQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Users, ChevronDown, ChevronRight, User,
    Briefcase, MapPin, Mail, Phone, Network,
    Maximize2, Minimize2, Search, Filter,
    Download, Share2, Printer,
    Shield, Building2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

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
        return getMediaUrl(path);
    };

    const OrgNode = ({ person, isRoot = false }) => {
        const hasSubordinates = person.subordinates && person.subordinates.length > 0;
        const isExpanded = expandedNodes.has(person.id);

        return (
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                        "relative p-6 rounded-[2rem] border transition-all duration-500 group cursor-pointer w-80",
                        isRoot
                            ? "bg-slate-950 border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                            : "bg-white border-slate-100 hover:border-primary-500/50 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900 dark:border-slate-800"
                    )}
                    onClick={() => hasSubordinates && toggleNode(person.id)}
                >
                    {/* Connection Line Top */}
                    {!isRoot && (
                        <div className="absolute -top-12 left-1/2 w-[2px] h-12 bg-gradient-to-b from-slate-200 to-primary-500/20 dark:from-slate-800"></div>
                    )}

                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className={cn(
                                "h-16 w-16 rounded-2xl overflow-hidden border-2 relative z-10",
                                isRoot ? "border-primary-500/50" : "border-slate-100 dark:border-slate-800"
                            )}>
                                {person.photo ? (
                                    <img src={getImageUrl(person.photo)} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                        <User className="h-7 w-7 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            {isRoot && (
                                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 animate-pulse" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className={cn("font-black text-base tracking-tight truncate", isRoot ? "text-white" : "text-slate-900 dark:text-white")}>
                                {person.first_name} {person.last_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                                    isRoot ? "bg-primary-500/20 text-primary-400" : "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                                )}>
                                    {person.job_title || 'Position'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                <Building2 className={cn("h-3 w-3", isRoot ? "text-slate-400" : "text-slate-400")} />
                                <span className={cn("text-[10px] font-bold uppercase tracking-tight", isRoot ? "text-slate-400" : "text-slate-500")}>
                                    {person.department_name || 'Operations'}
                                </span>
                            </div>
                        </div>

                        {hasSubordinates && (
                            <div className={cn(
                                "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300",
                                isExpanded ? "rotate-180 bg-primary-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600"
                            )}>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        )}
                    </div>

                    {/* Connection Line Bottom */}
                    {hasSubordinates && isExpanded && (
                        <div className="absolute -bottom-12 left-1/2 w-[2px] h-12 bg-gradient-to-t from-slate-200 to-primary-500/20 dark:from-slate-800"></div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {hasSubordinates && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="relative pt-12 flex gap-12"
                        >
                            {/* Horizontal Connection Line */}
                            {person.subordinates.length > 1 && (
                                <div className="absolute top-12 left-[160px] right-[160px] h-[2px] bg-slate-200 dark:bg-slate-800"></div>
                            )}

                            {person.subordinates.map(sub => (
                                <OrgNode key={sub.id} person={sub} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const rootManagers = managers?.filter(m => !m.manager) || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] p-8 lg:p-12 space-y-10 selection:bg-primary-500/20">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-500/10 rounded-xl">
                            <Network className="h-6 w-6 text-primary-500" />
                        </div>
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Management Structure</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight italic">
                        Organization <span className="text-primary-500">Chart</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl">
                        A real-time visual representation of the reporting hierarchy and personnel distribution across departments.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Button variant="outline" className="h-14 flex-1 lg:flex-none px-8 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                        <Download className="h-4 w-4 mr-3" /> Export Hierarchy
                    </Button>
                    <Button className="h-14 flex-1 lg:flex-none px-10 rounded-2xl bg-slate-900 dark:bg-primary-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 border-none hover:scale-105 transition-all">
                        <Maximize2 className="h-4 w-4 mr-3" /> Full Screen
                    </Button>
                </div>
            </div>

            {/* Tactical Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-2">
                <div className="md:col-span-6 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH PERSONNEL, ROLES, OR DEPARTMENTS..."
                        className="w-full h-16 pl-14 pr-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-bold text-xs tracking-wider uppercase focus:border-primary-500 outline-none transition-all shadow-sm dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="md:col-span-3">
                    <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-2 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Filter className="h-4 w-4 mr-3 text-primary-500" /> Advanced Filters
                    </Button>
                </div>
                <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Personnel</span>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary-500" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{managers?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative min-h-[700px] overflow-auto bg-white dark:bg-slate-900/50 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-24 flex justify-center scrollbar-hide">
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="h-16 w-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] animate-pulse">Building Hierarchy View...</p>
                    </div>
                ) : rootManagers.length > 0 ? (
                    <div className="flex flex-col items-center gap-24 relative z-10">
                        {rootManagers.map(root => (
                            <OrgNode key={root.id} person={root} isRoot />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center opacity-30">
                        <div className="h-32 w-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                            <Network className="h-16 w-16 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">No Corporate Hierarchy Detected</h3>
                    </div>
                )}
            </div>

            {/* Legend Overlay */}
            <div className="fixed bottom-12 right-12 z-50">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 rounded-3xl border border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-72"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-primary-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Chart Legends</h4>
                        </div>
                        <Minimize2 className="h-3.5 w-3.5 text-slate-300 pointer-events-none" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group cursor-help">
                            <div className="h-4 w-4 rounded-lg bg-slate-950 shadow-lg shadow-slate-950/20 group-hover:scale-110 transition-transform"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Executive Root</span>
                        </div>
                        <div className="flex items-center gap-4 group cursor-help">
                            <div className="h-4 w-4 rounded-lg bg-white border-2 border-slate-100 dark:bg-slate-800 dark:border-slate-700 group-hover:scale-110 transition-transform"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Standard Personnel</span>
                        </div>
                        <div className="flex items-center gap-4 group cursor-help">
                            <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-700 group-hover:scale-110 transition-transform"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Direct Reporting</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrgChartPage;
