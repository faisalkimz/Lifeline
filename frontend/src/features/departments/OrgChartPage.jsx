import React, { useState } from 'react';
import { useGetManagersQuery } from '../../store/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Users, ChevronDown, User,
    Building2, Network, Download, Maximize2, Search, Filter, Info
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                        "relative p-5 rounded-xl border transition-all cursor-pointer w-72",
                        isRoot
                            ? "bg-blue-50 border-blue-200 shadow-md"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                    )}
                    onClick={() => hasSubordinates && toggleNode(person.id)}
                >
                    {/* Connection Line Top */}
                    {!isRoot && (
                        <div className="absolute -top-8 left-1/2 w-[2px] h-8 bg-gray-300"></div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={cn(
                                "h-14 w-14 rounded-lg overflow-hidden border-2",
                                isRoot ? "border-blue-500" : "border-gray-200"
                            )}>
                                {person.photo ? (
                                    <img src={getImageUrl(person.photo)} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                        <User className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className={cn("font-semibold text-sm truncate", isRoot ? "text-blue-900" : "text-gray-900")}>
                                {person.first_name} {person.last_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium",
                                    isRoot ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                )}>
                                    {person.job_title || 'Position'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <Building2 className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                    {person.department_name || 'Operations'}
                                </span>
                            </div>
                        </div>

                        {hasSubordinates && (
                            <div className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                                isExpanded ? "rotate-180 bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                            )}>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        )}
                    </div>

                    {/* Connection Line Bottom */}
                    {hasSubordinates && isExpanded && (
                        <div className="absolute -bottom-8 left-1/2 w-[2px] h-8 bg-gray-300"></div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {hasSubordinates && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="relative pt-8 flex gap-8"
                        >
                            {/* Horizontal Connection Line */}
                            {person.subordinates.length > 1 && (
                                <div className="absolute top-8 left-[144px] right-[144px] h-[2px] bg-gray-300"></div>
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Network className="h-4 w-4" />
                            <span>Organization Structure</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Organization Chart
                        </h1>
                        <p className="text-gray-600">
                            Visual representation of the reporting hierarchy and personnel distribution.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="border border-gray-200">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Full Screen
                        </Button>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search personnel, roles, or departments..."
                        className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="md:col-span-3">
                    <Button variant="ghost" className="w-full h-10 border border-gray-200">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
                <div className="md:col-span-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between px-4 h-10">
                    <span className="text-xs text-gray-600">Total Personnel</span>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900">{managers?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative min-h-[600px] overflow-auto bg-white rounded-xl border border-gray-200 p-12 flex justify-center">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-12 w-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-600">Loading hierarchy...</p>
                    </div>
                ) : rootManagers.length > 0 ? (
                    <div className="flex flex-col items-center gap-16 relative z-10">
                        {rootManagers.map(root => (
                            <OrgNode key={root.id} person={root} isRoot />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Network className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">No Hierarchy Found</h3>
                        <p className="text-sm text-gray-600">No organizational structure has been set up yet.</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <Card className="border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Chart Legend</h3>
                </div>
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-blue-50 border-2 border-blue-500"></div>
                        <span className="text-sm text-gray-700">Executive/Root</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-white border-2 border-gray-200"></div>
                        <span className="text-sm text-gray-700">Standard Personnel</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-0.5 w-6 bg-gray-300"></div>
                        <span className="text-sm text-gray-700">Direct Reporting</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default OrgChartPage;
