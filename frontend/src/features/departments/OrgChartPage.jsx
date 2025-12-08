import React, { useMemo } from 'react';
import Tree from 'react-d3-tree';
import { useGetEmployeesQuery } from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const OrgChartPage = () => {
    const { data: employees, isLoading } = useGetEmployeesQuery({ employment_status: 'active' });

    const orgChartData = useMemo(() => {
        if (!employees || employees.length === 0) return null;

        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.id] = {
                name: emp.full_name,
                attributes: {
                    title: emp.job_title,
                    department: emp.department_name,
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
            name: 'Company',
            attributes: { title: 'Organization' },
            children: roots,
        };
    }, [employees]);

    const containerStyles = {
        width: '100%',
        height: '90vh',
        background: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        padding: '1rem',
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-600 font-medium">Loading organization chart...</div>;
    }

    if (!employees || employees.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 font-medium">
                No employees found. Add employees to generate the organization chart.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in px-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Organization Chart</h1>
                <p className="text-gray-600 mt-2 text-md">Visual hierarchy of your company structure.</p>
            </div>

            <Card className="border-0 shadow-lg">
                <CardContent className="p-0 overflow-hidden">
                    <div style={containerStyles}>
                        {orgChartData && (
                            <Tree
                                data={orgChartData}
                                orientation="vertical"
                                pathFunc="step"
                                translate={{ x: 500, y: 80 }}
                                nodeSize={{ x: 220, y: 120 }}
                                renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                                    <g>
                                        {/* Card background with gradient */}
                                        <rect
                                            width="200"
                                            height="100"
                                            x="-100"
                                            y="-50"
                                            rx="12"
                                            ry="12"
                                            fill="url(#gradientNode)"
                                            stroke="#e5e7eb"
                                            strokeWidth="1"
                                            onClick={toggleNode}
                                            style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}
                                        />
                                        {/* Node texts */}
                                        <text
                                            fill="#111827"
                                            x="0"
                                            y="-10"
                                            textAnchor="middle"
                                            fontSize="14"
                                            fontWeight="700"
                                        >
                                            {nodeDatum.name}
                                        </text>
                                        <text
                                            fill="#374151"
                                            x="0"
                                            y="10"
                                            textAnchor="middle"
                                            fontSize="12"
                                            fontWeight="500"
                                        >
                                            {nodeDatum.attributes?.title}
                                        </text>
                                        <text
                                            fill="#6b7280"
                                            x="0"
                                            y="25"
                                            textAnchor="middle"
                                            fontSize="10"
                                        >
                                            {nodeDatum.attributes?.department}
                                        </text>

                                        {/* Gradient definition */}
                                        <defs>
                                            <linearGradient id="gradientNode" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#e0f2fe" />
                                                <stop offset="100%" stopColor="#bae6fd" />
                                            </linearGradient>
                                        </defs>
                                    </g>
                                )}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrgChartPage;
