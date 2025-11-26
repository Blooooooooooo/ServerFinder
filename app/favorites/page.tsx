'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Server {
    _id: string;
    name: string;
    icon_url?: string;
    current_member_count: number;
    is_partner: boolean;
    favorited_at: Date;
}

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchFavorites();
        }
    }, [status]);

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
        try {
            const res = await fetch(`/api/favorites?server_id=${serverId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setFavorites(favorites.filter(f => f._id !== serverId));
            }
        } catch (error) {
            console.error('Failed to remove favorite:', error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen pt-28 px-6 pb-12 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-10 w-64 bg-white/10 rounded mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-white/5 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 px-6 pb-12 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    ⭐ <span className="gradient-text">My Favorites</span>
                </h1>
                <p className="text-slate-400 text-lg">
                    Your bookmarked servers ({favorites.length})
                </p>
            </div>

            {favorites.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-6xl mb-4">💔</div>
                    <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
                    <p className="text-slate-400 mb-6">
                        Start exploring and add servers to your favorites!
                    </p>
                    <Link href="/servers" className="btn-primary inline-block">
                        Browse Servers
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((server) => (
                        <div
                            key={server._id}
                            className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/5"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                {server.icon_url ? (
                                    <img
                                        src={server.icon_url}
                                        alt={server.name}
                                        className="w-16 h-16 rounded-full flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold flex-shrink-0">
                                        {server.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg mb-1 truncate">
                                        {server.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                        <span>{server.current_member_count?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            {server.is_partner && (
                                <div className="inline-flex items-center text-xs bg-discord-hot-orange/20 text-discord-hot-orange px-3 py-1 rounded-full mb-4">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Partner
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link
                                    href={`/server/${server._id}`}
                                    className="flex-1 btn-primary py-2 px-4 text-sm text-center"
                                >
                                    View Server
                                </Link>
                                <button
                                    onClick={() => removeFavorite(server._id)}
                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
                                    title="Remove from favorites"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
