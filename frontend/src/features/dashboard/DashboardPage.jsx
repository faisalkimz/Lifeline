import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useGetEmployeeStatsQuery, useGetManagersQuery } from '../../store/api';
import WelcomeSection from '../../components/dashboard/WelcomeSection';
import KPICards from '../../components/dashboard/KPICards';
import ChartsSection from '../../components/dashboard/ChartsSection';
import RecentHiresSection from '../../components/dashboard/RecentHiresSection';
import TopManagersSection from '../../components/dashboard/TopManagersSection';
import UpcomingEventsSection from '../../components/dashboard/UpcomingEventsSection';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { data: stats, isLoading } = useGetEmployeeStatsQuery();
    const { data: managers } = useGetManagersQuery();

    const managersArray = Array.isArray(managers) ? managers : [];

    const topManagers = useMemo(() => {
        return managersArray
            .sort((a, b) => (b.subordinates?.length || 0) - (a.subordinates?.length || 0))
            .slice(0, 5);
    }, [managersArray]);

    return (
        <div className="space-y-6">
            <WelcomeSection user={user} />
            <KPICards stats={stats} isLoading={isLoading} managersArray={managersArray} />
            <ChartsSection stats={stats} isLoading={isLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentHiresSection stats={stats} />
                <TopManagersSection topManagers={topManagers} />
            </div>
            <UpcomingEventsSection stats={stats} />
        </div>
    );
};

export default DashboardPage;
