import React, { useMemo, useState } from 'react';
import Tree from 'react-d3-tree';
import { useGetEmployeesQuery } from '../../store/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, Building2, Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const OrgChartPage = () => {
    const { data: employees, isLoading } = useGetEmployeesQuery({ employment_status: 'active' });
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const orgChartData = useMemo(() => {
        if (!employees || employees.length === 0) return null;

        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.id] = {
                name: emp.full_name,
                attributes: {
                    title: emp.job_title,
                    department: emp.department_name,
                    email: emp.email,
                },
                children: [],
                _id: emp.id,
                _managerId: emp.manager,
            };
        });

        const roots = [];
        Object.values(employeeMap).forEach(emp => {
            if (emp._managerId && employeeMap[emp._managerId]) {
                employeeMap[emp._managerId].children.push(emp);
            } else {
                roots.push(emp);
            }
        });

        if (roots.length === 1) return roots[0];

        return {
            name: 'Leadership',
            attributes: { title: 'Executive Team', department: 'Organization' },
            children: roots,
        };
    }, [employees]);

    const handleReset = () => {
        setTranslate({ x: dimensions.width / 2, y: 100 });
        setZoom(1);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-600 font-medium">Building organization chart...</p>
                </div>
            </div>
        );
    }

    if (!employees || employees.length === 0) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <Card className="max-w-md border-2 border-dashed">
                    <CardContent className="text-center p-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Organization Data</h3>
                        <p className="text-gray-600">
                            Add employees to your company to generate the organization chart.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Enhanced Header with gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Organization Chart</h1>
                        </div>
                        <p className="text-blue-100 text-lg">
                            Visual hierarchy of your company structure — {employees?.length || 0} team members
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleZoomOut}
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleZoomIn}
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                <CardContent className="p-0">
                    <div
                        ref={(el) => {
                            if (el && dimensions.width === 0) {
                                const rect = el.getBoundingClientRect();
                                setDimensions({ width: rect.width, height: rect.height });
                                setTranslate({ x: rect.width / 2, y: 100 });
                            }
                        }}
                        className="relative w-full h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)
                            `
                        }}
                    >
                        {orgChartData && dimensions.width > 0 && (
                            <Tree
                                data={orgChartData}
                                orientation="vertical"
                                pathFunc="step"
                                translate={translate}
                                zoom={zoom}
                                scaleExtent={{ min: 0.3, max: 2 }}
                                nodeSize={{ x: 280, y: 180 }}
                                separation={{ siblings: 1.2, nonSiblings: 1.5 }}
                                enableLegacyTransitions
                                transitionDuration={400}
                                pathClassFunc={() => "org-chart-link"}
                                renderCustomNodeElement={({ nodeDatum, toggleNode }) => {
                                    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
                                    const isTopLevel = !nodeDatum._managerId;

                                    return (
                                        <g>
                                            {/* Drop shadow */}
                                            <defs>
                                                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
                                                </filter>
                                                <linearGradient id="cardGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={isTopLevel ? "#3b82f6" : "#ffffff"} />
                                                    <stop offset="100%" stopColor={isTopLevel ? "#2563eb" : "#f8fafc"} />
                                                </linearGradient>
                                            </defs>

                                            {/* Card background */}
                                            <rect
                                                width="240"
                                                height="140"
                                                x="-120"
                                                y="-70"
                                                rx="16"
                                                ry="16"
                                                fill="url(#cardGradient)"
                                                stroke={isTopLevel ? "#2563eb" : "#e2e8f0"}
                                                strokeWidth="2"
                                                filter="url(#shadow)"
                                                onClick={toggleNode}
                                                style={{
                                                    cursor: hasChildren ? 'pointer' : 'default',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                className="org-node-rect"
                                            />

                                            {/* Icon circle */}
                                            <circle
                                                cx="0"
                                                cy="-35"
                                                r="22"
                                                fill={isTopLevel ? "#ffffff" : "#3b82f6"}
                                                stroke={isTopLevel ? "#e0e7ff" : "#dbeafe"}
                                                strokeWidth="3"
                                            />

                                            {/* User icon */}
                                            <text
                                                x="0"
                                                y="-30"
                                                textAnchor="middle"
                                                fontSize="20"
                                                fill={isTopLevel ? "#3b82f6" : "#ffffff"}
                                            >
                                                👤
                                            </text>

                                            {/* Name */}
                                            <text
                                                fill={isTopLevel ? "#ffffff" : "#111827"}
                                                x="0"
                                                y="5"
                                                textAnchor="middle"
                                                fontSize="15"
                                                fontWeight="700"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                {nodeDatum.name.length > 20
                                                    ? nodeDatum.name.substring(0, 20) + '...'
                                                    : nodeDatum.name}
                                            </text>

                                            {/* Job Title */}
                                            <text
                                                fill={isTopLevel ? "#e0e7ff" : "#4b5563"}
                                                x="0"
                                                y="25"
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontWeight="500"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                {(nodeDatum.attributes?.title || '').length > 25
                                                    ? (nodeDatum.attributes?.title || '').substring(0, 25) + '...'
                                                    : nodeDatum.attributes?.title}
                                            </text>

                                            {/* Department */}
                                            <text
                                                fill={isTopLevel ? "#cbd5e1" : "#9ca3af"}
                                                x="0"
                                                y="42"
                                                textAnchor="middle"
                                                fontSize="11"
                                                fontWeight="400"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                            >
                                                {nodeDatum.attributes?.department || 'No Department'}
                                            </text>

                                            {/* Expand indicator */}
                                            {hasChildren && (
                                                <>
                                                    <circle
                                                        cx="0"
                                                        cy="60"
                                                        r="12"
                                                        fill={isTopLevel ? "#ffffff" : "#3b82f6"}
                                                        stroke={isTopLevel ? "#bfdbfe" : "#93c5fd"}
                                                        strokeWidth="2"
                                                    />
                                                    <text
                                                        x="0"
                                                        y="65"
                                                        textAnchor="middle"
                                                        fontSize="10"
                                                        fontWeight="700"
                                                        fill={isTopLevel ? "#3b82f6" : "#ffffff"}
                                                    >
                                                        {nodeDatum.children.length}
                                                    </text>
                                                </>
                                            )}
                                        </g>
                                    );
                                }}
                            />
                        )}

                        {/* Watermark */}
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
                            LahHR — Organization Structure
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border border-gray-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-600"></div>
                            <span className="text-gray-700 font-medium">Leadership</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-white border-2 border-gray-300"></div>
                            <span className="text-gray-700 font-medium">Team Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                            <span className="text-gray-700 font-medium">Direct Reports</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrgChartPage;
