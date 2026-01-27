import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserStats from '@/models/UserStats';

// GET - Get Discord user info by user ID
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        await connectDB();

        // Check if user exists in our system
        const userStats = await UserStats.findOne({ user_id: userId });
        if (!userStats) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Fetch Discord user info
        try {
            const discordRes = await fetch(`https://discord.com/api/v10/users/${userId}`, {
                headers: {
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
                }
            });

            if (discordRes.ok) {
                const discordUser = await discordRes.json();
                // Animated avatars start with 'a_' and need .gif extension
                const avatarExt = discordUser.avatar?.startsWith('a_') ? 'gif' : 'png';
                return NextResponse.json({
                    success: true,
                    data: {
                        username: discordUser.username,
                        discriminator: discordUser.discriminator,
                        avatar: discordUser.avatar
                            ? `https://cdn.discordapp.com/avatars/${userId}/${discordUser.avatar}.${avatarExt}?size=256`
                            : null
                    }
                });
            }
        } catch (err) {
            console.error('Failed to fetch Discord user:', err);
        }

        // Fallback if Discord API fails
        return NextResponse.json({
            success: true,
            data: {
                username: 'Discord User',
                discriminator: null,
                avatar: null
            }
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user info' },
            { status: 500 }
        );
    }
}
