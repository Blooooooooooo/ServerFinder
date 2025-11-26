'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';

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

interface DiscordUserInfo {
    username: string;
    discriminator: string | null;
    avatar: string | null;
}

function PublicProfileContent() {
    const params = useParams();
    const userId = params.userId as string;

    const [userInfo, setUserInfo] = useState<DiscordUserInfo | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const [userInfoRes, statsRes, activityRes] = await Promise.all([
                fetch(`/api/user/info/${userId}`),
                fetch(`/api/user/stats?userId=${userId}`),
                fetch(`/api/user/activity?userId=${userId}`)
            ]);

            const userInfoData = await userInfoRes.json();
            const statsData = await statsRes.json();
            const activityData = await activityRes.json();

            if (userInfoData.success) {
                setUserInfo(userInfoData.data);
            }

            if (!statsData.success) {
                setError(statsData.error || 'Failed to load profile');
                return;
            }

            setStats(statsData.data);
            setRecentActivity(activityData.data || []);
        } catch (err) {
            setError('Failed to load profile');
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

    if (loading) {
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

    if (error) {
        return (
            <div className="min-h-screen pt-28 px-6 pb-12 max-w-6xl mx-auto">
                <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-3xl font-bold mb-2">{error}</h1>
                    <p className="text-slate-400 mb-6">This profile is private or doesn't exist.</p>
                    <a href="/servers" className="btn-primary">
                        Browse Servers
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 px-6 pb-12 max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
                {/* User Info */}
                <div className="flex flex-col items-center mb-8">
                    {userInfo?.avatar ? (
                        <img
                            src={userInfo.avatar}
                            alt={userInfo.username}
                            className="w-32 h-32 rounded-full border-4 border-white/10 mb-4"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-white/10 mb-4 bg-slate-700 flex items-center justify-center">
                            <span className="text-4xl font-bold">
                                {userInfo?.username ? userInfo.username.substring(0, 2).toUpperCase() : '🧑'}
                            </span>
                        </div>
                    )}
                    <h1 className="text-4xl font-bold">
                        {userInfo?.username || 'Discord User'}
                    </h1>
                    <p className="text-slate-400">User ID: {userId}</p>
                </div>

                {/* Account Stats */}
                {stats && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>📈</span> Account Stats
                        </h2>
                        <div className={`grid gap-4 ${stats.favorites_count > 0 ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3 max-w-3xl mx-auto'}`}>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <div className="text-slate-400 text-sm mb-1">Member Since</div>
                                <div className="text-xl font-bold">
                                    {new Date(stats.first_login).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            {stats.favorites_count > 0 && (
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <div className="text-slate-400 text-sm mb-1">Favorites</div>
                                    <div className="text-xl font-bold">{stats.favorites_count}</div>
                                </div>
                            )}
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
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>📊</span> Recent Activity
                        </h2>
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

                {/* Back to Servers */}
                <div className="text-center pt-4">
                    <a href="/servers" className="btn-primary">
                        Browse Servers
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function PublicProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <PublicProfileContent />
        </Suspense>
    );
}
