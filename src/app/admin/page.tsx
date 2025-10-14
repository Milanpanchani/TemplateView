"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const [userInfo, setUserInfo] = useState<{userId: string, role: string} | null>(null);

    useEffect(() => {
        // Get user info from token (this would typically be done via an API call)
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        
        if (tokenCookie) {
            const token = tokenCookie.split('=')[1];
            try {
                // In a real app, you'd validate this on the server
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserInfo({ userId: payload.userId, role: payload.role });
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, []);

    return (
        <div className="h-full p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome to the admin panel. Only admin users can access this page.
                    </p>
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">1,247</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Templates</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">89</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tags</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">24</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">456</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">New user registered: john.doe@example.com</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">2 minutes ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">New template uploaded: "E-commerce Dashboard"</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">15 minutes ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">New order placed: Order #1234</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">1 hour ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Template "Portfolio Website" updated</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">3 hours ago</span>
                        </div>
                    </div>
                </div>

                {userInfo && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            User Information
                        </h2>
                        <div className="space-y-2">
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">User ID:</span> {userInfo.userId}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Role:</span> 
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
                                    {userInfo.role}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
