import React from 'react';
import { Bars3Icon, MagnifyingGlassIcon, BellIcon, UserCircleIcon } from './icons/Icons';
import { User } from '../types';

interface TopbarProps {
    onToggleSidebar: () => void;
    user: User;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, user }) => {
    return (
        <header className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Mobile Menu Button & Search */}
                <div className="flex items-center gap-4">
                     <button
                        onClick={onToggleSidebar}
                        className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label="Open sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="relative hidden md:block">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-transparent rounded-md bg-gray-100 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white dark:focus:bg-slate-800"
                        />
                    </div>
                </div>

                {/* Right-side actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-200">
                        <BellIcon className="h-6 w-6" />
                    </button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                    <button className="flex items-center gap-2">
                        <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        <div className="hidden sm:flex flex-col items-start">
                           <span className="text-sm font-semibold text-brand-text-primary dark:text-gray-200">{user.fullName}</span>
                           <span className="text-xs text-brand-text-secondary dark:text-gray-400">{user.email}</span>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
