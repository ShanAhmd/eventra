import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Scanner from './pages/Scanner';
import Settings from './pages/Settings';
import NewTicket from './pages/NewTicket';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { User } from './types';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const handleLoginSuccess = useCallback((user: User) => {
        setCurrentUser(user);
    }, []);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const ProtectedRoute: React.FC = () => {
        if (!currentUser) {
            return <Navigate to="/login" replace />;
        }
        return (
            <div className="flex h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-primary dark:text-gray-200">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout}/>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Topbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} user={currentUser} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        );
    };

    return (
        <SettingsProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/scanner" element={<Scanner />} />
                        <Route path="/tickets" element={<Dashboard />} />
                        <Route path="/new-ticket" element={<NewTicket />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/reports" element={<Reports />} />
                    </Route>
                    <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
                </Routes>
            </HashRouter>
        </SettingsProvider>
    );
};

export default App;