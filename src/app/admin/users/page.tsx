"use client";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    isVerified: boolean;
    token: string;
    createdAt: string;
    updatedAt: string;
}

interface UsersResponse {
    users: User[];
    pagination: {
        total: number;
        skip: number;
        take: number;
        hasMore: boolean;
    };
}

export default function UsersPage() {
    const [usersData, setUsersData] = useState<UsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/users');
            const data = await res.json();

            if (res.ok) {
                setUsersData(data);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <ClipLoader
                    // color={color}
                    loading={loading}
                    // cssOverride={override}
                    size={50}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Users Management</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                </div>
                <button
                    onClick={fetchUsers}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Users Management</h1>
                <div className="text-sm text-gray-600">
                    Total Users: {usersData?.pagination.total || 0}
                </div>
            </div>

            {usersData?.users && usersData.users.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                            <div className="col-span-2">ID</div>
                            <div className="col-span-1">Name</div>
                            <div className="col-span-2">Email</div>
                            <div className="col-span-1">Role</div>
                            <div className="col-span-1">Verified</div>
                            <div className="col-span-2">Token</div>
                            <div className="col-span-2">Created</div>
                            <div className="col-span-1">Actions</div>
                        </div>
                    </div>

                    {/* User rows */}
                    <div className="divide-y divide-gray-200">
                        {usersData.users.map((user, index) => (
                            <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                    <div className="col-span-2">
                                        <div className="font-mono text-xs bg-gray-100 p-1 rounded truncate">
                                            {user.id}
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <div className="truncate">{user.name || 'N/A'}</div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="truncate">{user.email}</div>
                                    </div>

                                    <div className="col-span-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="col-span-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.isVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {user.isVerified ? 'Yes' : 'No'}
                                        </span>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="font-mono text-xs bg-gray-100 p-1 rounded truncate">
                                            {user.token || 'No token'}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="text-xs text-gray-600">
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <div className="flex gap-1">
                                            <button className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded">
                                                Edit
                                            </button>
                                            <button className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded">
                                                Del
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination info */}
                    {usersData.pagination && (
                        <div className="mt-6 text-center text-sm text-gray-600">
                            Showing {usersData.pagination.skip + 1} to {Math.min(usersData.pagination.skip + usersData.pagination.take, usersData.pagination.total)} of {usersData.pagination.total} users
                            {usersData.pagination.hasMore && (
                                <div className="mt-2">
                                    <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No users found</div>
                </div>
            )}
        </div>
    );
}
