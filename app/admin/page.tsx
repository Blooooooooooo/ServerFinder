'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Server, Search, TrendingUp, AlertCircle, Users, BarChart3, ArrowUpRight, Clock, Star } from 'lucide-react';

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
        <div className="min-h-screen pt-28 px-6 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-discord-hot-blue to-discord-electric-cyan flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Dashboard</p>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Welcome back, {session?.user?.name}
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            All Systems Operational
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {/* Total Servers */}
                    <div className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-discord-hot-blue/30 transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-discord-hot-blue/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-discord-hot-blue/10 transition-colors"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-discord-hot-blue/10 flex items-center justify-center">
                                    <Server className="w-5 h-5 text-discord-hot-blue" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stats.totalServers.toLocaleString()}</p>
                            <p className="text-slate-500 text-sm">Total Servers</p>
                        </div>
                    </div>

                    {/* Total Searches */}
                    <div className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-discord-hot-orange/30 transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-discord-hot-orange/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-discord-hot-orange/10 transition-colors"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-discord-hot-orange/10 flex items-center justify-center">
                                    <Search className="w-5 h-5 text-discord-hot-orange" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+5.3%</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stats.totalSearches.toLocaleString()}</p>
                            <p className="text-slate-500 text-sm">Total Searches</p>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                {stats.pendingServers > 0 && (
                                    <span className="text-amber-500 text-sm font-medium">Needs attention</span>
                                )}
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stats.pendingServers}</p>
                            <p className="text-slate-500 text-sm">Pending Approvals</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Manage Servers */}
                            <Link href="/admin/servers" className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-discord-hot-blue/40 hover:bg-slate-900/70 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-discord-hot-blue/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                        <Server className="w-6 h-6 text-discord-hot-blue" />
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-discord-hot-blue transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-discord-hot-blue transition-colors">Manage Servers</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Review listings, manage partnerships, and control server visibility.</p>
                            </Link>

                            {/* Analytics */}
                            <Link href="/admin/analytics" className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                        <BarChart3 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-500 transition-colors">Search Analytics</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">View trends, popular terms, and click-through rates.</p>
                            </Link>

                            {/* Partners */}
                            <Link href="/admin/partners" className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/40 hover:bg-slate-900/70 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                        <Star className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-purple-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-500 transition-colors">Partner Servers</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Manage featured partner servers and promotions.</p>
                            </Link>

                            {/* Manage Admins - Super Admin Only */}
                            {isSuperAdmin && (
                                <Link href="/admin/users" className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-discord-hot-orange/40 hover:bg-slate-900/70 transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-discord-hot-orange/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                            <Users className="w-6 h-6 text-discord-hot-orange" />
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-discord-hot-orange transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-discord-hot-orange transition-colors">Manage Admins</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">Add or remove admin panel access.</p>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                            <Clock className="w-4 h-4 text-slate-500" />
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                            {loadingActivity ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : recentServers.length === 0 ? (
                                <p className="text-center text-slate-500 py-8 text-sm">No recent activity</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentServers.map(server => (
                                        <div key={server._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                            {server.icon_url ? (
                                                <img src={server.icon_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold flex-shrink-0 text-slate-400">
                                                    {server.name.substring(0, 2)}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm truncate text-white">{server.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500">{server.current_member_count.toLocaleString()} members</span>
                                                    {server.is_partner && (
                                                        <span className="text-xs text-discord-hot-orange">• Partner</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-600 flex-shrink-0">{formatTimeAgo(server.created_at)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
