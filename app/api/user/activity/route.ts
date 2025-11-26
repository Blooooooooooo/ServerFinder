import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import UserStats from '@/models/UserStats';
import UserSettings from '@/models/UserSettings';
import Server from '@/models/Server';

// GET - Get user's recent activity (own or public)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get('userId');

        // If requesting someone else's activity
        if (requestedUserId) {
            await connectDB();

            // Check privacy settings
            const settings = await UserSettings.findOne({ user_id: requestedUserId });
            if (!settings?.show_activity || !settings?.profile_public) {
                return NextResponse.json({ success: true, data: [] }); // Return empty array if private
            }

            const recentActivity = await UserActivity.find({ user_id: requestedUserId })
                .sort({ viewed_at: -1 })
                .limit(10)
                .lean();

            const serverIds = [...new Set(recentActivity.map(act => act.server_id))];
            const servers = await Server.find({ _id: { $in: serverIds } }).lean();

            const activityWithDetails = recentActivity.map(activity => {
                const server = servers.find(s => s._id === activity.server_id);
                return {
                    ...activity,
                    server
                };
            }).filter(item => item.server);

            return NextResponse.json({
                success: true,
                data: activityWithDetails
            });
        }

        // Getting own activity
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // Get recent activity (last 10 views)
        const recentActivity = await UserActivity.find({ user_id: userId })
            .sort({ viewed_at: -1 })
            .limit(10)
            .lean();

        // Get server details for each activity
        const serverIds = [...new Set(recentActivity.map(act => act.server_id))];
        const servers = await Server.find({ _id: { $in: serverIds } }).lean();

        // Map activities with server details
        const activityWithDetails = recentActivity.map(activity => {
            const server = servers.find(s => s._id === activity.server_id);
            return {
                ...activity,
                server
            };
        }).filter(item => item.server); // Filter out activities for deleted servers

        return NextResponse.json({
            success: true,
            data: activityWithDetails
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}

// POST - Log a new activity
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { server_id, activity_type = 'view' } = await request.json();

        if (!server_id) {
            return NextResponse.json(
                { success: false, error: 'Server ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Log activity
        await UserActivity.create({
            user_id: userId,
            server_id,
            activity_type
        });

        // Update user stats
        await UserStats.findOneAndUpdate(
            { user_id: userId },
            {
                $inc: activity_type === 'view' ? { total_views: 1 } : { total_searches: 1 },
                $set: { last_active: new Date() },
                $setOnInsert: { first_login: new Date() }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to log activity' },
            { status: 500 }
        );
    }
}
