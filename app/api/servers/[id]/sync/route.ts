import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await connectDB();

        // 1. Get the server from DB to find the guild_id
        const server = await Server.findById(params.id);
        if (!server) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        if (!server.guild_id) {
            return NextResponse.json(
                { success: false, error: 'Server record has no Guild ID associated.' },
                { status: 400 }
            );
        }

        // 2. Fetch Guild Info from Discord API
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json(
                { success: false, error: 'Bot configuration missing (Token)' },
                { status: 500 }
            );
        }

        const discordRes = await fetch(`https://discord.com/api/v10/guilds/${server.guild_id}`, {
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!discordRes.ok) {
            const errData = await discordRes.json();
            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to fetch from Discord: ${errData.message || discordRes.statusText}`
                },
                { status: discordRes.status }
            );
        }

        const guildData = await discordRes.json();

        // 3. Return the data (do not save yet, let the user decide)
        // Construct icon URL
        const iconUrl = guildData.icon
            ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png`
            : null;

        return NextResponse.json({
            success: true,
            data: {
                name: guildData.name,
                icon_url: iconUrl,
                member_count: guildData.approximate_member_count // Note: Might be missing depending on intents/endpoints
            }
        });

    } catch (error) {
        console.error('Error syncing server info:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
