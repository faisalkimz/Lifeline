import React from 'react';

const EmployeeDistributionChart = ({ stats }) => {
    const total = stats?.total || 1;
    const active = stats?.active || 0;
    const onLeave = stats?.on_leave || 0;
    const terminated = stats?.terminated || 0;

    const activePercent = Math.round((active / total) * 100);
    const leavePercent = Math.round((onLeave / total) * 100);
    const terminatedPercent = Math.round((terminated / total) * 100);

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    <span className="text-lg font-bold text-success-600 dark:text-success-400">{active}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-success-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activePercent}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activePercent}% of total</p>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">On Leave</span>
                    <span className="text-lg font-bold text-warning-600 dark:text-warning-400">{onLeave}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-warning-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${leavePercent}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{leavePercent}% of total</p>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Terminated</span>
                    <span className="text-lg font-bold text-error-600 dark:text-error-400">{terminated}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-error-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${terminatedPercent}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{terminatedPercent}% of total</p>
            </div>
        </div>
    );
};

export default EmployeeDistributionChart;
