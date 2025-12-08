import React from 'react';
import { Building2, Calendar } from 'lucide-react';

const WelcomeSection = ({ user }) => {
    return (
        <div className="card p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Hey {user?.first_name}!</h1>
            <p className="text-gray-600 text-lg">Here's what's going on with your team.</p>
            <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-2 text-sm font-medium bg-primary-50 px-4 py-2 rounded-lg">
                    <Building2 className="h-4 w-4 text-primary-600" />
                    <span className="text-primary-700">{user?.company_name || 'Your Company'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-primary-50 px-4 py-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary-600" />
                    <span className="text-primary-700">{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSection;
