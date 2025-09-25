"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    createdAt: string;
    _count?: {
        templateTags: number;
    };
}

export default function TagsManagement() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [loadingOperation, setLoadingOperation] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch all tags
    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tag');
            const data = await response.json();
            
            if (data.success) {
                setTags(data.tags);
            } else {
                setError('Failed to fetch tags');
            }
        } catch (error) {
            setError('Error fetching tags');
            console.error('Error fetching tags:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    // Create new tag
    const createTag = async () => {
        if (!newTagName.trim()) {
            setError('Tag name is required');
            return;
        }

        try {
            setLoadingOperation(true);
            setError('');
            setSuccess('');

            const response = await fetch('/api/tag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newTagName.trim() }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Tag created successfully');
                setNewTagName('');
                fetchTags(); // Refresh the list
            } else {
                setError(data.error || 'Failed to create tag');
            }
        } catch (error) {
            setError('Error creating tag');
            console.error('Error creating tag:', error);
        } finally {
            setLoadingOperation(false);
        }
    };

    // Update tag
    const updateTag = async (tagId: string) => {
        if (!editName.trim()) {
            setError('Tag name is required');
            return;
        }

        try {
            setLoadingOperation(true);
            setError('');
            setSuccess('');

            const response = await fetch('/api/tag', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: tagId, name: editName.trim() }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Tag updated successfully');
                setEditingTag(null);
                setEditName('');
                fetchTags(); // Refresh the list
            } else {
                setError(data.error || 'Failed to update tag');
            }
        } catch (error) {
            setError('Error updating tag');
            console.error('Error updating tag:', error);
        } finally {
            setLoadingOperation(false);
        }
    };

    // Delete tag
    const deleteTag = async (tagId: string, tagName: string) => {
        if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setLoadingOperation(true);
            setError('');
            setSuccess('');

            const response = await fetch('/api/tag', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: tagId }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Tag deleted successfully');
                fetchTags(); // Refresh the list
            } else {
                setError(data.error || 'Failed to delete tag');
            }
        } catch (error) {
            setError('Error deleting tag');
            console.error('Error deleting tag:', error);
        } finally {
            setLoadingOperation(false);
        }
    };

    // Start editing a tag
    const startEdit = (tag: Tag) => {
        setEditingTag(tag.id);
        setEditName(tag.name);
        setError('');
        setSuccess('');
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingTag(null);
        setEditName('');
        setError('');
        setSuccess('');
    };

    // Clear messages after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    if (loading) {
        return (
            <div className="h-full p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-600 dark:text-gray-400">Loading tags...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Tags Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage all available tags. You can create, update, and delete tags.
                    </p>
                </div>

                {/* Success/Error Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                        {success}
                    </div>
                )}

                {/* Add New Tag */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Add New Tag
                    </h2>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="newTagName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tag Name
                            </Label>
                            <Input
                                id="newTagName"
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Enter tag name"
                                disabled={loadingOperation}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={createTag}
                                disabled={loadingOperation || !newTagName.trim()}
                                className="px-6"
                            >
                                {loadingOperation ? 'Creating...' : 'Create Tag'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tags List */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        All Tags ({tags.length})
                    </h2>
                    
                    {tags.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No tags found. Create your first tag above.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {editingTag === tag.id ? (
                                        // Edit mode
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex-1">
                                                <Input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    disabled={loadingOperation}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => updateTag(tag.id)}
                                                    disabled={loadingOperation || !editName.trim()}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {loadingOperation ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button
                                                    onClick={cancelEdit}
                                                    disabled={loadingOperation}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View mode
                                        <>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {tag.name}
                                                    </span>
                                                    {tag._count && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-sm">
                                                            {tag._count.templateTags} template{tag._count.templateTags !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Created: {new Date(tag.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => startEdit(tag)}
                                                    disabled={loadingOperation}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => deleteTag(tag.id, tag.name)}
                                                    disabled={loadingOperation}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
