import React, { useMemo } from 'react';
import { useTicketManager } from '../hooks/useTicketManager';
import { TicketStatus } from '../types';
import { ChartPieIcon, CheckCircleIcon, TicketIcon } from '../components/icons/Icons';

// Simple Bar Chart Component
interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
    color: string;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, color }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 0), [data]);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-brand-text-primary dark:text-white mb-4">{title}</h3>
            <div className="h-64 flex items-end gap-2 sm:gap-4 border-l border-b border-slate-200 dark:border-slate-600 p-2">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="relative w-full h-full flex items-end">
                            <div
                                className={`w-full ${color} rounded-t-md transition-all duration-300 ease-in-out group-hover:opacity-80`}
                                style={{ height: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%' }}
                            >
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-brand-text-primary dark:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {value}
                                </span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-center text-brand-text-secondary dark:text-slate-400 truncate w-full">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Main Reports Component
const Reports: React.FC = () => {
    const { ticketHolders, loading, error } = useTicketManager();

    const analytics = useMemo(() => {
        if (!ticketHolders || ticketHolders.length === 0) {
            return {
                totalTickets: 0,
                checkedInCount: 0,
                checkInRate: 0,
                ticketsByCategory: [],
                ticketsByDate: [],
            };
        }

        const checkedInCount = ticketHolders.filter(t => t.status === TicketStatus.Used).length;

        const ticketsByCategory: { [key: string]: number } = {};
        ticketHolders.forEach(ticket => {
            ticketsByCategory[ticket.category] = (ticketsByCategory[ticket.category] || 0) + 1;
        });

        const ticketsByDate: { [key: string]: number } = {};
        ticketHolders.forEach(ticket => {
            const date = ticket.registrationTimestamp.split('T')[0];
            ticketsByDate[date] = (ticketsByDate[date] || 0) + 1;
        });

        return {
            totalTickets: ticketHolders.length,
            checkedInCount,
            checkInRate: (checkedInCount / ticketHolders.length) * 100,
            ticketsByCategory: Object.entries(ticketsByCategory)
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => b.value - a.value),
            ticketsByDate: Object.entries(ticketsByDate)
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime()),
        };
    }, [ticketHolders]);

    if (loading) {
        return <p className="text-center py-8 text-slate-500">Loading reports...</p>;
    }

    if (error) {
        return <p className="text-center py-8 text-red-500">{error}</p>;
    }

    return (
        <>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary dark:text-white">Reports</h1>
            <p className="mt-1 text-brand-text-secondary dark:text-slate-400">An overview of your event's ticket performance.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <KpiCard title="Total Tickets Sold" value={analytics.totalTickets} icon={<TicketIcon />} />
                 <KpiCard title="Attendees Checked-In" value={analytics.checkedInCount} icon={<CheckCircleIcon />} />
                 <KpiCard title="Check-In Rate" value={`${analytics.checkInRate.toFixed(1)}%`} icon={<ChartPieIcon />} />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart title="Tickets by Category" data={analytics.ticketsByCategory} color="bg-brand-primary" />
                <BarChart title="Registrations Over Time" data={analytics.ticketsByDate} color="bg-status-inprogress" />
            </div>
        </>
    );
};

// KpiCard Component (already exists in Dashboard, but let's keep it self-contained for clarity)
interface KpiCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className={`p-3 bg-gray-100 dark:bg-slate-700 rounded-full text-brand-primary`}>
            {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "h-6 w-6"})}
        </div>
        <div>
            <p className="text-sm font-medium text-brand-text-secondary dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-brand-text-primary dark:text-white">{value}</p>
        </div>
    </div>
);

export default Reports;