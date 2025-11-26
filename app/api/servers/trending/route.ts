import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';
import { Search } from '@/models/Search';

export async function GET() {
    try {
        await connectDB();

        // Get top 10 most searched servers
        const topSearches = await Search.find()
            .sort({ search_count: -1 })
            .limit(10)
            .lean();

        // Get the corresponding server details
        const serverPromises = topSearches.map(async (search) => {
            const server = await Server.findOne({
                name: { $regex: new RegExp(`^${search.search_term}$`, 'i') }
            }).lean();

            return server ? {
                ...server,
                searchCount: search.search_count,
                lastSearched: search.last_searched_at
            } : null;
        });

        const serversWithSearchData = await Promise.all(serverPromises);
        const trendingServers = serversWithSearchData.filter(server => server !== null);

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
