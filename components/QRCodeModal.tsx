import React, { useState, useEffect } from 'react';
import { TicketHolder, QrCodeData } from '../types';
import { generateQRCode } from '../services/qrService';
import { XMarkIcon } from './icons/Icons';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: TicketHolder | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, ticket }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && ticket) {
            setLoading(true);
            const qrData: QrCodeData = {
                userId: ticket.userId,
                fullName: ticket.fullName,
                studentId: ticket.studentId,
                eventDetails: ticket.eventDetails,
                registrationTimestamp: ticket.registrationTimestamp,
                category: ticket.category,
            };
            generateQRCode(qrData)
                .then(url => {
                    setQrCodeUrl(url);
                })
                .catch(err => {
                    console.error("Failed to generate QR code:", err);
                    setQrCodeUrl(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setQrCodeUrl(null);
        }
    }, [isOpen, ticket]);

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ticket QR Code</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{ticket.fullName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 break-all">{ticket.userId}</p>
                    <div className="my-4 p-4 bg-white rounded-lg border">
                        {loading && <div className="w-56 h-56 flex items-center justify-center"><p>Generating QR...</p></div>}
                        {qrCodeUrl && !loading && <img src={qrCodeUrl} alt={`QR Code for ${ticket.fullName}`} className="w-56 h-56 object-contain" />}
                        {!qrCodeUrl && !loading && <div className="w-56 h-56 flex items-center justify-center"><p className="text-red-500">Failed to generate QR code.</p></div>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Present this QR code at the event entrance.</p>
                </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-500">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;