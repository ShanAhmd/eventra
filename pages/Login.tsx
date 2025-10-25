
import React, { useState, FormEvent } from 'react';
import { SupportIllustration, UserIcon, LockClosedIcon, ArrowRightIcon } from '../components/icons/Icons';
import { mockUsers } from '../data/users';
import { User, UserRole } from '../types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('admin@demo.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const user = mockUsers.find(u => u.email === email);

            if (user && user.password === password) {
                if (user.role === UserRole.Admin) {
                    const { password, ...userToReturn } = user;
                    onLoginSuccess(userToReturn);
                } else {
                    setError('You do not have permission to access the admin panel.');
                }
            } else {
                setError('Invalid credentials. Please try again.');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark">
            <div className="w-full max-w-5xl m-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel */}
                <div className="w-full md:w-2/5 bg-[#013B8A] p-8 md:p-12 text-white flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-4">Eventra</h1>
                    <p className="text-base text-blue-200 mb-8">
                        "Book. Scan. Enjoy.” The seamless solution for modern event management.
                    </p>
                    <SupportIllustration className="w-full max-w-xs h-auto" />
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-brand-text-primary dark:text-white mb-2">Welcome Back</h2>
                    <p className="text-brand-text-secondary dark:text-gray-400 mb-8">
                        Sign in to manage your event. Only admins are allowed.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="relative">
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                placeholder="Username or Email"
                            />
                        </div>
                        {/* Password Input */}
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-text-secondary dark:text-gray-400">Remember Me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-brand-primary hover:text-indigo-500">Forgot Password?</a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full group flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Signing In...' : 'Login'}
                                <ArrowRightIcon className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
