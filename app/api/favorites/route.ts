import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import Server from '@/models/Server';

// GET - Get user's favorites
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // Get user's favorites
        const favorites = await Favorite.find({ user_id: userId })
            .sort({ added_at: -1 })
            .lean();

        // Get server details for each favorite
        const serverIds = favorites.map(fav => fav.server_id);
        const servers = await Server.find({ _id: { $in: serverIds } }).lean();

        // Map servers with favorite info
        const favoritesWithDetails = favorites.map(fav => {
            const server = servers.find(s => s._id === fav.server_id);
            return {
                ...server,
                favorited_at: fav.added_at
            };
        }).filter(item => item._id); // Filter out any servers that no longer exist

        return NextResponse.json({
            success: true,
            data: favoritesWithDetails
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch favorites' },
            { status: 500 }
        );
    }
}

// POST - Add a favorite
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { server_id } = await request.json();

        if (!server_id) {
            return NextResponse.json(
                { success: false, error: 'Server ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if already favorited
        const existing = await Favorite.findOne({ user_id: userId, server_id });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Already favorited' },
                { status: 400 }
            );
        }

        // Create favorite
        const favorite = await Favorite.create({
            user_id: userId,
            server_id
        });

        return NextResponse.json({
            success: true,
            data: favorite
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add favorite' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a favorite
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const server_id = searchParams.get('server_id');

        if (!server_id) {
            return NextResponse.json(
                { success: false, error: 'Server ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const result = await Favorite.findOneAndDelete({
            user_id: userId,
            server_id
        });

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Favorite not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Favorite removed'
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove favorite' },
            { status: 500 }
        );
    }
}
