import React from 'react';

const EmploymentTypeChart = ({ stats }) => {
    const types = [
        { name: 'Full Time', count: stats?.by_type?.full_time || 0, color: 'bg-blue-500' },
        { name: 'Part Time', count: stats?.by_type?.part_time || 0, color: 'bg-purple-500' },
        { name: 'Contract', count: stats?.by_type?.contract || 0, color: 'bg-orange-500' },
        { name: 'Intern', count: stats?.by_type?.intern || 0, color: 'bg-pink-500' },
        { name: 'Casual', count: stats?.by_type?.casual || 0, color: 'bg-green-500' }
    ].filter(t => t.count > 0);

    const total = types.reduce((acc, t) => acc + t.count, 0) || 1;

    return (
        <div className="space-y-3">
            {types.map((type) => (
                <div key={type.name}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.name}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{type.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className={`${type.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${(type.count / total) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EmploymentTypeChart;
