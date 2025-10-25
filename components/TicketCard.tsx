import React from 'react';
import { TicketHolder, TicketStatus } from '../types';
import { PencilIcon, TrashIcon, ArrowPathIcon, WhatsAppIcon, QrCodeIcon } from './icons/Icons';

interface TicketCardProps {
    ticket: TicketHolder;
    onEdit: (ticket: TicketHolder) => void;
    onDelete: (ticketId: string) => void;
    onStatusChange: (ticketId: string, currentStatus: TicketStatus) => void;
    onResend: (ticket: TicketHolder) => void;
    onShowQrCode: (ticket: TicketHolder) => void;
}

const statusStyles: { [key in TicketStatus]: string } = {
    [TicketStatus.Active]: 'bg-status-active/10 text-status-active',
    [TicketStatus.InProgress]: 'bg-status-inprogress/10 text-status-inprogress',
    [TicketStatus.Used]: 'bg-status-used/10 text-status-used',
};


const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEdit, onDelete, onStatusChange, onResend, onShowQrCode }) => {
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{ticket.fullName}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[ticket.status]}`}>
                        {ticket.status}
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 break-all">{ticket.userId}</p>
                <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-600 dark:text-slate-300">Category:</span> {ticket.category}</p>
                    <p><span className="font-semibold text-slate-600 dark:text-slate-300">WhatsApp:</span> {ticket.whatsAppNumber}</p>
                    {ticket.studentId && <p><span className="font-semibold text-slate-600 dark:text-slate-300">Student ID:</span> {ticket.studentId}</p>}
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                <button
                    onClick={() => onShowQrCode(ticket)}
                    className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                    aria-label="Show QR Code"
                    title="Show QR Code"
                >
                    <QrCodeIcon className="h-5 w-5" />
                </button>
                 <button
                    onClick={() => onResend(ticket)}
                    className="p-2 text-slate-500 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                    aria-label="Resend to WhatsApp"
                    title="Resend to WhatsApp"
                >
                    <WhatsAppIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onStatusChange(ticket.userId, ticket.status)}
                    className="p-2 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                    aria-label="Change status"
                    title="Change Status"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onEdit(ticket)}
                    className="p-2 text-slate-500 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                    aria-label="Edit ticket"
                    title="Edit"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDelete(ticket.userId)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                    aria-label="Delete ticket"
                    title="Delete"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default TicketCard;