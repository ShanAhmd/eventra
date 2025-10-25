import React, { useState, useEffect, FormEvent } from 'react';
import { TicketHolder, QrCodeData } from '../types';
import { XMarkIcon, QrCodeIcon } from './icons/Icons';
import { generateQRCode } from '../services/qrService';

interface EditTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: TicketHolder | null;
    onSave: (updatedTicket: TicketHolder) => void;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({ isOpen, onClose, ticket, onSave }) => {
    const [formData, setFormData] = useState<Partial<TicketHolder>>({});
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isQrLoading, setIsQrLoading] = useState(false);

    useEffect(() => {
        if (ticket) {
            setFormData({
                fullName: ticket.fullName,
                whatsAppNumber: ticket.whatsAppNumber,
                studentId: ticket.studentId,
                category: ticket.category,
            });
            // Reset QR URL when a new ticket is loaded into the modal
            setQrCodeUrl(null); 
        }
    }, [ticket]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (ticket) {
            if (window.confirm('Are you sure you want to save these changes?')) {
                onSave({ ...ticket, ...formData });
            }
        }
    };

    const handleToggleQrCode = async () => {
        if (qrCodeUrl) {
            setQrCodeUrl(null);
            return;
        }

        if (!ticket) return;
        setIsQrLoading(true);

        try {
            const qrData: QrCodeData = {
                userId: ticket.userId,
                fullName: ticket.fullName,
                studentId: ticket.studentId,
                eventDetails: ticket.eventDetails,
                registrationTimestamp: ticket.registrationTimestamp,
                category: ticket.category,
            };
            const url = await generateQRCode(qrData);
            setQrCodeUrl(url);
        } catch (error) {
            console.error("Failed to generate QR code in modal", error);
        } finally {
            setIsQrLoading(false);
        }
    };

    if (!isOpen) return null;

    const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 border border-slate-200 dark:border-slate-700"
                 onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Ticket</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                         <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input type="text" id="fullName" name="fullName" value={formData.fullName || ''} onChange={handleChange} required className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="whatsAppNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                            <input type="tel" id="whatsAppNumber" name="whatsAppNumber" value={formData.whatsAppNumber || ''} onChange={handleChange} required className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Student ID (Optional)</label>
                            <input type="text" id="studentId" name="studentId" value={formData.studentId || ''} onChange={handleChange} className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                            <select id="category" name="category" value={formData.category || ''} onChange={handleChange} required className={commonInputClasses}>
                                <option>General Admission</option>
                                <option>VIP</option>
                                <option>Student</option>
                                <option>Staff</option>
                            </select>
                        </div>
                        
                        {(isQrLoading || qrCodeUrl) && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center">
                                {isQrLoading ? (
                                    <div className="w-44 h-44 flex items-center justify-center text-slate-500">Generating QR Code...</div>
                                ) : qrCodeUrl ? (
                                    <>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ticket QR Code</h4>
                                        <div className="p-2 bg-white rounded-lg border">
                                            <img src={qrCodeUrl} alt="Ticket QR Code" className="w-40 h-40" />
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                        <button
                            type="button"
                            onClick={handleToggleQrCode}
                            disabled={isQrLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50"
                        >
                            <QrCodeIcon className="h-4 w-4" />
                            {isQrLoading ? 'Generating...' : qrCodeUrl ? 'Hide QR Code' : 'Show QR Code'}
                        </button>
                        
                        <div className="flex gap-4">
                           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTicketModal;