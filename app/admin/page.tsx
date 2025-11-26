'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface RecentServer {
    _id: string;
    name: string;
    icon_url?: string;
    current_member_count: number;
    is_partner: boolean;
    created_at: string;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        totalServers: 0,
        totalSearches: 0,
        pendingServers: 0
    });
    const [recentServers, setRecentServers] = useState<RecentServer[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(true);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats(prev => ({
                        ...prev,
                        totalServers: data.data.totalServers,
                        totalSearches: data.data.totalSearches
                    }));
                }
            });

        // Fetch activity
        fetch('/api/activity')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRecentServers(data.data.recentServers);
                }
            })
            .finally(() => setLoadingActivity(false));
    }, []);

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const isSuperAdmin = session?.user && (session.user as any).id === '1215303359045701652';

    return (
        <div className="min-h-screen pt-28 px-6 pb-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 animate-slide-up">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                        Welcome back, <span className="gradient-text">{session?.user?.name}</span>
                    </h1>
                    <p className="text-slate-400 text-lg">Here's what's happening across your directory today.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        System Operational
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-discord-hot-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z" /></svg>
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1">Total Servers</h3>
                    <p className="text-4xl font-bold text-white mb-2">{stats.totalServers.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-green-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        <span>+12% this week</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-discord-hot-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1">Total Searches</h3>
                    <p className="text-4xl font-bold text-white mb-2">{stats.totalSearches.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-green-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        <span>+5.3% today</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1">Pending Approvals</h3>
                    <p className="text-4xl font-bold text-white mb-2">{stats.pendingServers}</p>
                    <div className="flex items-center text-sm text-slate-400">
                        <span>Action required</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-2xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <Link href="/admin/servers" className="group relative glass-card p-8 rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-discord-hot-blue/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-discord-hot-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-discord-hot-blue transition-colors">Manage Servers</h3>
                            <p className="text-slate-400 max-w-sm">Review server listings, manage partnerships, and control server visibility in the directory.</p>
                        </div>
                        <div className="p-3 bg-discord-hot-blue/10 rounded-xl group-hover:bg-discord-hot-blue/20 transition-colors">
                            <svg className="w-8 h-8 text-discord-hot-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center text-sm font-medium text-discord-hot-blue opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Server List <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </Link>

                <Link href="/admin/analytics" className="group relative glass-card p-8 rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-green-500/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Search Analytics</h3>
                            <p className="text-slate-400 max-w-sm">View search trends, popular terms, click-through rates, and failed searches.</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center text-sm font-medium text-green-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Analytics <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </Link>

                {isSuperAdmin && (
                    <Link href="/admin/users" className="group relative glass-card p-8 rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-discord-hot-orange/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-discord-hot-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-discord-hot-orange transition-colors">Manage Admins</h3>
                                <p className="text-slate-400 max-w-sm">Add or remove admin users who can access the admin panel.</p>
                            </div>
                            <div className="p-3 bg-discord-hot-orange/10 rounded-xl group-hover:bg-discord-hot-orange/20 transition-colors">
                                <svg className="w-8 h-8 text-discord-hot-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center text-sm font-medium text-discord-hot-orange opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Manage Users <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </Link>
                )}
            </div>

            {/* Activity Monitor */}
            <h2 className="text-2xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '400ms' }}>Recent Activity</h2>
            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
                {loadingActivity ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                ) : recentServers.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No recent activity</p>
                ) : (
                    <div className="space-y-2">
                        {recentServers.map(server => (
                            <div key={server._id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {server.icon_url ? (
                                        <img src={server.icon_url} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold flex-shrink-0">{server.name.substring(0, 2)}</div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{server.name}</p>
                                        <p className="text-xs text-slate-500">{server.current_member_count.toLocaleString()} members</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {server.is_partner && (
                                        <span className="text-xs bg-discord-hot-orange/20 text-discord-hot-orange px-2 py-1 rounded">Partner</span>
                                    )}
                                    <span className="text-xs text-slate-500 whitespace-nowrap">{formatTimeAgo(server.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
