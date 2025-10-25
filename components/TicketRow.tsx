import React from 'react';
import { TicketHolder, TicketStatus } from '../types';
import { PencilIcon, TrashIcon, ArrowPathIcon, WhatsAppIcon, QrCodeIcon } from './icons/Icons';

interface TicketRowProps {
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

const TicketRow: React.FC<TicketRowProps> = ({ ticket, onEdit, onDelete, onStatusChange, onResend, onShowQrCode }) => {

    const registrationDate = new Date(ticket.registrationTimestamp).toLocaleDateString();

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{ticket.fullName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 break-all">{ticket.userId}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                {ticket.category}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                {registrationDate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[ticket.status]}`}>
                    {ticket.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onShowQrCode(ticket)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Show QR Code" title="Show QR Code">
                    <QrCodeIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onResend(ticket)} className="text-slate-500 hover:text-green-600 p-2 ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Resend to WhatsApp" title="Resend to WhatsApp">
                    <WhatsAppIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onStatusChange(ticket.userId, ticket.status)} className="text-slate-500 hover:text-blue-600 p-2 ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Change Status" title="Change Status">
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onEdit(ticket)} className="text-slate-500 hover:text-brand-primary p-2 ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Edit" title="Edit">
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(ticket.userId)} className="text-slate-500 hover:text-red-600 p-2 ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Delete" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </td>
        </tr>
    );
};

export default TicketRow;