import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SearchAnalytics from '@/models/SearchAnalytics';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        await connectDB();

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get popular search terms
        const popularSearches = await SearchAnalytics.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            {
                $group: {
                    _id: '$search_term',
                    total_searches: { $sum: 1 },
                    total_clicks: {
                        $sum: { $cond: [{ $ne: ['$clicked_server_id', null] }, 1, 0] }
                    },
                    failed_searches: {
                        $sum: { $cond: [{ $eq: ['$results_count', 0] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    search_term: '$_id',
                    total_searches: 1,
                    total_clicks: 1,
                    failed_searches: 1,
                    click_rate: {
                        $cond: [
                            { $gt: ['$total_searches', 0] },
                            { $multiply: [{ $divide: ['$total_clicks', '$total_searches'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { total_searches: -1 } },
            { $limit: 50 }
        ]);

        // Get trending searches (increased search volume in last 7 days vs previous 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const previous7Days = new Date();
        previous7Days.setDate(previous7Days.getDate() - 14);

        const recentSearches = await SearchAnalytics.aggregate([
            { $match: { timestamp: { $gte: last7Days } } },
            { $group: { _id: '$search_term', count: { $sum: 1 } } }
        ]);

        const olderSearches = await SearchAnalytics.aggregate([
            { $match: { timestamp: { $gte: previous7Days, $lt: last7Days } } },
            { $group: { _id: '$search_term', count: { $sum: 1 } } }
        ]);

        // Calculate trending
        const recentMap = new Map(recentSearches.map(s => [s._id, s.count]));
        const olderMap = new Map(olderSearches.map(s => [s._id, s.count]));

        const trending = Array.from(recentMap.entries())
            .map(([term, recentCount]) => {
                const oldCount = olderMap.get(term) || 0;
                const growth = oldCount > 0 ? ((recentCount - oldCount) / oldCount) * 100 : 100;
                return {
                    search_term: term,
                    recent_count: recentCount,
                    previous_count: oldCount,
                    growth_percentage: Math.round(growth)
                };
            })
            .filter(t => t.growth_percentage > 0)
            .sort((a, b) => b.growth_percentage - a.growth_percentage)
            .slice(0, 20);

        // Get failed searches (0 results)
        const failedSearches = await SearchAnalytics.aggregate([
            { $match: { timestamp: { $gte: startDate }, results_count: 0 } },
            { $group: { _id: '$search_term', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { search_term: '$_id', count: 1, _id: 0 } }
        ]);

        // Overall stats
        const totalSearches = await SearchAnalytics.countDocuments({ timestamp: { $gte: startDate } });
        const totalClicks = await SearchAnalytics.countDocuments({
            timestamp: { $gte: startDate },
            clicked_server_id: { $ne: null }
        });
        const totalFailed = await SearchAnalytics.countDocuments({
            timestamp: { $gte: startDate },
            results_count: 0
        });

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    total_searches: totalSearches,
                    total_clicks: totalClicks,
                    total_failed: totalFailed,
                    overall_click_rate: totalSearches > 0 ? ((totalClicks / totalSearches) * 100).toFixed(2) : 0,
                    failed_rate: totalSearches > 0 ? ((totalFailed / totalSearches) * 100).toFixed(2) : 0
                },
                popular_searches: popularSearches,
                trending_searches: trending,
                failed_searches: failedSearches
            }
        });
    } catch (error) {
        console.error('Error fetching search analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}

// Log a search
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { search_term, results_count, clicked_server_id, session_id } = body;

        if (!search_term) {
            return NextResponse.json(
                { success: false, error: 'Missing search_term' },
                { status: 400 }
            );
        }

        await connectDB();

        await SearchAnalytics.create({
            search_term: search_term.toLowerCase().trim(),
            results_count: results_count || 0,
            clicked_server_id,
            session_id
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging search:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to log search' },
            { status: 500 }
        );
    }
}
