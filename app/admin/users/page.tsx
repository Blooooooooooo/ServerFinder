'use client';

import { useEffect, useState } from 'react';
import Toast, { ToastType } from '@/components/Toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Admin {
    discord_id: string;
    username: string;
    avatar?: string;
    added_by: string;
    added_at: string;
}

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

export default function AdminUsersManagement() {
    const { data: session } = useSession();
    const router = useRouter();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [newAdminId, setNewAdminId] = useState('');
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [adding, setAdding] = useState(false);

    const userId = (session?.user as any)?.id;
    const SUPER_ADMIN_ID = '1215303359045701652';

    useEffect(() => {
        if (session && userId !== SUPER_ADMIN_ID) {
            router.push('/admin');
            return;
        }
        fetchAdmins();
    }, [session, userId, router]);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setAdmins(data.data.admins);
            }
        } catch (error) {
            showToast('Failed to load admins', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminId || !newAdminUsername) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setAdding(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discord_id: newAdminId,
                    username: newAdminUsername
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast('Admin added successfully', 'success');
                setNewAdminId('');
                setNewAdminUsername('');
                fetchAdmins();
            } else {
                showToast(data.error || 'Failed to add admin', 'error');
            }
        } catch (error) {
            showToast('Failed to add admin', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveAdmin = async (discord_id: string) => {
        if (!confirm('Are you sure you want to remove this admin?')) return;

        try {
            const res = await fetch(`/api/admin/users?discord_id=${discord_id}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (data.success) {
                showToast('Admin removed successfully', 'success');
                fetchAdmins();
            } else {
                showToast(data.error || 'Failed to remove admin', 'error');
            }
        } catch (error) {
            showToast('Failed to remove admin', 'error');
        }
    };

    if (userId !== SUPER_ADMIN_ID) {
        return null;
    }

    return (
        <>
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
            ))}

            <div className="min-h-screen pt-24 px-4 md:px-6 pb-12 max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage Admin Users</h1>
                    <p className="text-slate-400">Add or remove users who can access the admin panel</p>
                </div>

                {/* Add Admin Form */}
                <div className="glass-card rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Discord User ID</label>
                                <input
                                    type="text"
                                    value={newAdminId}
                                    onChange={(e) => setNewAdminId(e.target.value)}
                                    placeholder="1234567890123456789"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-discord-hot-blue transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={newAdminUsername}
                                    onChange={(e) => setNewAdminUsername(e.target.value)}
                                    placeholder="username"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-discord-hot-blue transition-colors"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={adding}
                            className="btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {adding ? 'Adding...' : 'Add Admin'}
                        </button>
                    </form>
                </div>

                {/* Admin List */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">Current Admins ({admins.length})</h2>
                    </div>
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No admins found</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {admins.map(admin => (
                                <div key={admin.discord_id} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-lg">{admin.username}</p>
                                        <p className="text-sm text-slate-500 font-mono">{admin.discord_id}</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Added {new Date(admin.added_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {admin.discord_id === SUPER_ADMIN_ID ? (
                                            <span className="text-xs bg-discord-hot-blue/20 text-discord-hot-blue px-3 py-1 rounded">Super Admin</span>
                                        ) : (
                                            <button
                                                onClick={() => handleRemoveAdmin(admin.discord_id)}
                                                className="text-sm text-red-400 hover:text-red-300 px-3 py-1 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
