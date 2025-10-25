import React, { createContext, useContext, ReactNode } from 'react';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { EventSettings } from '../types';

interface SettingsContextType {
    settings: EventSettings;
    updateSettings: (newSettings: EventSettings) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const settingsManager = useSettingsManager();

    return (
        <SettingsContext.Provider value={settingsManager}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
