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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Template Management
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create a new template
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <a href="/admin/addtemplate" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Go to Add Template
                            </a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Tags Management
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create, update, and delete tags
                        </p>
                        <a href="/admin/tags" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Manage Tags
                        </a>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            User Management
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Manage user accounts and permissions
                        </p>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                            Manage Users
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
