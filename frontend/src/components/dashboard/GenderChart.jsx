import React from 'react';

const GenderChart = ({ stats }) => {
    const genders = [
        { name: 'Male', count: stats?.by_gender?.male || 0, color: 'bg-blue-500', icon: 'M' },
        { name: 'Female', count: stats?.by_gender?.female || 0, color: 'bg-pink-500', icon: 'F' },
        { name: 'Other', count: stats?.by_gender?.other || 0, color: 'bg-purple-500', icon: 'O' }
    ].filter(g => g.count > 0);

    return (
        <div className="flex gap-4 justify-around">
            {genders.map((gender) => (
                <div key={gender.name} className="text-center">
                    <div className={`w-16 h-16 rounded-full ${gender.color} flex items-center justify-center text-lg font-semibold mb-2 mx-auto shadow-md`}>
                        <span className="text-white">{gender.icon}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{gender.name}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{gender.count}</p>
                </div>
            ))}
        </div>
    );
};

export default GenderChart;
