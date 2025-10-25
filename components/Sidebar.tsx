import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    TicketIcon,
    Cog6ToothIcon,
    QrCodeIcon,
    ArrowRightStartOnRectangleIcon,
    XMarkIcon,
    UserPlusIcon,
    ChartPieIcon
} from './icons/Icons';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onLogout }) => {
    
    const handleLogoutClick = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            onLogout();
        }
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`;

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <aside className={`fixed lg:relative inset-y-0 left-0 bg-white dark:bg-slate-800 w-64 transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 flex flex-col border-r border-slate-200 dark:border-slate-700 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <QrCodeIcon className="h-8 w-8 text-brand-primary" />
                        <span className="text-xl font-bold text-brand-text-primary dark:text-white">Eventra</span>
                    </div>
                     <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <NavLink to="/" className={navLinkClass} end>
                        <HomeIcon className="h-5 w-5" />
                        Dashboard
                    </NavLink>
                    <NavLink to="/tickets" className={navLinkClass}>
                        <TicketIcon className="h-5 w-5" />
                        Tickets
                    </NavLink>
                    <NavLink to="/new-ticket" className={navLinkClass}>
                        <UserPlusIcon className="h-5 w-5" />
                        New Ticket
                    </NavLink>
                    <NavLink to="/scanner" className={navLinkClass}>
                        <QrCodeIcon className="h-5 w-5" />
                        QR Scanner
                    </NavLink>
                    <NavLink to="/reports" className={navLinkClass}>
                        <ChartPieIcon className="h-5 w-5" />
                        Reports
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClass}>
                        <Cog6ToothIcon className="h-5 w-5" />
                        Settings
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;