"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Link from 'next/link';

interface Settings {
    blobCursorEnabled: boolean;
    liquidChromeEnabled: boolean;
}

const SettingsAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        blobCursorEnabled: true,
        liquidChromeEnabled: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'mayank_admin_2025') {
            setIsAuthenticated(true);
            fetchSettings();
        } else {
            window.location.href = '/admin';
        }
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, 'settings', 'site');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSettings(docSnap.data() as Settings);
            } else {
                // Create default settings if they don't exist
                await setDoc(docRef, settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to fetch settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBlobCursor = async () => {
        const newValue = !settings.blobCursorEnabled;
        const newSettings = { ...settings, blobCursorEnabled: newValue };
        setSettings(newSettings);

        setIsSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'site'), newSettings);
            toast.success(`Blob Cursor ${newValue ? 'enabled' : 'disabled'}!`);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
            setSettings(settings);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleLiquidChrome = async () => {
        const newValue = !settings.liquidChromeEnabled;
        const newSettings = { ...settings, liquidChromeEnabled: newValue };
        setSettings(newSettings);

        setIsSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'site'), newSettings);
            toast.success(`Liquid Chrome ${newValue ? 'enabled' : 'disabled'}!`);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
            setSettings(settings);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Redirecting...</div>
        </div>;
    }

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
                                <h1 className="text-2xl font-bold text-white">Site Settings</h1>
                                <p className="text-gray-300 text-sm">Manage website configuration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-purple-600"></div>
                        <p className="text-gray-300 mt-4">Loading settings...</p>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Visual Effects</h2>

                        {/* Blob Cursor Toggle */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        Blob Cursor Effect
                                        {settings.blobCursorEnabled ? (
                                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
                                                Disabled
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                        Enable or disable the purple blob cursor that follows the mouse on the homepage.
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggleBlobCursor}
                                    disabled={isSaving}
                                    className={`ml-6 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${settings.blobCursorEnabled
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                                        } disabled:opacity-50`}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                            Saving...
                                        </>
                                    ) : settings.blobCursorEnabled ? (
                                        <>
                                            <FaToggleOn className="text-2xl" />
                                            Enabled
                                        </>
                                    ) : (
                                        <>
                                            <FaToggleOff className="text-2xl" />
                                            Disabled
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Liquid Chrome Toggle */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        Liquid Chrome Background
                                        {settings.liquidChromeEnabled ? (
                                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
                                                Disabled
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                        Enable or disable the animated liquid chrome background effect in the hero section.
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggleLiquidChrome}
                                    disabled={isSaving}
                                    className={`ml-6 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${settings.liquidChromeEnabled
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                                        } disabled:opacity-50`}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                            Saving...
                                        </>
                                    ) : settings.liquidChromeEnabled ? (
                                        <>
                                            <FaToggleOn className="text-2xl" />
                                            Enabled
                                        </>
                                    ) : (
                                        <>
                                            <FaToggleOff className="text-2xl" />
                                            Disabled
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-blue-200 text-sm">
                                <strong>Note:</strong> Changes take effect immediately. Refresh the homepage to see the updated visual effects.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SettingsAdmin;
