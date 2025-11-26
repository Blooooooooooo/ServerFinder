import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import Server from '@/models/Server';

export async function GET() {
    try {
        await connectDB();

        // Get activities from last 7 days (weekly trending)
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Aggregate view counts per server
        const trending = await UserActivity.aggregate([
            {
                $match: {
                    viewed_at: { $gte: oneWeekAgo },
                    activity_type: 'view'
                }
            },
            {
                $group: {
                    _id: '$server_id',
                    views: { $sum: 1 },
                    latestView: { $max: '$viewed_at' }
                }
            },
            {
                $sort: { views: -1 }
            },
            {
                $limit: 10
            }
        ]);

        if (trending.length === 0) {
            return NextResponse.json({
                success: true,
                data: []
            });
        }

        // Get server details
        const serverIds = trending.map(item => item._id);
        const servers = await Server.find({ _id: { $in: serverIds } }).lean();

        // Map servers with view counts
        const trendingServers = trending
            .map(item => {
                const server = servers.find(s => s._id === item._id);
                if (!server) return null;
                return {
                    ...server,
                    trending_views: item.views,
                    latest_view: item.latestView
                };
            })
            .filter(item => item !== null);

        return NextResponse.json({
            success: true,
            data: trendingServers
        });
    } catch (error) {
        console.error('Error fetching trending servers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch trending servers' },
            { status: 500 }
        );
    }
}
