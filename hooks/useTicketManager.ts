import { useState, useEffect, useCallback } from 'react';
import { TicketHolder, TicketStatus } from '../types';

const initialTicketHolders: TicketHolder[] = [];

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fPqwtfFDdbNVzKwY_Nvs0bY6L8Nj7XvgGFixVwp9s3hQ2s9";
const BLOB_API_URL = 'https://blob.vercel-storage.com/tickets.json';

const headers = {
    'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
};

const saveTicketsToBlob = async (tickets: TicketHolder[]) => {
    try {
        const response = await fetch(BLOB_API_URL, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tickets, null, 2),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to save data to Vercel Blob.');
        }
    } catch (error) {
        console.error("Error saving to Vercel Blob:", error);
        throw error;
    }
};

export const useTicketManager = () => {
    const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
            setError(null);
        }
        try {
            // Use 'no-store' to bypass browser cache for polling
            const response = await fetch(BLOB_API_URL, { method: 'GET', headers, cache: 'no-store' });

            if (response.ok) {
                const data = await response.json();
                setTicketHolders(currentData => {
                    // Prevent re-render if fetched data is identical to current state
                    if (JSON.stringify(currentData) !== JSON.stringify(data)) {
                        return data;
                    }
                    return currentData;
                });
            } else if (response.status === 404 && isInitialLoad) {
                console.log('No data found in Vercel Blob. Initializing with sample data.');
                setTicketHolders(initialTicketHolders);
                await saveTicketsToBlob(initialTicketHolders);
            } else if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || `HTTP error! Status: ${response.status}`;
                if (isInitialLoad) throw new Error(errorMessage);
                else console.error("Polling failed:", errorMessage); // Don't throw for polling errors
            }
        } catch (err: any) {
            console.error("Failed to fetch tickets:", err);
            if (isInitialLoad) {
                setError('Could not load ticket data. Displaying sample data as a fallback.');
                setTicketHolders(initialTicketHolders);
            }
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, []);
    
    // Initial data fetch
    useEffect(() => {
        fetchTickets(true);
    }, [fetchTickets]);

    // Set up polling for real-time updates
    useEffect(() => {
        const POLLING_INTERVAL = 5000; // 5 seconds
        let intervalId: number;

        const startPolling = () => {
            // Clear any existing interval
            if (intervalId) clearInterval(intervalId);
            
            intervalId = window.setInterval(() => {
                // Only poll if the document is visible
                if (document.visibilityState === 'visible') {
                    fetchTickets(false);
                }
            }, POLLING_INTERVAL);
        };
        
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Fetch immediately when tab becomes visible and restart polling
                fetchTickets(false);
                startPolling();
            } else {
                // Stop polling when tab is not visible
                clearInterval(intervalId);
            }
        };

        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchTickets]);


    const performUpdate = async (updatedTickets: TicketHolder[]) => {
        const previousTickets = ticketHolders;
        setTicketHolders(updatedTickets); // Optimistic update
        try {
            await saveTicketsToBlob(updatedTickets);
        } catch (e) {
            setError('Failed to save changes. Your latest change might not have been saved.');
            setTicketHolders(previousTickets); // Revert on failure
        }
    };

    const addTicketHolder = useCallback((newHolderData: Omit<TicketHolder, 'userId' | 'registrationTimestamp' | 'status'>): TicketHolder => {
        const newTicketHolder: TicketHolder = {
            ...newHolderData,
            userId: `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            registrationTimestamp: new Date().toISOString(),
            status: TicketStatus.Active, // New tickets are always 'Active'
        };
        performUpdate([newTicketHolder, ...ticketHolders]);
        return newTicketHolder;
    }, [ticketHolders]);

    const getTicketHolderById = useCallback((userId: string): TicketHolder | undefined => {
        return ticketHolders.find(ticket => ticket.userId === userId);
    }, [ticketHolders]);

    const updateTicketHolderStatus = useCallback((userId: string, status: TicketStatus) => {
        const updated = ticketHolders.map(ticket =>
            ticket.userId === userId ? { ...ticket, status } : ticket
        );
        performUpdate(updated);
    }, [ticketHolders]);
    
    const updateTicketHolder = useCallback((updatedTicket: TicketHolder) => {
        const updated = ticketHolders.map(ticket =>
            ticket.userId === updatedTicket.userId ? updatedTicket : ticket
        );
        performUpdate(updated);
    }, [ticketHolders]);

    const deleteTicketHolder = useCallback((userId: string) => {
        const updated = ticketHolders.filter(ticket => ticket.userId !== userId);
        performUpdate(updated);
    }, [ticketHolders]);

    return {
        ticketHolders,
        loading,
        error,
        addTicketHolder,
        getTicketHolderById,
        updateTicketHolderStatus,
        updateTicketHolder,
        deleteTicketHolder,
    };
};