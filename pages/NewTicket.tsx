import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketManager } from '../hooks/useTicketManager';
import { useSettings } from '../context/SettingsContext';
import { generateQRCode } from '../services/qrService';
import { TicketHolder, QrCodeData } from '../types';
import { WhatsAppIcon } from '../components/icons/Icons';

const NewTicket: React.FC = () => {
    const navigate = useNavigate();
    const { addTicketHolder } = useTicketManager();
    const { settings, loading: settingsLoading } = useSettings();

    const [fullName, setFullName] = useState('');
    const [whatsAppNumber, setWhatsAppNumber] = useState('');
    const [studentId, setStudentId] = useState('');
    const [category, setCategory] = useState('General Admission');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

    const [generatedTicket, setGeneratedTicket] = useState<TicketHolder | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !whatsAppNumber) {
            setError('Full Name and WhatsApp Number are required.');
            return;
        }
        if (!/^\+[1-9]\d{1,14}$/.test(whatsAppNumber)) {
            setError('Please enter a valid WhatsApp number, including the country code (e.g., +15551234567).');
            return;
        }

        setIsLoading(true);
        setGeneratedTicket(null);
        setQrCodeUrl(null);

        try {
            const newTicketHolderData = {
                fullName,
                whatsAppNumber,
                studentId,
                eventDetails: settings.eventName,
                category,
            };

            const newTicket = addTicketHolder(newTicketHolderData);
            
            const qrData: QrCodeData = {
                userId: newTicket.userId,
                fullName: newTicket.fullName,
                studentId: newTicket.studentId,
                eventDetails: newTicket.eventDetails,
                registrationTimestamp: newTicket.registrationTimestamp,
                category: newTicket.category,
            };
            const qrUrl = await generateQRCode(qrData);
            
            setGeneratedTicket(newTicket);
            setQrCodeUrl(qrUrl);

        } catch (err) {
            setError('Failed to register ticket holder. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendViaWhatsApp = async () => {
        if (!qrCodeUrl || !generatedTicket || copyStatus !== 'idle') return;

        setCopyStatus('copying');
        try {
            // 1. Copy QR Code image to clipboard
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);

            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000); // Reset status after 2 seconds

            // 2. Prepare and open WhatsApp chat link
            const message = encodeURIComponent(`Hello ${generatedTicket.fullName}!\n\nYour ticket for ${generatedTicket.eventDetails} is confirmed.\n\nUser ID: ${generatedTicket.userId}\n\nPlease present this QR code at the entrance for scanning.\n\nThank you!`);
            window.open(`https://wa.me/${generatedTicket.whatsAppNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
        } catch (err) {
            console.error('Failed to copy image or open WhatsApp:', err);
            setError('Could not copy QR code. Please download it manually.');
            setCopyStatus('idle');
        }
    };

    const handleReset = () => {
        setFullName('');
        setWhatsAppNumber('');
        setStudentId('');
        setCategory('General Admission');
        setGeneratedTicket(null);
        setQrCodeUrl(null);
        setError('');
    };

    const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary";

    return (
        <>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary dark:text-white">Create New Ticket</h1>
            <p className="mt-1 text-brand-text-secondary dark:text-slate-400">Fill in the details to generate a ticket and QR code for {settingsLoading ? '...' : settings.eventName}.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className={`bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ${generatedTicket ? 'md:col-span-1' : 'md:col-span-2'}`}>
                    {!generatedTicket ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="whatsAppNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Number (with country code)</label>
                            <input type="tel" id="whatsAppNumber" value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} required placeholder="+1234567890" className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Student ID (Optional)</label>
                            <input type="text" id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} className={commonInputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className={commonInputClasses}>
                                <option>General Admission</option>
                                <option>VIP</option>
                                <option>Student</option>
                                <option>Staff</option>
                            </select>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading || settingsLoading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                {isLoading ? 'Generating...' : 'Generate Ticket'}
                            </button>
                        </div>
                    </form>
                    ) : (
                        <div className="flex flex-col text-center h-full">
                            <h2 className="text-2xl font-bold text-status-resolved">Ticket Created!</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">A ticket has been generated for {generatedTicket.fullName}.</p>

                            <div className="mt-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-left">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Instructions to Send:</h3>
                                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
                                    Click the button below. This will copy the QR image and open WhatsApp.
                                    Simply <span className="font-bold">paste the QR code</span> in the chat and send.
                                </p>
                                <div className="mt-4">
                                    <button 
                                        onClick={handleSendViaWhatsApp} 
                                        disabled={copyStatus !== 'idle'}
                                        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-green-400"
                                    >
                                        <WhatsAppIcon className="h-5 w-5" />
                                        {copyStatus === 'idle' && 'Send via WhatsApp'}
                                        {copyStatus === 'copying' && 'Preparing...'}
                                        {copyStatus === 'copied' && 'QR Copied! Opening Chat...'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-6 space-y-2">
                                <button onClick={handleReset} className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                    Register Another
                                </button>
                                <button onClick={() => navigate('/')} className="w-full text-brand-primary font-semibold py-2 px-4 rounded-md hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors">
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {generatedTicket && qrCodeUrl && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{generatedTicket.fullName}</h3>
                        <p className="text-slate-500 dark:text-slate-400 break-all">{generatedTicket.userId}</p>
                        <div className="my-4 p-4 bg-white rounded-lg">
                           <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56 object-contain"/>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Scan this code at the event entrance.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default NewTicket;