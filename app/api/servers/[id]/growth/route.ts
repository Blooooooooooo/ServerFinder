import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GrowthHistory from '@/models/GrowthHistory';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await connectDB();

        // Fetch last 30 days of growth history
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const history = await GrowthHistory.find({
            server_id: params.id,
            recorded_at: { $gte: thirtyDaysAgo }
        })
            .sort({ recorded_at: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching growth history:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch growth history' },
            { status: 500 }
        );
    }
}
