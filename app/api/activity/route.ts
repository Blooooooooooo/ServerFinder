import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

export async function GET() {
    try {
        await connectDB();

        // Get recent servers (last 10)
        const recentServers = await Server.find()
            .sort({ created_at: -1 })
            .limit(10)
            .select('_id name icon_url current_member_count is_partner created_at')
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                recentServers
            }
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}
