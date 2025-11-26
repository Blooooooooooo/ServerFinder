'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ServerCardProps {
    server: {
        _id: string;
        name: string;
        link: string;
        current_member_count?: number;
        online_member_count?: number;
        letter_category?: string;
        icon_url?: string;
        banner_url?: string;
        description?: string;
        is_partner?: boolean;
    };
}

export default function ServerCard({ server }: ServerCardProps) {
    const { data: session } = useSession();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            checkIfFavorited();
        } else {
            setIsFavorited(false);
        }
    }, [session]);

    const checkIfFavorited = async () => {
        try {
            const res = await fetch(`/api/favorites/check/${server._id}`);
            const data = await res.json();
            setIsFavorited(data.isFavorited || false);
        } catch (error) {
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!session?.user) {
            alert('Please log in to add favorites');
            return;
        }

        setIsLoading(true);
        try {
            if (isFavorited) {
                // Remove favorite
                const res = await fetch(`/api/favorites?server_id=${server._id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setIsFavorited(false);
                }
            } else {
                // Add favorite
                const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ server_id: server._id })
                });
                if (res.ok) {
                    setIsFavorited(true);
                }
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = () => {
        window.open(server.link, '_blank', 'noopener,noreferrer');
    };

    // Generate a deterministic color based on server name for the placeholder
    const getPlaceholderColor = (name: string) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const placeholderColor = getPlaceholderColor(server.name);
    const initials = server.name.substring(0, 2).toUpperCase();

    const handleCardClick = () => {
        window.location.href = `/server/${server._id}`;
    };

    return (
        <div
            className={`card group cursor-pointer h-full flex flex-col p-0 overflow-hidden bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-300 relative ${server.is_partner
                ? 'border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] hover:border-yellow-400'
                : 'border-0'
                }`}
            onClick={handleCardClick}
        >
            {/* Favorite Button - Top Right */}
            {session?.user && (
                <button
                    onClick={toggleFavorite}
                    disabled={isLoading}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorited ? (
                        <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                </button>
            )}

            {/* Banner / Header */}
            <div className={`h-24 w-full ${!server.banner_url ? placeholderColor : 'bg-slate-800'} relative overflow-hidden`}>
                {server.banner_url ? (
                    <img
                        src={server.banner_url}
                        alt={`${server.name} banner`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-black/20"></div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                {/* Icon & Name Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${!server.icon_url ? placeholderColor : 'bg-slate-800'} border-2 border-slate-700 flex items-center justify-center shadow-lg overflow-hidden`}>
                        {server.icon_url ? (
                            <img
                                src={server.icon_url}
                                alt={`${server.name} icon`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-white">{initials}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-discord-blurple transition-colors duration-200 truncate">
                            {server.name}
                        </h3>
                        {server.letter_category && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 uppercase tracking-wider">
                                {server.letter_category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                    {server.description || `Join ${server.name} to chat, play games, and make new friends! A great community waiting for you.`}
                </p>

                {/* Footer Stats & Button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-discord-green mr-1.5"></span>
                            {server.online_member_count?.toLocaleString() || 0} Online
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-600 mr-1.5"></span>
                            {server.current_member_count?.toLocaleString() || 0} Members
                        </div>
                    </div>

                    <button
                        className="px-4 py-1.5 rounded-lg bg-discord-blurple hover:bg-discord-blurple-dark text-white text-sm font-semibold transition-colors shadow-lg shadow-discord-blurple/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleJoin();
                        }}
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
}
