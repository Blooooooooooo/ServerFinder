'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

            if (statsData.success) {
                setStats(statsData.data);
            }

            if (activityData.success) {
                setRecentActivity(activityData.data);
            }

            if (settingsData.success) {
                setSettings(settingsData.data);
            }
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
            <div className="min-h-screen pt-28 px-6 pb-12 max-w-6xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-32 w-32 bg-white/10 rounded-full mb-6 mx-auto"></div>
                    <div className="h-8 w-48 bg-white/10 rounded mb-4 mx-auto"></div>
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 px-6 pb-12 max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
                {/* User Info */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src={session?.user?.image || ''}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white/10 mb-4"
                    />
                    <h1 className="text-4xl font-bold">{session?.user?.name}</h1>
                </div>

                {/* Account Stats */}
                {stats && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>📈</span> Account Stats
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-slate-400 text-sm mb-1">Member Since</div>
                                <div className="text-xl font-bold">
                                    {new Date(stats.first_login).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-slate-400 text-sm mb-1">Favorites</div>
                                <div className="text-xl font-bold">{stats.favorites_count}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-slate-400 text-sm mb-1">Servers Viewed</div>
                                <div className="text-xl font-bold">{stats.total_views}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-slate-400 text-sm mb-1">Searches</div>
                                <div className="text-xl font-bold">{stats.total_searches}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span>📊</span> Recent Activity
                            </h2>
                            <button
                                onClick={toggleShowActivity}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${settings.show_activity
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }`}
                                title={settings.show_activity ? 'Visible to others' : 'Hidden from others'}
                            >
                                {settings.show_activity ? (
                                    <>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                        Private
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recentActivity.map((activity, index) => (
                                <a
                                    key={index}
                                    href={`/server/${activity.server._id}`}
                                    className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {activity.server.icon_url ? (
                                            <img
                                                src={activity.server.icon_url}
                                                alt={activity.server.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold">
                                                {activity.server.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">{activity.server.name}</div>
                                        <div className="text-sm text-slate-400">
                                            Viewed {getTimeSince(activity.viewed_at)}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>🔗</span> Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/favorites"
                            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-discord-hot-blue/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-discord-hot-blue" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-bold">View Favorites</div>
                                <div className="text-sm text-slate-400">Your bookmarked servers</div>
                            </div>
                        </a>

                        <a
                            href="/servers"
                            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-discord-hot-orange/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-discord-hot-orange" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-bold">Browse Servers</div>
                                <div className="text-sm text-slate-400">Discover new communities</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
