'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { IServer } from '@/models/Server';
import { IGrowthHistory } from '@/models/GrowthHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

function ServerDetailsContent() {
    const params = useParams();
    const id = params.id as string;
    const { data: session } = useSession();

    const [server, setServer] = useState<IServer | null>(null);
    const [growthHistory, setGrowthHistory] = useState<IGrowthHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [serverRes, growthRes] = await Promise.all([
                    fetch(`/api/servers/${id}`),
                    fetch(`/api/servers/${id}/growth`)
                ]);

                const serverData = await serverRes.json();
                const growthData = await growthRes.json();

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

                if (growthData.success) {
                    // Format dates for chart
                    const formattedGrowth = growthData.data.map((item: any) => ({
                        ...item,
                        date: new Date(item.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }));
                    setGrowthHistory(formattedGrowth);
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
            <Navigation />

            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                {server.banner_url ? (
                    <img src={server.banner_url} alt={`${server.name} banner`} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full bg-slate-800`}></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative -mt-32 z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                    {/* Server Icon */}
                    <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-background overflow-hidden shadow-2xl ${!server.icon_url ? 'bg-slate-700 flex items-center justify-center' : ''}`}>
                        {server.icon_url ? (
                            <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-white">{server.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>

                    {/* Server Info */}
                    <div className="flex-1 mb-4 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex items-center gap-3">
                            {server.name}
                            {server.is_partner && (
                                <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                    Partner
                                </span>
                            )}
                        </h1>
                        <div className="flex flex-wrap gap-3">
                            {server.letter_category && (
                                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium border border-white/5">
                                    Category: {server.letter_category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={handleJoin}
                            className="flex-1 md:flex-none btn-primary py-3 px-8 text-lg shadow-lg shadow-discord-blurple/20"
                        >
                            Join Server
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span>📝</span> About This Server
                            </h2>
                            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {server.description || "No description provided."}
                            </div>
                        </div>

                        {/* Growth Graph */}
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span>📈</span> Member Growth
                            </h2>
                            <div className="h-80 w-full">
                                {growthHistory.length > 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthHistory}>
                                            <defs>
                                                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#5865F2" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#5865F2" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                                                itemStyle={{ color: '#f1f5f9' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="member_count"
                                                stroke="#5865F2"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorMembers)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p>Not enough data to display growth graph yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Server Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                    <span className="text-slate-400">Members</span>
                                    <span className="text-white font-bold text-lg">{server.current_member_count?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                    <span className="text-slate-400">Online</span>
                                    <span className="text-green-400 font-bold text-lg flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        {server.online_member_count?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                    <span className="text-slate-400">Added</span>
                                    <span className="text-white font-medium">
                                        {server.created_at ? new Date(server.created_at).toLocaleDateString() : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Share Card */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Share Server</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`https://serverfinder.com/server/${server._id}`}
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400 outline-none"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(`https://serverfinder.com/server/${server._id}`)}
                                    className="bg-discord-blurple hover:bg-discord-blurple-dark text-white p-2 rounded-lg transition-colors"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ServerDetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <ServerDetailsContent />
        </Suspense>
    );
}
