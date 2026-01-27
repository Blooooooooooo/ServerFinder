'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast, { ToastType } from '@/components/Toast';
import { Heart, Star, Users, X, Loader2, Search } from 'lucide-react';

interface Server {
    _id: string;
    name: string;
    icon_url?: string;
    current_member_count: number;
    is_partner: boolean;
    favorited_at: Date;
}

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchFavorites();
        }
    }, [status, router]);

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/favorites');
            const data = await res.json();
            if (data.success) {
                setFavorites(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (serverId: string) => {
        if (removing) return;

        setRemoving(serverId);
        try {
            const url = `/api/favorites?server_id=${encodeURIComponent(serverId)}`;
            const res = await fetch(url, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setFavorites(favorites.filter(f => f._id !== serverId));
                addToast('Server removed from favorites', 'success');
            } else {
                addToast(`Failed to remove: ${data.error}`, 'error');
            }
        } catch (error) {
            addToast('Failed to remove favorite', 'error');
        } finally {
            setRemoving(null);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen pt-28 px-6 pb-12 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-10 w-64 bg-white/10 rounded mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-slate-900/50 border border-white/5 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen pt-28 px-6 pb-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                My Favorites
                            </h1>
                            <p className="text-slate-400">
                                {favorites.length} bookmarked server{favorites.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl">
                        <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-3 text-white">No Favorites Yet</h2>
                        <p className="text-slate-400 mb-6">
                            Start exploring and add servers to your favorites!
                        </p>
                        <Link href="/servers" className="inline-flex items-center gap-2 bg-discord-blurple hover:bg-discord-blurple/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                            <Search className="w-5 h-5" />
                            Browse Servers
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {favorites.map((server) => (
                            <div
                                key={server._id}
                                className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    {server.icon_url ? (
                                        <img
                                            src={server.icon_url}
                                            alt={server.name}
                                            className="w-14 h-14 rounded-xl flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold flex-shrink-0 text-slate-400">
                                            {server.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg mb-1 truncate text-white">
                                            {server.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Users className="w-4 h-4" />
                                            <span>{server.current_member_count?.toLocaleString() || '0'}</span>
                                            {server.is_partner && (
                                                <span className="flex items-center gap-1 text-amber-400">
                                                    <Star className="w-3 h-3" /> Partner
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/server/${server._id}`}
                                        className="flex-1 text-center bg-discord-blurple/20 hover:bg-discord-blurple/30 text-discord-blurple font-medium py-2 px-4 rounded-xl transition-colors text-sm"
                                    >
                                        View Server
                                    </Link>
                                    <button
                                        onClick={() => removeFavorite(server._id)}
                                        disabled={removing === server._id}
                                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                                        title="Remove from favorites"
                                    >
                                        {removing === server._id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <X className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Toast notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
}
