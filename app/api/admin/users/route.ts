import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

const SUPER_ADMIN_ID = '1215303359045701652';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!session?.user || userId !== SUPER_ADMIN_ID) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        await connectDB();
        const admins = await AdminUser.find().sort({ added_at: -1 }).lean();

        return NextResponse.json({
            success: true,
            data: { admins }
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch admins' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!session?.user || userId !== SUPER_ADMIN_ID) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { discord_id, username, avatar } = body;

        if (!discord_id || !username) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if already admin
        const existing = await AdminUser.findOne({ discord_id });
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'User is already an admin' },
                { status: 400 }
            );
        }

        const admin = await AdminUser.create({
            discord_id,
            username,
            avatar,
            added_by: userId
        });

        return NextResponse.json({
            success: true,
            data: { admin }
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add admin' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!session?.user || userId !== SUPER_ADMIN_ID) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const discord_id = searchParams.get('discord_id');

        if (!discord_id) {
            return NextResponse.json(
                { success: false, error: 'Missing discord_id' },
                { status: 400 }
            );
        }

        // Prevent removing super admin
        if (discord_id === SUPER_ADMIN_ID) {
            return NextResponse.json(
                { success: false, error: 'Cannot remove super admin' },
                { status: 400 }
            );
        }

        await connectDB();
        await AdminUser.deleteOne({ discord_id });

        return NextResponse.json({
            success: true,
            message: 'Admin removed successfully'
        });
    } catch (error) {
        console.error('Error removing admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove admin' },
            { status: 500 }
        );
    }
}
