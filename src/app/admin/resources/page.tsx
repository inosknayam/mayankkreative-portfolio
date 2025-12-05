"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
    createdAt: any;
}

const ResourcesAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        category: ''
    });

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'mayank_admin_2025') {
            setIsAuthenticated(true);
            fetchResources();
        } else {
            window.location.href = '/admin';
        }
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'resources'));
            const resourcesData: Resource[] = [];
            querySnapshot.forEach((doc) => {
                resourcesData.push({
                    id: doc.id,
                    ...doc.data()
                } as Resource);
            });
            setResources(resourcesData);
        } catch (error) {
            console.error('Error fetching resources:', error);
            toast.error('Failed to fetch resources');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const resourceData = {
                title: formData.title,
                description: formData.description,
                url: formData.url,
                category: formData.category.toLowerCase(),
                updatedAt: serverTimestamp()
            };

            if (editingResource) {
                await updateDoc(doc(db, 'resources', editingResource.id), resourceData);
                toast.success('Resource updated successfully!');
            } else {
                await addDoc(collection(db, 'resources'), {
                    ...resourceData,
                    createdAt: serverTimestamp()
                });
                toast.success('Resource added successfully!');
            }

            resetForm();
            fetchResources();
        } catch (error) {
            console.error('Error saving resource:', error);
            toast.error('Failed to save resource');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description,
            url: resource.url,
            category: resource.category
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            await deleteDoc(doc(db, 'resources', id));
            toast.success('Resource deleted successfully');
            fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
            toast.error('Failed to delete resource');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            url: '',
            category: ''
        });
        setEditingResource(null);
        setIsEditing(false);
    };

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Redirecting...</div>
        </div>;
    }

    const groupedResources = resources.reduce((acc, resource) => {
        if (!acc[resource.category]) {
            acc[resource.category] = [];
        }
        acc[resource.category].push(resource);
        return acc;
    }, {} as Record<string, Resource[]>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-white hover:text-purple-300 transition-colors">
                                <FaArrowLeft className="text-xl" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Resources Management</h1>
                                <p className="text-gray-300 text-sm">Manage curated resources and tools</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                            {isEditing ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Resource</>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Add/Edit Form */}
                {isEditing && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingResource ? 'Edit Resource' : 'Add New Resource'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., ChatGPT"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., AI Tools, Graphic Design, Utilities"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Brief description of the resource..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                                >
                                    <FaSave /> {editingResource ? 'Update Resource' : 'Add Resource'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Resources List */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20">
                        <h2 className="text-xl font-bold text-white">All Resources ({resources.length})</h2>
                    </div>

                    {isLoading && !isEditing ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-purple-600"></div>
                            <p className="text-gray-300 mt-4">Loading resources...</p>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-300">No resources yet. Add your first resource!</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            {Object.entries(groupedResources).map(([category, categoryResources]) => (
                                <div key={category}>
                                    <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-4 capitalize">
                                        {category} ({categoryResources.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categoryResources.map((resource) => (
                                            <div key={resource.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-white font-bold">{resource.title}</h4>
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300"
                                                    >
                                                        <FaExternalLinkAlt className="text-sm" />
                                                    </a>
                                                </div>
                                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                                    {resource.description}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(resource)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(resource.id)}
                                                        className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ResourcesAdmin;
