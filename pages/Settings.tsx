import React, { useState, useEffect, FormEvent } from 'react';
import { useSettings } from '../context/SettingsContext';
import { EventSettings } from '../types';

const Settings: React.FC = () => {
    const { settings, updateSettings, loading, error } = useSettings();
    const [formData, setFormData] = useState<EventSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (!loading) {
            setFormData(settings);
        }
    }, [settings, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await updateSettings(formData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide message after 3 seconds
        } catch (err) {
            console.error("Failed to save settings", err);
        } finally {
            setIsSaving(false);
        }
    };
    
    const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary";

    return (
        <>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary dark:text-white">Settings</h1>
            <p className="mt-1 text-brand-text-secondary dark:text-slate-400">Configure the general settings for your event.</p>

            <div className="mt-8 max-w-2xl">
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    {loading ? (
                        <p>Loading settings...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="eventName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Event Name</label>
                                <input type="text" id="eventName" name="eventName" value={formData.eventName} onChange={handleChange} required className={commonInputClasses}/>
                            </div>
                            <div>
                                <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Event Date</label>
                                <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleChange} required className={commonInputClasses}/>
                            </div>
                            <div>
                                <label htmlFor="eventLocation" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Event Location</label>
                                <input type="text" id="eventLocation" name="eventLocation" value={formData.eventLocation} onChange={handleChange} required className={commonInputClasses}/>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}
                            {saveSuccess && <p className="text-sm text-green-500">Settings saved successfully!</p>}

                            <div className="flex justify-end">
                                <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default Settings;
