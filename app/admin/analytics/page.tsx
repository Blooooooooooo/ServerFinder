'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SearchTerm {
    search_term: string;
    total_searches: number;
    total_clicks: number;
    failed_searches: number;
    click_rate: number;
}

interface TrendingSearch {
    search_term: string;
    recent_count: number;
    previous_count: number;
    growth_percentage: number;
}

interface FailedSearch {
    search_term: string;
    count: number;
}

interface AnalyticsStats {
    total_searches: number;
    total_clicks: number;
    total_failed: number;
    overall_click_rate: string;
    failed_rate: string;
}

export default function SearchAnalytics() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');
    const [stats, setStats] = useState<AnalyticsStats>({
        total_searches: 0,
        total_clicks: 0,
        total_failed: 0,
        overall_click_rate: '0',
        failed_rate: '0'
    });
    const [popularSearches, setPopularSearches] = useState<SearchTerm[]>([]);
    const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
    const [failedSearches, setFailedSearches] = useState<FailedSearch[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/search?days=${timeRange}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.data.stats);
                setPopularSearches(data.data.popular_searches);
                setTrendingSearches(data.data.trending_searches);
                setFailedSearches(data.data.failed_searches);
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 md:px-6 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Analytics</h1>
                    <p className="text-slate-400">Insights into user search behavior and trends</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-discord-hot-blue w-full md:w-auto"
                >
                    <option value="7" className="bg-gray-900 text-white">Last 7 days</option>
                    <option value="30" className="bg-gray-900 text-white">Last 30 days</option>
                    <option value="90" className="bg-gray-900 text-white">Last 90 days</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Total Searches</h3>
                    <p className="text-3xl font-bold text-white">{loading ? '-' : stats.total_searches.toLocaleString()}</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Click-Through Rate</h3>
                    <p className="text-3xl font-bold text-green-400">{loading ? '-' : stats.overall_click_rate}%</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Total Clicks</h3>
                    <p className="text-3xl font-bold text-discord-hot-blue">{loading ? '-' : stats.total_clicks.toLocaleString()}</p>
                </div>
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Failed Searches</h3>
                    <p className="text-3xl font-bold text-red-400">{loading ? '-' : `${stats.total_failed} (${stats.failed_rate}%)`}</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Popular Searches */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <svg className="w-5 h-5 text-discord-hot-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                            Popular Searches
                        </h2>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
                                ))}
                            </div>
                        ) : popularSearches.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No data yet</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-slate-400">
                                    <tr>
                                        <th className="p-3 text-left">Term</th>
                                        <th className="p-3 text-right">Searches</th>
                                        <th className="p-3 text-right">CTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {popularSearches.slice(0, 15).map((term, i) => (
                                        <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-medium">{term.search_term}</td>
                                            <td className="p-3 text-right text-slate-400">{term.total_searches}</td>
                                            <td className="p-3 text-right">
                                                <span className={`${term.click_rate > 50 ? 'text-green-400' : term.click_rate > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {term.click_rate.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Trending Searches */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                            Trending Searches
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Last 7 days vs previous 7 days</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
                                ))}
                            </div>
                        ) : trendingSearches.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No trending searches</p>
                        ) : (
                            <div className="p-4 space-y-2">
                                {trendingSearches.slice(0, 10).map((term, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                                        <div>
                                            <p className="font-medium">{term.search_term}</p>
                                            <p className="text-xs text-slate-500">{term.recent_count} searches (was {term.previous_count})</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            <span className="text-green-400 font-bold">{term.growth_percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Failed Searches */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Failed Searches (No Results)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Searches that returned 0 results</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : failedSearches.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No failed searches!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                            {failedSearches.map((term, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                                    <p className="font-medium text-sm truncate flex-1">{term.search_term}</p>
                                    <span className="text-red-400 text-sm font-bold ml-2">{term.count}×</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
