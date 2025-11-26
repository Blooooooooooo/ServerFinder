import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserStats from '@/models/UserStats';
import UserSettings from '@/models/UserSettings';
import Favorite from '@/models/Favorite';

// GET - Get user's stats (own or public)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get('userId');

        // If requesting someone else's stats
        if (requestedUserId) {
            await connectDB();

            // Check if profile is public
            const settings = await UserSettings.findOne({ user_id: requestedUserId });
            if (settings && !settings.profile_public) {
                return NextResponse.json({ success: false, error: 'Profile is private' }, { status: 403 });
            }

            const userStats = await UserStats.findOne({ user_id: requestedUserId });
            if (!userStats) {
                return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
            }

            const favoritesCount = settings?.show_favorites
                ? await Favorite.countDocuments({ user_id: requestedUserId })
                : 0;

            return NextResponse.json({
                success: true,
                data: {
                    ...userStats.toObject(),
                    favorites_count: favoritesCount
                }
            });
        }

        // Getting own stats
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // Get or create user stats
        let userStats = await UserStats.findOne({ user_id: userId });

        if (!userStats) {
            userStats = await UserStats.create({
                user_id: userId,
                first_login: new Date(),
                last_active: new Date()
            });
        }

        // Get favorites count
        const favoritesCount = await Favorite.countDocuments({ user_id: userId });

        return NextResponse.json({
            success: true,
            data: {
                ...userStats.toObject(),
                favorites_count: favoritesCount
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
