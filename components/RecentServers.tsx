'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Server {
    _id: string;
    name: string;
    icon_url?: string;
    current_member_count: number;
    is_partner: boolean;
}

export default function RecentServers() {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchRecentServers();
    }, []);

    const fetchRecentServers = async () => {
        try {
            const res = await fetch('/api/servers?limit=12&sortBy=created_at&sortOrder=desc');
            const data = await res.json();
            if (data.success) {
                setServers(data.data.servers);
            }
        } catch (error) {
            console.error('Failed to fetch recent servers', error);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="h-8 w-48 bg-white/10 rounded mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (servers.length === 0) return null;

    return (
        <div className="py-20 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Recently Added</h2>
                    <p className="text-slate-400">Check out the newest servers in the directory</p>
                </div>

                {/* Carousel Container with Side Arrows */}
                <div className="relative">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="hidden md:flex absolute left-0 top-0 bottom-0 -translate-x-6 z-10 w-16 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-discord-hot-blue/50 transition-all duration-300 hover:scale-105"
                        aria-label="Scroll left"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="hidden md:flex absolute right-0 top-0 bottom-0 translate-x-6 z-10 w-16 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-discord-hot-blue/50 transition-all duration-300 hover:scale-105"
                        aria-label="Scroll right"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Scrollable container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {servers.map((server) => (
                            <Link
                                key={server._id}
                                href={`/server/${server._id}`}
                                className="group flex-none w-72 glass-card rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-discord-hot-blue/50"
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
                                        <h3 className="font-bold text-lg mb-1 truncate group-hover:text-discord-hot-blue transition-colors">
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
                                    <div className="inline-flex items-center text-xs bg-discord-hot-orange/20 text-discord-hot-orange px-3 py-1 rounded-full">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Partner
                                    </div>
                                )}
                                <div className="mt-4 flex items-center text-sm text-discord-hot-blue opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Server <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
