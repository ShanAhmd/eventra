import React, { useState, FormEvent, useEffect } from 'react';
import { TicketHolder } from '../types';
import { XMarkIcon } from './icons/Icons';

interface AddTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newTicketData: Omit<TicketHolder, 'userId' | 'registrationTimestamp' | 'status' | 'eventDetails'>) => void;
}

const AddTicketModal: React.FC<AddTicketModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [fullName, setFullName] = useState('');
    const [whatsAppNumber, setWhatsAppNumber] = useState('');
    const [studentId, setStudentId] = useState('');
    const [category, setCategory] = useState('General Admission');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFullName('');
            setWhatsAppNumber('');
            setStudentId('');
            setCategory('General Admission');
            setError('');
        }
    }, [isOpen]);


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !whatsAppNumber) {
            setError('Full Name and WhatsApp Number are required.');
            return;
        }
        if (!/^\+[1-9]\d{1,14}$/.test(whatsAppNumber)) {
            setError('Please use a valid WhatsApp number with a country code (e.g., +15551234567).');
            return;
        }
        
        onAdd({
            fullName,
            whatsAppNumber,
            studentId,
            category,
        });
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
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Ticket</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                         <div>
                            <label htmlFor="add-fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input type="text" id="add-fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="add-whatsAppNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                            <input type="tel" id="add-whatsAppNumber" value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} required placeholder="+1234567890" className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="add-studentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Student ID (Optional)</label>
                            <input type="text" id="add-studentId" value={studentId} onChange={e => setStudentId(e.target.value)} className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="add-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                            <select id="add-category" value={category} onChange={e => setCategory(e.target.value)} required className={commonInputClasses}>
                                <option>General Admission</option>
                                <option>VIP</option>
                                <option>Student</option>
                                <option>Staff</option>
                            </select>
                        </div>
                         {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Create Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTicketModal;
