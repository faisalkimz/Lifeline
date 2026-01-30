import React, { useState } from 'react';
import { useGetManagersQuery } from '../../store/api';
import {
    User, Download, Maximize2, Search, Network
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

        // Generate color based on person ID for consistent avatars
        const colors = [
            { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
            { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
            { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
            { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
            { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
            { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
        ];
        const colorScheme = colors[person.id % colors.length];

        return (
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                        "relative px-4 py-3.5 rounded-xl border transition-all cursor-pointer w-64 bg-white",
                        isRoot ? "border-blue-300 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    )}
                    onClick={() => hasSubordinates && toggleNode(person.id)}
                >
                    {/* Connection Line Top */}
                    {!isRoot && (
                        <div className="absolute -top-8 left-1/2 w-[1.5px] h-8 bg-gray-300"></div>
                    )}

                    <div className="flex items-start gap-3">
                        {/* Circular Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className={cn(
                                "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-sm",
                                person.photo ? "" : `${colorScheme.bg} ${colorScheme.text}`
                            )}>
                                {person.photo ? (
                                    <img src={getImageUrl(person.photo)} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <span>{person.first_name?.[0]}{person.last_name?.[0]}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">
                                {person.first_name} {person.last_name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5 truncate">
                                {person.job_title || 'Position'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                                    {person.department_name || 'Department'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Reports Count */}
                    {hasSubordinates && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                {isExpanded ? '▲' : '▼'} {person.subordinates.length} report{person.subordinates.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    )}

                    {/* Connection Line Bottom */}
                    {hasSubordinates && isExpanded && (
                        <div className="absolute -bottom-8 left-1/2 w-[1.5px] h-8 bg-gray-300"></div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {hasSubordinates && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="relative pt-8 flex gap-6"
                        >
                            {/* Horizontal Connection Line */}
                            {person.subordinates.length > 1 && (
                                <div className="absolute top-8 left-[128px] right-[128px] h-[1.5px] bg-gray-300"></div>
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Org Structure</h1>
                    <p className="text-slate-500 dark:text-slate-400">Visual representation of reporting hierarchy</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-workpay-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button className="btn-workpay-primary flex items-center gap-2">
                        <Maximize2 className="h-4 w-4" />
                        Full Screen
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, role, or department..."
                        className="pl-10 input-workpay w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative min-h-[600px] overflow-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 flex justify-center">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-12 w-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-600">Loading hierarchy...</p>
                    </div>
                ) : rootManagers.length > 0 ? (
                    <div className="flex flex-col items-center gap-16 relative z-10">
                        {rootManagers.map(root => (
                            <OrgNode key={root.id} person={root} isRoot />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Network className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">No Hierarchy Found</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">No organizational structure has been set up yet.</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-100 border border-blue-300"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Root/Executive</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-white border border-slate-200"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Personnel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-6 bg-slate-300"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Reports to</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgChartPage;
