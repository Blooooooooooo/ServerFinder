'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import Modal from '@/components/Modal';
import Toast, { ToastType } from '@/components/Toast';
import { IServer } from '@/models/Server';
import { RefreshCw, Edit3, Star, Trash2, Shield, Copy, FileText, Users, Clock, ExternalLink, Share2 } from 'lucide-react';

interface ServerDetailsProps {
    initialServer?: IServer | null;
}

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

function ServerDetailsContent({ initialServer }: ServerDetailsProps) {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { data: session } = useSession();

    const [server, setServer] = useState<IServer | null>(initialServer || null);
    const [loading, setLoading] = useState(!initialServer);

    // Admin state
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUpdatingPartner, setIsUpdatingPartner] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Check admin status
    useEffect(() => {
        if (session?.user) {
            fetch('/api/auth/check-admin')
                .then(res => res.json())
                .then(data => setIsAdmin(data.isAdmin))
                .catch(() => setIsAdmin(false));
        } else {
            setIsAdmin(false);
        }
    }, [session]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const serverRes = await fetch(`/api/servers/${id}`);
                const serverData = await serverRes.json();

                if (serverData.success) {
                    setServer(serverData.data);

                    // Log activity if user is logged in
                    if (session?.user) {
                        fetch('/api/user/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                server_id: id,
                                activity_type: 'view'
                            })
                        }).catch(err => console.error('Failed to log activity:', err));
                    }
                }
            } catch (error) {
                console.error('Error fetching server details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, session]);

    const handleJoin = () => {
        if (server?.link) {
            window.open(server.link, '_blank', 'noopener,noreferrer');
        }
    };

    // Admin actions
    const handleSync = async () => {
        if (!server) return;
        setIsSyncing(true);
        try {
            const res = await fetch(`/api/servers/${server._id}/sync`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setServer(prev => prev ? {
                    ...prev,
                    name: data.data.name,
                    icon_url: data.data.icon_url,
                    banner_url: data.data.banner_url
                } : null);
                showToast('Server synced from Discord', 'success');
            } else {
                showToast(data.error || 'Failed to sync', 'error');
            }
        } catch (error) {
            showToast('Failed to sync with Discord', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleTogglePartner = async () => {
        if (!server) return;
        setIsUpdatingPartner(true);
        try {
            const res = await fetch(`/api/servers/${server._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_partner: !server.is_partner })
            });
            const data = await res.json();
            if (data.success) {
                setServer(prev => prev ? { ...prev, is_partner: !prev.is_partner } : null);
                showToast(`Server ${!server.is_partner ? 'partnered' : 'unpartnered'} successfully`, 'success');
            } else {
                showToast('Failed to update partner status', 'error');
            }
        } catch (error) {
            showToast('Failed to update partner status', 'error');
        } finally {
            setIsUpdatingPartner(false);
        }
    };

    const openEditModal = () => {
        if (server) {
            setNewName(server.name);
            setEditModalOpen(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!server || !newName.trim()) return;
        setIsEditing(true);
        try {
            const res = await fetch(`/api/servers/${server._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            const data = await res.json();
            if (data.success) {
                setServer(prev => prev ? { ...prev, name: data.data.name } : null);
                showToast('Server name updated', 'success');
                setEditModalOpen(false);
            } else {
                showToast(data.error || 'Failed to update', 'error');
            }
        } catch (error) {
            showToast('Failed to update server', 'error');
        } finally {
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!server) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/servers/${server._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Server deleted successfully', 'success');
                setDeleteModalOpen(false);
                setTimeout(() => router.push('/servers'), 1500);
            } else {
                showToast(data.error || 'Failed to delete', 'error');
            }
        } catch (error) {
            showToast('Failed to delete server', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord-blurple"></div>
            </div>
        );
    }

    if (!server) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Server Not Found</h1>
                <a href="/servers" className="text-discord-blurple hover:underline">Return to Server List</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-discord-blurple selection:text-white pb-20">
            {/* Toast Notifications */}
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
            ))}

            <Navigation />

            {/* Hero Banner - Simplified */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden">
                {server.banner_url ? (
                    <img src={server.banner_url} alt={`${server.name} banner`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative -mt-24 z-10">
                {/* Server Header Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Server Icon */}
                        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ${!server.icon_url ? 'bg-slate-700 flex items-center justify-center' : ''}`}>
                            {server.icon_url ? (
                                <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-white">{server.name.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>

                        {/* Server Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-3xl md:text-4xl font-bold text-white truncate">
                                    {server.name}
                                </h1>
                                {server.is_partner && (
                                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                                        <Star className="w-3 h-3" /> Partner
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Users className="w-4 h-4" />
                                    <span className="font-medium text-white">{server.current_member_count?.toLocaleString() || 0}</span> members
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="font-medium text-green-400">{server.online_member_count?.toLocaleString() || 0}</span> online
                                </div>
                                {server.letter_category && (
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs border border-white/5">
                                        {server.letter_category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={handleJoin}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-discord-blurple hover:bg-discord-blurple/90 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-discord-blurple/20"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Join Server
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin Tools Panel */}
                {isAdmin && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-500 font-medium text-sm">Admin Tools</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-discord-hot-blue/20 text-discord-hot-blue hover:bg-discord-hot-blue/30 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Syncing...' : 'Sync'}
                            </button>
                            <button
                                onClick={openEditModal}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 transition-colors text-sm font-medium"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleTogglePartner}
                                disabled={isUpdatingPartner}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${server.is_partner
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-discord-hot-orange/20 text-discord-hot-orange hover:bg-discord-hot-orange/30'
                                    }`}
                            >
                                <Star className="w-4 h-4" />
                                {isUpdatingPartner ? '...' : server.is_partner ? 'Unpartner' : 'Partner'}
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Description Card */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-discord-hot-blue" /> About
                            </h2>
                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {server.description || "No description provided for this server."}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Stats Card */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Members
                                    </span>
                                    <span className="text-white font-bold">{server.current_member_count?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Online Now</span>
                                    <span className="text-green-400 font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {server.online_member_count?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="border-t border-white/5 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-sm flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Added
                                        </span>
                                        <span className="text-slate-300 text-sm">
                                            {server.created_at ? new Date(server.created_at).toLocaleDateString() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share Card */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Share2 className="w-4 h-4" /> Share
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`nsfwserver-finder.vercel.app/server/${server._id}`}
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-500 outline-none truncate"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`https://nsfwserver-finder.vercel.app/server/${server._id}`);
                                        showToast('Link copied!', 'success');
                                    }}
                                    className="bg-discord-blurple/20 hover:bg-discord-blurple/30 text-discord-blurple p-2 rounded-lg transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => !isEditing && setEditModalOpen(false)}
                title="Edit Server"
                footer={
                    <>
                        <button
                            onClick={() => setEditModalOpen(false)}
                            disabled={isEditing}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={isEditing || !newName.trim()}
                            className="px-4 py-2 text-sm bg-discord-blurple hover:bg-discord-blurple/90 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isEditing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Server Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-discord-blurple transition-all"
                                placeholder="Enter server name"
                            />
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                                title="Fetch current name from Discord"
                            >
                                {isSyncing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <RefreshCw className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => !isDeleting && setDeleteModalOpen(false)}
                title="Delete Server"
                footer={
                    <>
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Server'
                            )}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p>Are you sure you want to delete <span className="font-bold text-white">{server?.name}</span>?</p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-400 text-sm flex gap-2">
                            <Trash2 className="w-5 h-5 flex-shrink-0" />
                            This action cannot be undone.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default function ServerDetailsClient(props: ServerDetailsProps) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <ServerDetailsContent {...props} />
        </Suspense>
    );
}
