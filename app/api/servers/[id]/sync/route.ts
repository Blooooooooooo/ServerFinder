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

        // 2. Extract Invite Code
        // Supported formats: https://discord.gg/code, https://discord.com/invite/code, or just 'code'
        const inviteLink = server.link || '';
        let inviteCode = '';

        try {
            if (inviteLink.includes('/')) {
                const url = new URL(inviteLink.startsWith('http') ? inviteLink : `https://${inviteLink}`);
                inviteCode = url.pathname.split('/').pop() || '';
            } else {
                inviteCode = inviteLink;
            }
        } catch (e) {
            inviteCode = inviteLink.split('/').pop() || '';
        }

        if (!inviteCode) {
            return NextResponse.json(
                { success: false, error: 'Could not parse invite code from server link.' },
                { status: 400 }
            );
        }

        // 3. Fetch Invite Info from Discord API
        // This works even if the bot is NOT in the server
        const discordRes = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`, {
            method: 'GET'
        });

        if (!discordRes.ok) {
            const errData = await discordRes.json();
            console.error('Discord API Error:', errData);

            if (discordRes.status === 404) {
                return NextResponse.json(
                    { success: false, error: 'Invite link is invalid or expired.' },
                    { status: 404 }
                );
            }

            // Rate limit handling - return retry_after for the client
            if (discordRes.status === 429) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Rate limited by Discord',
                        retry_after: errData.retry_after || 1
                    },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to fetch from Discord: ${errData.message || discordRes.statusText}`
                },
                { status: discordRes.status }
            );
        }

        const inviteData = await discordRes.json();
        const guildData = inviteData.guild;

        if (!guildData) {
            return NextResponse.json(
                { success: false, error: 'Invite data did not contain server info.' },
                { status: 400 }
            );
        }

        // 4. Build the update data
        // Animated icons start with 'a_' and need .gif extension
        const iconExt = guildData.icon?.startsWith('a_') ? 'gif' : 'png';
        const iconUrl = guildData.icon
            ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.${iconExt}?size=256`
            : null;

        // Animated banners also start with 'a_' and need .gif extension
        const bannerExt = guildData.banner?.startsWith('a_') ? 'gif' : 'png';
        const bannerUrl = guildData.banner
            ? `https://cdn.discordapp.com/banners/${guildData.id}/${guildData.banner}.${bannerExt}?size=1024`
            : null;

        // 5. Save the synced data to database
        const updateData: Record<string, unknown> = {
            name: guildData.name,
            current_member_count: inviteData.approximate_member_count,
            online_member_count: inviteData.approximate_presence_count,
            last_synced: new Date()
        };

        if (iconUrl) updateData.icon_url = iconUrl;
        if (bannerUrl) updateData.banner_url = bannerUrl;

        await Server.findByIdAndUpdate(params.id, updateData);

        return NextResponse.json({
            success: true,
            data: {
                name: guildData.name,
                icon_url: iconUrl,
                banner_url: bannerUrl,
                member_count: inviteData.approximate_member_count,
                online_count: inviteData.approximate_presence_count
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
