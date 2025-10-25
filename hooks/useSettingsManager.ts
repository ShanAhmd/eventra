import { useState, useEffect, useCallback } from 'react';
import { EventSettings } from '../types';

const defaultSettings: EventSettings = {
    eventName: 'Tech Conference 2024',
    eventDate: '2024-12-01',
    eventLocation: 'Convention Center Hall A',
};

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fPqwtfFDdbNVzKwY_Nvs0bY6L8Nj7XvgGFixVwp9s3hQ2s9";
const BLOB_API_URL = 'https://blob.vercel-storage.com/settings.json';

const headers = {
    'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
};

const saveSettingsToBlob = async (settings: EventSettings) => {
    try {
        const response = await fetch(BLOB_API_URL, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings, null, 2),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to save settings to Vercel Blob.');
        }
    } catch (error) {
        console.error("Error saving settings to Vercel Blob:", error);
        throw error;
    }
};

export const useSettingsManager = () => {
    const [settings, setSettings] = useState<EventSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
            setError(null);
        }
        try {
            const response = await fetch(BLOB_API_URL, { method: 'GET', headers, cache: 'no-store' });

            if (response.ok) {
                const data = await response.json();
                setSettings(currentSettings => {
                    if (JSON.stringify(currentSettings) !== JSON.stringify(data)) {
                        return data;
                    }
                    return currentSettings;
                });
            } else if (response.status === 404 && isInitialLoad) {
                console.log('No settings found in Vercel Blob. Initializing with default data.');
                setSettings(defaultSettings);
                await saveSettingsToBlob(defaultSettings);
            } else if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || `HTTP error! Status: ${response.status}`;
                if (isInitialLoad) throw new Error(errorMessage);
                else console.error("Polling for settings failed:", errorMessage);
            }
        } catch (err: any) {
            console.error("Failed to fetch settings:", err);
            if (isInitialLoad) {
                setError('Could not load settings data. Displaying default settings as a fallback.');
                setSettings(defaultSettings);
            }
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSettings(true);
    }, [fetchSettings]);

    // Polling for real-time updates
    useEffect(() => {
        const POLLING_INTERVAL = 10000; // Settings change less often, poll every 10 seconds
        let intervalId: number;

        const startPolling = () => {
            if (intervalId) clearInterval(intervalId);
            intervalId = window.setInterval(() => {
                if (document.visibilityState === 'visible') {
                    fetchSettings(false);
                }
            }, POLLING_INTERVAL);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchSettings(false);
                startPolling();
            } else {
                clearInterval(intervalId);
            }
        };

        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchSettings]);

    const updateSettings = useCallback(async (newSettings: EventSettings) => {
        const previousSettings = settings;
        setSettings(newSettings); // Optimistic update
        try {
            await saveSettingsToBlob(newSettings);
        } catch (e) {
            setError('Failed to save settings. Your latest change might not have been saved.');
            setSettings(previousSettings); // Revert on failure
        }
    }, [settings]);

    return {
        settings,
        loading,
        error,
        updateSettings,
    };
};
