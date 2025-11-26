import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';
import { Search, WeeklySearch } from '@/models/Search';

export async function GET() {
    try {
        await connectDB();

        // Get statistics
        const [
            totalServers,
            totalSearches,
            serversByCategory,
            recentServers
        ] = await Promise.all([
            Server.countDocuments(),
            Search.aggregate([
                { $group: { _id: null, total: { $sum: '$search_count' } } }
            ]),
            Server.aggregate([
                { $group: { _id: '$letter_category', count: { $count: {} } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),
            Server.find()
                .sort({ approved_at: -1 })
                .limit(5)
                .select('name approved_at current_member_count')
                .lean()
        ]);

        const totalSearchCount = totalSearches[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data: {
                totalServers,
                totalSearches: totalSearchCount,
                topCategories: serversByCategory,
                recentServers
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
