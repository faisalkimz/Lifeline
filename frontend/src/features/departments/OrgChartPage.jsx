import React, { useMemo } from 'react';
import Tree from 'react-d3-tree';
import { useGetEmployeesQuery } from '../../store/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const OrgChartPage = () => {
    const { data: employees, isLoading } = useGetEmployeesQuery({ employment_status: 'active' });

    const orgChartData = useMemo(() => {
        if (!employees || employees.length === 0) return null;

        // 1. Build a map of employees by ID
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

        // 2. Build the tree structure
        const roots = [];
        Object.values(employeeMap).forEach(emp => {
            if (emp._managerId && employeeMap[emp._managerId]) {
                employeeMap[emp._managerId].children.push(emp);
            } else {
                roots.push(emp);
            }
        });

        // 3. Handle multiple roots (e.g. if there are multiple top-level managers or disconnected trees)
        // If there's only one root, return it. If multiple, create a dummy "Company" root.
        if (roots.length === 1) {
            return roots[0];
        } else {
            return {
                name: 'Company',
                attributes: {
                    title: 'Organization',
                },
                children: roots,
            };
        }
    }, [employees]);

    const containerStyles = {
        width: '100%',
        height: '800px',
        background: '#f9fafb',
        borderRadius: '0.5rem',
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading organization chart...</div>;
    }

    if (!employees || employees.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No employees found. Add employees to generate the organization chart.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
                <p className="text-gray-500 mt-1">Visual hierarchy of your company structure.</p>
            </div>

            <Card>
                <CardContent className="p-0 overflow-hidden border rounded-lg">
                    <div style={containerStyles} ref={node => {
                        // Center the tree initially if possible
                    }}>
                        {orgChartData && (
                            <Tree
                                data={orgChartData}
                                orientation="vertical"
                                pathFunc="step"
                                translate={{ x: 400, y: 50 }}
                                nodeSize={{ x: 200, y: 100 }}
                                renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                                    <g>
                                        <rect width="180" height="80" x="-90" y="-40" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1" onClick={toggleNode} />
                                        <text fill="#111827" strokeWidth="0" x="0" y="-10" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                            {nodeDatum.name}
                                        </text>
                                        <text fill="#6b7280" strokeWidth="0" x="0" y="10" textAnchor="middle" style={{ fontSize: '12px' }}>
                                            {nodeDatum.attributes?.title}
                                        </text>
                                        <text fill="#9ca3af" strokeWidth="0" x="0" y="25" textAnchor="middle" style={{ fontSize: '10px' }}>
                                            {nodeDatum.attributes?.department}
                                        </text>
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
