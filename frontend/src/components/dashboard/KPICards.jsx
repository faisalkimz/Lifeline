import React from 'react';
import { StatCard } from '../ui/StatCard';

const KPICards = ({ stats, isLoading, managersArray }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total"
                value={isLoading ? "..." : stats?.total || 0}
                icon="Users"
                color="primary"
                info={`+${stats?.new_hires || 0} new`}
            />
            <StatCard
                title="Working"
                value={isLoading ? "..." : stats?.active || 0}
                icon="Building2"
                color="success"
                info={`${Math.round(((stats?.active || 0) / (stats?.total || 1)) * 100)}% active`}
            />
            <StatCard
                title="Away"
                value={isLoading ? "..." : stats?.on_leave || 0}
                icon="Clock"
                color="warning"
                info={`on leave now`}
            />
            <StatCard
                title="Teams"
                value={isLoading ? "..." : stats?.departments_count || 0}
                icon="Building2"
                color="info"
                info={`${managersArray.length} leads`}
            />
        </div>
    );
};

export default KPICards;
