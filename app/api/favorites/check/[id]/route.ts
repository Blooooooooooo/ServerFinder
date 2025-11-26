import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Favorite from '@/models/Favorite';

// GET - Check if specific server is favorited
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ isFavorited: false });
        }

        const userId = (session.user as any).id;
        const { id } = await params; // Await params in Next.js 15
        await connectDB();

        const favorite = await Favorite.findOne({
            user_id: userId,
            server_id: id
        });

        return NextResponse.json({
            isFavorited: !!favorite
        });
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return NextResponse.json({ isFavorited: false });
    }
}
