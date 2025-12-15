import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, ChevronLeft, ChevronRight, AlertCircle, FileText, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';

const DisciplinaryPage = () => {
    const user = useSelector(selectCurrentUser);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for now as backend functionality might not exist yet
    const cases = [];

    return (
        <div className="space-y-8 pb-10 font-sans text-slate-900">
            {/* Header Section */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-xl font-bold text-slate-700">
                    {user?.company_name ? user.company_name.substring(0, 2).toUpperCase() : 'CP'}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{user?.company_name || 'Company Name'}</h1>
                    <p className="text-slate-500 font-medium">{user.first_name || user.last_name}</p>
                </div>
            </div>

            {/* Description Card */}
            <Card className="bg-white border text-center md:text-left border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Disciplinary tracking
                    </h2>
                    <p className="text-slate-600 max-w-3xl">
                        Follow up on your disciplinary cases here, from acknowledging the case, providing your own evidence and to finally viewing the decision on the case
                    </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600">
                    <AlertCircle className="h-6 w-6" />
                </div>
            </Card>

            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Case ID"
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* <Button className="gap-2 bg-primary-600 hover:bg-primary-700">
                    <Plus className="h-4 w-4" /> New Case
                 </Button> */}
            </div>

            {/* Table Section */}
            <Card className="border-none shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Case ID</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Date of incident</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {cases.length > 0 ? (
                                cases.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.caseId}</td>
                                        <td className="px-6 py-4">{item.reason}</td>
                                        <td className="px-6 py-4">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-slate-100 text-slate-800`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <FileText className="h-10 w-10 mb-2 opacity-20" />
                                            <p className="text-lg font-medium text-slate-500">No Disciplinary cases found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DisciplinaryPage;
