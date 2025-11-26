import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/models/UserSettings';

// GET - Get user's settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // Get or create default settings
        let settings = await UserSettings.findOne({ user_id: userId });

        if (!settings) {
            settings = await UserSettings.create({
                user_id: userId,
                show_activity: true,
                show_favorites: true,
                profile_public: true
            });
        }

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// POST - Update user's settings
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const updates = await request.json();

        await connectDB();

        const settings = await UserSettings.findOneAndUpdate(
            { user_id: userId },
            { $set: updates },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
