'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Star, Eye, Search, Heart, Clock, Settings, EyeOff } from 'lucide-react';

interface UserStats {
    first_login: string;
    total_views: number;
    total_searches: number;
    favorites_count: number;
}

interface RecentActivity {
    server_id: string;
    viewed_at: string;
    server: {
        _id: string;
        name: string;
        icon_url?: string;
    };
}

interface UserSettings {
    show_activity: boolean;
    show_favorites: boolean;
    profile_public: boolean;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [settings, setSettings] = useState<UserSettings>({ show_activity: true, show_favorites: true, profile_public: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const [statsRes, activityRes, settingsRes] = await Promise.all([
                fetch('/api/user/stats'),
                fetch('/api/user/activity'),
                fetch('/api/user/settings')
            ]);

            const statsData = await statsRes.json();
            const activityData = await activityRes.json();
            const settingsData = await settingsRes.json();

            if (statsData.success) setStats(statsData.data);
            if (activityData.success) setRecentActivity(activityData.data);
            if (settingsData.success) setSettings(settingsData.data);
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeSince = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return then.toLocaleDateString();
    };

    const toggleShowActivity = async () => {
        try {
            const newValue = !settings.show_activity;
            const res = await fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ show_activity: newValue })
            });

            if (res.ok) {
                setSettings({ ...settings, show_activity: newValue });
            }
        } catch (error) {
            console.error('Failed to toggle setting:', error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen pt-28 px-6 pb-12 max-w-5xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-24 w-24 bg-white/10 rounded-full mb-6 mx-auto"></div>
                    <div className="h-8 w-48 bg-white/10 rounded mb-4 mx-auto"></div>
                    <div className="h-20 bg-white/5 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 px-6 pb-12 max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <img
                        src={session?.user?.image || ''}
                        alt="Profile"
                        className="w-24 h-24 rounded-2xl border-2 border-white/10"
                    />
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-1">{session?.user?.name}</h1>
                        {stats && (
                            <p className="text-slate-400 text-sm">
                                Member since {new Date(stats.first_login).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-center">
                        <Clock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">
                            {new Date(stats.first_login).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Joined</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-center">
                        <Star className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stats.favorites_count}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Favorites</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-center">
                        <Eye className="w-5 h-5 text-discord-hot-blue mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stats.total_views}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Views</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-center">
                        <Search className="w-5 h-5 text-discord-hot-orange mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stats.total_searches}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Searches</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-discord-hot-blue" /> Recent Activity
                        </h2>
                        <button
                            onClick={toggleShowActivity}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.show_activity
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                        >
                            {settings.show_activity ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {settings.show_activity ? 'Public' : 'Private'}
                        </button>
                    </div>

                    {recentActivity.length > 0 ? (
                        <div className="space-y-2">
                            {recentActivity.slice(0, 5).map((activity, index) => (
                                <a
                                    key={index}
                                    href={`/server/${activity.server._id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {activity.server.icon_url ? (
                                            <img src={activity.server.icon_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-500">
                                                {activity.server.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate text-white">{activity.server.name}</div>
                                        <div className="text-xs text-slate-500">{getTimeSince(activity.viewed_at)}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-8">No recent activity</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" /> Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <a
                            href="/favorites"
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-pink-500" />
                            </div>
                            <div>
                                <div className="font-medium text-white">View Favorites</div>
                                <div className="text-xs text-slate-500">Your bookmarked servers</div>
                            </div>
                        </a>
                        <a
                            href="/servers"
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-discord-hot-blue/20 flex items-center justify-center">
                                <Search className="w-5 h-5 text-discord-hot-blue" />
                            </div>
                            <div>
                                <div className="font-medium text-white">Browse Servers</div>
                                <div className="text-xs text-slate-500">Discover new communities</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
