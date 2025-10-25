import React, { useState, useMemo, useCallback } from 'react';
import { useTicketManager } from '../hooks/useTicketManager';
import { useSettings } from '../context/SettingsContext';
import { TicketHolder, TicketStatus } from '../types';
import EditTicketModal from '../components/EditTicketModal';
import AddTicketModal from '../components/AddTicketModal';
import QRCodeModal from '../components/QRCodeModal';
import TicketRow from '../components/TicketRow';
import TicketCard from '../components/TicketCard';
import { MagnifyingGlassIcon, TicketIcon, ArrowDownTrayIcon, ArrowPathIcon, CheckCircleIcon, UserPlusIcon, ChevronUpDownIcon } from '../components/icons/Icons';

type SortableKeys = 'fullName' | 'registrationTimestamp' | 'status';

const Dashboard: React.FC = () => {
    const { ticketHolders, addTicketHolder, updateTicketHolder, deleteTicketHolder, updateTicketHolderStatus, loading, error } = useTicketManager();
    const { settings } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' }>({ key: 'registrationTimestamp', direction: 'desc' });
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketHolder | null>(null);

    const sortedAndFilteredTickets = useMemo(() => {
        let filtered = ticketHolders
            .filter(ticket => {
                const term = searchTerm.toLowerCase();
                return (
                    ticket.fullName.toLowerCase().includes(term) ||
                    ticket.userId.toLowerCase().includes(term) ||
                    ticket.whatsAppNumber.toLowerCase().includes(term) ||
                    (ticket.studentId && ticket.studentId.toLowerCase().includes(term))
                );
            })
            .filter(ticket => {
                if (statusFilter === 'all') return true;
                return ticket.status === statusFilter;
            })
            .filter(ticket => {
                if (!dateRange.start && !dateRange.end) return true;
                const ticketDate = new Date(ticket.registrationTimestamp);
                const startDate = dateRange.start ? new Date(dateRange.start) : null;
                const endDate = dateRange.end ? new Date(dateRange.end) : null;
                if (startDate) startDate.setHours(0, 0, 0, 0);
                if (endDate) endDate.setHours(23, 59, 59, 999);
                if (startDate && ticketDate < startDate) return false;
                if (endDate && ticketDate > endDate) return false;
                return true;
            });

        return filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [ticketHolders, searchTerm, statusFilter, dateRange, sortConfig]);
    
    const stats = useMemo(() => ({
        total: ticketHolders.length,
        active: ticketHolders.filter(t => t.status === TicketStatus.Active).length,
        inProgress: ticketHolders.filter(t => t.status === TicketStatus.InProgress).length,
        used: ticketHolders.filter(t => t.status === TicketStatus.Used).length,
    }), [ticketHolders]);

    const handleSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleShowQrCode = useCallback((ticket: TicketHolder) => {
        setSelectedTicket(ticket);
        setIsQrModalOpen(true);
    }, []);

    const handleEdit = useCallback((ticket: TicketHolder) => {
        setSelectedTicket(ticket);
        setIsEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((ticketId: string) => {
        if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            deleteTicketHolder(ticketId);
        }
    }, [deleteTicketHolder]);
    
    const handleSaveEdit = useCallback((updatedTicket: TicketHolder) => {
        updateTicketHolder(updatedTicket);
        setIsEditModalOpen(false);
        setSelectedTicket(null);
    }, [updateTicketHolder]);

    const handleAddTicket = useCallback((newTicketData: Omit<TicketHolder, 'userId' | 'registrationTimestamp' | 'status' | 'eventDetails'>) => {
        addTicketHolder({
            ...newTicketData,
            eventDetails: settings.eventName
        });
        setIsAddModalOpen(false);
    }, [addTicketHolder, settings.eventName]);


    const handleStatusChange = useCallback((ticketId: string, currentStatus: TicketStatus) => {
        const statusCycle = [TicketStatus.Active, TicketStatus.InProgress, TicketStatus.Used];
        const currentIndex = statusCycle.indexOf(currentStatus);
        const newStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        
        if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
            updateTicketHolderStatus(ticketId, newStatus);
        }
    }, [updateTicketHolderStatus]);

    const handleResendWhatsApp = useCallback((ticket: TicketHolder) => {
        const message = encodeURIComponent(
            `Hello ${ticket.fullName}!\n\nThis is a reminder for your ticket to ${ticket.eventDetails}.\n\nUser ID: ${ticket.userId}\n\nPlease present the QR code at the entrance. We have previously sent it to you.`
        );
        window.open(`https://wa.me/${ticket.whatsAppNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
    }, []);

    const handleExportCSV = () => {
        const headers = ['User ID', 'Full Name', 'WhatsApp Number', 'Student ID', 'Event Details', 'Category', 'Registration Timestamp', 'Status'];
        const rows = sortedAndFilteredTickets.map(t => [
            `"${t.userId}"`,
            `"${t.fullName}"`,
            `"${t.whatsAppNumber}"`,
            `"${t.studentId || ''}"`,
            `"${t.eventDetails}"`,
            `"${t.category}"`,
            `"${t.registrationTimestamp}"`,
            `"${t.status}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `eventra_tickets_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const renderContent = () => {
        if (loading) return <p className="text-center py-8 text-slate-500">Loading tickets...</p>;
        if (error) return <p className="text-center py-8 text-red-500">{error}</p>;
        if (sortedAndFilteredTickets.length === 0) return <p className="text-center py-8 text-slate-500">No tickets found.</p>;
        return null;
    };

    const commonInputClasses = "w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-primary";

    return (
        <>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary dark:text-white">Dashboard</h1>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KpiCard title="Total Tickets" value={stats.total} icon={<TicketIcon />} color="text-gray-500" />
                 <KpiCard title="Active" value={stats.active} icon={<TicketIcon />} color="text-status-active" />
                 <KpiCard title="In Progress" value={stats.inProgress} icon={<ArrowPathIcon />} color="text-status-inprogress" />
                 <KpiCard title="Used" value={stats.used} icon={<CheckCircleIcon />} color="text-status-used" />
            </div>
            
            <div className="mt-8 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">All Tickets</h2>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <UserPlusIcon className="h-4 w-4" />
                            New Ticket
                        </button>
                        <button onClick={handleExportCSV} disabled={loading || sortedAndFilteredTickets.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center mb-4">
                    <div className="relative lg:col-span-2">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                        <input
                            type="text"
                            placeholder="Search by name, ID, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${commonInputClasses} pl-10`}
                            disabled={loading}
                        />
                    </div>
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className={commonInputClasses}/>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className={commonInputClasses}/>
                </div>
                 {/* Tickets Table (Desktop) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => handleSort('fullName')} className="flex items-center gap-1">Attendee Details <ChevronUpDownIcon className="h-4 w-4" /></button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => handleSort('registrationTimestamp')} className="flex items-center gap-1">Registered <ChevronUpDownIcon className="h-4 w-4" /></button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => handleSort('status')} className="flex items-center gap-1">Status <ChevronUpDownIcon className="h-4 w-4" /></button>
                                </th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {!loading && !error && sortedAndFilteredTickets.map(ticket => (
                                <TicketRow key={ticket.userId} ticket={ticket} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} onResend={handleResendWhatsApp} onShowQrCode={handleShowQrCode} />
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4">{renderContent()}</div>
                </div>

                {/* Tickets Grid (Mobile) */}
                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {loading || error ? renderContent() :
                        sortedAndFilteredTickets.map(ticket => (
                            <TicketCard key={ticket.userId} ticket={ticket} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} onResend={handleResendWhatsApp} onShowQrCode={handleShowQrCode} />
                        ))
                    }
                </div>
            </div>

            <AddTicketModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTicket}
            />

            <QRCodeModal 
                isOpen={isQrModalOpen}
                onClose={() => {
                    setIsQrModalOpen(false);
                    setSelectedTicket(null);
                }}
                ticket={selectedTicket}
            />

            <EditTicketModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTicket(null);
                }}
                ticket={selectedTicket}
                onSave={handleSaveEdit}
            />
        </>
    );
};

interface KpiCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className={`p-3 bg-gray-100 dark:bg-slate-700 rounded-full ${color}`}>
            {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "h-6 w-6"})}
        </div>
        <div>
            <p className="text-sm font-medium text-brand-text-secondary dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-brand-text-primary dark:text-white">{value}</p>
        </div>
    </div>
);

export default Dashboard;