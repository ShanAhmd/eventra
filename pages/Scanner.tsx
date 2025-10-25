import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTicketManager } from '../hooks/useTicketManager';
import { TicketHolder, TicketStatus, QrCodeData } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ViewfinderCircleIcon } from '../components/icons/Icons';

// The library is loaded via script tag, so we declare it for TypeScript
// It will be accessed via the window object to be safe.
declare const Html5QrcodeScanner: any;

enum ScanStatus {
    Idle,
    Success,
    Error,
    AlreadyUsed
}

// --- Offline Storage Logic ---
const SCANNED_TICKETS_KEY = 'eventra_scanned_tickets';

const getScannedTickets = (): string[] => {
    try {
        const item = localStorage.getItem(SCANNED_TICKETS_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Failed to parse scanned tickets from localStorage", error);
        return [];
    }
};

const addScannedTicket = (ticketId: string) => {
    try {
        const scannedTickets = getScannedTickets();
        if (!scannedTickets.includes(ticketId)) {
            const updatedScanned = [...scannedTickets, ticketId];
            localStorage.setItem(SCANNED_TICKETS_KEY, JSON.stringify(updatedScanned));
        }
    } catch (error) {
        console.error("Failed to save scanned ticket to localStorage", error);
    }
};
// --- End Offline Storage Logic ---

// Helper to play audio cues
const playSound = (type: 'success' | 'error') => {
    try {
        const audioEl = document.getElementById(`audio-${type}`) as HTMLAudioElement;
        if (audioEl) {
            audioEl.currentTime = 0;
            audioEl.play();
        }
    } catch (e) {
        console.error("Audio playback failed.", e);
    }
};

// Helper component for displaying ticket info rows
const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean; status?: TicketStatus; }> = ({ label, value, highlight = false, status }) => {
    
    const getStatusColor = () => {
        if (status === TicketStatus.Used) return 'text-status-used';
        if (status === TicketStatus.InProgress) return 'text-status-inprogress';
        return 'text-status-active';
    };

    return (
        <div className="flex justify-between items-center text-sm py-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{label}:</span>
            <span className={`font-bold text-right ${highlight ? `text-lg ${getStatusColor()}` : 'text-brand-text-primary dark:text-slate-100'}`}>
                {value}
            </span>
        </div>
    );
};


const Scanner: React.FC = () => {
    const { getTicketHolderById, updateTicketHolderStatus } = useTicketManager();
    const [scanResult, setScanResult] = useState<TicketHolder | null>(null);
    const [scannedData, setScannedData] = useState<QrCodeData | null>(null);
    const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.Idle);
    const [errorMessage, setErrorMessage] = useState('');
    const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('loading');
    const [scannerStarted, setScannerStarted] = useState(false);
    const [libraryLoaded, setLibraryLoaded] = useState(typeof (window as any).Html5QrcodeScanner !== 'undefined');
    const scannerRef = useRef<any | null>(null);
    const resultTimeoutRef = useRef<number | null>(null);

    // Effect to handle the loading of the external scanner library
    useEffect(() => {
        if (libraryLoaded) return;

        const intervalId = setInterval(() => {
            if (typeof (window as any).Html5QrcodeScanner !== 'undefined') {
                setLibraryLoaded(true);
                clearInterval(intervalId);
            }
        }, 100);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (!(window as any).Html5QrcodeScanner) {
                console.error("Scanner library failed to load after 10 seconds.");
                setErrorMessage("Scanner library failed to load. Please check your connection and refresh.");
            }
        }, 10000); // 10-second timeout

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [libraryLoaded]);

    // Check camera permissions on component mount
    useEffect(() => {
        const checkCameraPermission = async () => {
            if (!navigator.permissions) {
                console.warn("Permissions API not supported; proceeding to let the library handle it.");
                setPermissionStatus('prompt');
                return;
            }
            try {
                const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
                setPermissionStatus(status.state);
                status.onchange = () => setPermissionStatus(status.state);
            } catch (error) {
                console.error("Error querying camera permissions, proceeding with prompt.", error);
                setPermissionStatus('prompt'); // Fallback if query fails
            }
        };
        checkCameraPermission();
    }, []);

    const resetScannerState = useCallback(() => {
        setScanResult(null);
        setScannedData(null);
        setScanStatus(ScanStatus.Idle);
        setErrorMessage('');
        if (resultTimeoutRef.current) {
            clearTimeout(resultTimeoutRef.current);
        }
    }, []);

    const clearResultAfterDelay = useCallback(() => {
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = window.setTimeout(() => resetScannerState(), 5000);
    }, [resetScannerState]);

    const onScanSuccess = useCallback((decodedText: string) => {
        if (scanStatus !== ScanStatus.Idle) return;

        try {
            const qrData: QrCodeData = JSON.parse(decodedText);
            if (!qrData.userId || !qrData.fullName) throw new Error("Invalid QR code data.");
            
            setScannedData(qrData);
            
            // Offline/local check first
            const locallyScannedIds = getScannedTickets();
            if (locallyScannedIds.includes(qrData.userId)) {
                setScanResult({ ...qrData, status: TicketStatus.Used, whatsAppNumber: 'N/A', registrationTimestamp: qrData.registrationTimestamp });
                setScanStatus(ScanStatus.AlreadyUsed);
                setErrorMessage(`Duplicate scan detected for ${qrData.fullName}.`);
                playSound('error');
                clearResultAfterDelay();
                return;
            }
            
            const ticketHolder = getTicketHolderById(qrData.userId);

            if (ticketHolder) {
                setScanResult(ticketHolder);
                if (ticketHolder.status === TicketStatus.Used) {
                    setScanStatus(ScanStatus.AlreadyUsed);
                    setErrorMessage(`Ticket for ${ticketHolder.fullName} has already been used.`);
                    addScannedTicket(ticketHolder.userId); // Sync to local storage
                    playSound('error');
                } else {
                    setScanStatus(ScanStatus.Success);
                    setErrorMessage('');
                    playSound('success');
                }
            } else {
                setErrorMessage(`Ticket with ID ${qrData.userId} not found.`);
                setScanStatus(ScanStatus.Error);
                setScanResult(null);
                playSound('error');
            }
        } catch (error) {
            setErrorMessage('Invalid QR Code. Please scan an official event ticket.');
            setScanStatus(ScanStatus.Error);
            setScanResult(null);
            setScannedData(null);
            playSound('error');
        }
        clearResultAfterDelay();
    }, [getTicketHolderById, scanStatus, clearResultAfterDelay]);

    const onScanFailure = (error: string) => { /* Optional: handle scan failures */ };

    useEffect(() => {
        const shouldStartScanner = libraryLoaded && scannerStarted && (permissionStatus === 'granted' || permissionStatus === 'prompt');

        if (!shouldStartScanner || scannerRef.current) {
            return;
        }

        const scanner = new (window as any).Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        scannerRef.current = scanner;
        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error: any) => console.error("Failed to clear scanner", error));
                scannerRef.current = null;
            }
        };
    }, [libraryLoaded, permissionStatus, scannerStarted, onScanSuccess]);

    const handleVerifyAndCheckIn = () => {
        if (scanResult && scanStatus === ScanStatus.Success) {
            // Mark as used locally first for immediate offline feedback
            addScannedTicket(scanResult.userId);
            
            // Attempt to update the remote source of truth
            updateTicketHolderStatus(scanResult.userId, TicketStatus.Used);
            
            // Update UI immediately regardless of remote success
            setScanResult(prev => prev ? { ...prev, status: TicketStatus.Used } : null);
            setScanStatus(ScanStatus.AlreadyUsed);
            setErrorMessage(`Successfully checked in ${scanResult.fullName}.`);
            clearResultAfterDelay();
        }
    };
    
    const getStatusInfo = () => {
        switch (scanStatus) {
            case ScanStatus.Success:
                return { Icon: CheckCircleIcon, color: 'text-status-used', title: 'Ticket Valid', bgColor: 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600' };
            case ScanStatus.AlreadyUsed:
                return { Icon: ExclamationTriangleIcon, color: 'text-status-inprogress', title: 'Already Checked-In', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-600' };
            case ScanStatus.Error:
                return { Icon: XCircleIcon, color: 'text-red-500', title: 'Invalid Ticket', bgColor: 'bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-600' };
            default:
                return { Icon: ViewfinderCircleIcon, color: 'text-slate-500 dark:text-slate-400', title: 'Ready to Scan', bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600' };
        }
    };

    const { Icon, color, title, bgColor } = getStatusInfo();

    const renderCameraView = () => {
        if (!libraryLoaded) {
            return (
                <div className="p-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Loading scanner library...</p>
                </div>
            );
        }

        switch (permissionStatus) {
            case 'loading':
                return <p className="text-slate-500">Checking camera permissions...</p>;
            case 'denied':
                return (
                    <div className="p-4 text-center">
                        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto" />
                        <h3 className="mt-2 font-bold text-yellow-600 dark:text-yellow-400">Camera Access Denied</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            To use the scanner, please enable camera permissions for this site in your browser settings, then refresh the page.
                        </p>
                    </div>
                );
            case 'prompt':
            case 'granted':
                if (!scannerStarted) {
                    return (
                        <div className="p-4 text-center">
                            <ViewfinderCircleIcon className="h-12 w-12 text-brand-primary mx-auto" />
                            <h3 className="mt-2 font-bold text-brand-text-primary dark:text-white">Ready to Scan</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Click the button below to start the camera. You may be asked for permission.
                            </p>
                            <button
                                onClick={() => setScannerStarted(true)}
                                className="mt-4 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Start Scanning
                            </button>
                        </div>
                    );
                }
                return <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>;
            default:
                 return <p>An unexpected error occurred.</p>;
        }
    }


    return (
        <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary dark:text-white">QR Code Scanner</h1>
            <p className="mt-1 text-brand-text-secondary dark:text-slate-400">Align the QR code within the frame to verify the ticket.</p>

            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden p-2 min-h-[350px] flex items-center justify-center">
                {renderCameraView()}
            </div>

            <div className={`mt-6 p-4 md:p-6 rounded-xl shadow-md border-2 transition-all duration-300 ${bgColor}`}>
                <div className="flex flex-col items-center text-center">
                    <Icon className={`h-16 w-16 ${color}`} />
                    <h2 className={`mt-4 text-2xl font-bold ${color}`}>{title}</h2>

                    <div className="mt-4 w-full text-left">
                        {scanStatus === ScanStatus.Idle && <p className="text-center text-slate-500 dark:text-slate-400">Waiting for a QR code...</p>}
                        {errorMessage && <p className="text-center font-medium text-brand-text-primary dark:text-slate-200">{errorMessage}</p>}
                        {scanResult && (
                            <div className="mt-4 border-t border-slate-300 dark:border-slate-600 pt-4 space-y-1">
                               <InfoRow label="Name" value={scanResult.fullName} />
                               <InfoRow label="User ID" value={scanResult.userId} />
                               {scanResult.studentId && <InfoRow label="Student ID" value={scanResult.studentId} />}
                               <InfoRow label="Event" value={scanResult.eventDetails} />
                               <InfoRow label="Category" value={scanResult.category} />
                               <InfoRow label="Status" value={scanResult.status} highlight={true} status={scanResult.status} />
                            </div>
                        )}
                        {!scanResult && scannedData && scanStatus === ScanStatus.Error && (
                             <div className="mt-4 border-t border-slate-300 dark:border-slate-600 pt-4 space-y-1">
                               <InfoRow label="Name" value={scannedData.fullName} />
                               <InfoRow label="User ID" value={scannedData.userId} />
                               <InfoRow label="Event" value={scannedData.eventDetails} />
                               <InfoRow label="Category" value={scannedData.category} />
                            </div>
                        )}
                    </div>

                     <div className="mt-6 w-full">
                        {scanStatus === ScanStatus.Success && (
                            <button onClick={handleVerifyAndCheckIn} className="w-full text-lg bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                Verify & Check-In
                            </button>
                        )}
                        {(scanStatus === ScanStatus.Error || scanStatus === ScanStatus.AlreadyUsed) && (
                            <button onClick={resetScannerState} className="w-full text-lg bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">
                                Scan Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scanner;