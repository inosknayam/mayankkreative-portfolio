"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FaTrash, FaEnvelope, FaUser, FaClock, FaSignOutAlt } from 'react-icons/fa';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: any;
}

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Check if already authenticated
    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'mayank_admin_2025') {
            setIsAuthenticated(true);
            fetchContacts();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password check - you can change this password
        if (password === 'Mayank@Admin2025') {
            sessionStorage.setItem('adminAuth', 'mayank_admin_2025');
            setIsAuthenticated(true);
            toast.success('Welcome, Mayank!');
            fetchContacts();
        } else {
            toast.error('Invalid password!');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setContacts([]);
        toast.success('Logged out successfully');
    };

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const contactsData: Contact[] = [];
            querySnapshot.forEach((doc) => {
                contactsData.push({
                    id: doc.id,
                    ...doc.data()
                } as Contact);
            });
            setContacts(contactsData);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to fetch contacts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;

        try {
            await deleteDoc(doc(db, 'contacts', id));
            setContacts(contacts.filter(c => c.id !== id));
            toast.success('Inquiry deleted successfully');
            if (selectedContact?.id === id) {
                setSelectedContact(null);
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete inquiry');
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
                            <p className="text-gray-300">MayankKreative Portfolio</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter admin password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-gray-300 text-sm">Manage contact inquiries</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/settings"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                Settings
                            </Link>
                            <Link
                                href="/admin/projects"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Manage Projects
                            </Link>
                            <Link
                                href="/admin/resources"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Manage Resources
                            </Link>
                            <button
                                onClick={fetchContacts}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Total Inquiries</p>
                                <p className="text-3xl font-bold text-white mt-1">{contacts.length}</p>
                            </div>
                            <div className="bg-purple-600 p-3 rounded-lg">
                                <FaEnvelope className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Today</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {contacts.filter(c => {
                                        if (!c.createdAt) return false;
                                        const date = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
                                        const today = new Date();
                                        return date.toDateString() === today.toDateString();
                                    }).length}
                                </p>
                            </div>
                            <div className="bg-pink-600 p-3 rounded-lg">
                                <FaClock className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">This Week</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {contacts.filter(c => {
                                        if (!c.createdAt) return false;
                                        const date = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return date >= weekAgo;
                                    }).length}
                                </p>
                            </div>
                            <div className="bg-blue-600 p-3 rounded-lg">
                                <FaUser className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inquiries List */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20">
                        <h2 className="text-xl font-bold text-white">Contact Inquiries</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-purple-600"></div>
                            <p className="text-gray-300 mt-4">Loading inquiries...</p>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="p-12 text-center">
                            <FaEnvelope className="text-6xl text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-300">No inquiries yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {contacts.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className="hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => setSelectedContact(contact)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold mr-3">
                                                        {contact.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm font-medium text-white">{contact.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{contact.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">{contact.phone || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300 max-w-xs truncate">{contact.message}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-400">{formatDate(contact.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(contact.id);
                                                    }}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Contact Detail Modal */}
            {selectedContact && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedContact(null)}
                >
                    <div
                        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl max-w-2xl w-full p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-white">Inquiry Details</h3>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Name</label>
                                <p className="text-white text-lg mt-1">{selectedContact.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Email</label>
                                <p className="text-white text-lg mt-1">{selectedContact.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Phone Number</label>
                                <p className="text-white text-lg mt-1">{selectedContact.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Message</label>
                                <p className="text-white text-lg mt-1 whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Received</label>
                                <p className="text-white text-lg mt-1">{formatDate(selectedContact.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <a
                                href={`mailto:${selectedContact.email}`}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-center"
                            >
                                Reply via Email
                            </a>
                            <button
                                onClick={() => {
                                    handleDelete(selectedContact.id);
                                    setSelectedContact(null);
                                }}
                                className="py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
