import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

// Store sync status in memory (in production, use Redis or database)
let syncStatus = {
    isRunning: false,
    current: 0,
    total: 0,
    failed: 0,
    startedAt: null as Date | null,
    completedAt: null as Date | null,
    lastError: null as string | null
};

// GET - Check sync status
export async function GET() {
    return NextResponse.json({
        success: true,
        data: syncStatus
    });
}

// POST - Start sync all servers
export async function POST() {
    if (syncStatus.isRunning) {
        return NextResponse.json({
            success: false,
            error: 'Sync is already running',
            data: syncStatus
        }, { status: 409 });
    }

    // Start async sync process (don't await - let it run in background)
    startBackgroundSync();

    return NextResponse.json({
        success: true,
        message: 'Sync started',
        data: syncStatus
    });
}

// DELETE - Cancel sync
export async function DELETE() {
    if (syncStatus.isRunning) {
        syncStatus.isRunning = false;
        return NextResponse.json({
            success: true,
            message: 'Sync cancelled'
        });
    }
    return NextResponse.json({
        success: false,
        error: 'No sync running'
    }, { status: 400 });
}

async function startBackgroundSync() {
    try {
        await connectDB();

        // Get all servers
        const servers = await Server.find({}, '_id link').lean();

        syncStatus = {
            isRunning: true,
            current: 0,
            total: servers.length,
            failed: 0,
            startedAt: new Date(),
            completedAt: null,
            lastError: null
        };

        for (let i = 0; i < servers.length; i++) {
            // Check if cancelled
            if (!syncStatus.isRunning) {
                syncStatus.lastError = 'Cancelled by user';
                break;
            }

            const server = servers[i];

            try {
                await syncSingleServer(server);
            } catch (error) {
                syncStatus.failed++;
                syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
            }

            syncStatus.current = i + 1;

            // Delay between requests to avoid rate limiting (600ms)
            await new Promise(resolve => setTimeout(resolve, 600));
        }

    } catch (error) {
        syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
    } finally {
        syncStatus.isRunning = false;
        syncStatus.completedAt = new Date();
    }
}

async function syncSingleServer(server: { _id: unknown; link?: string }) {
    if (!server.link) return;

    // Extract invite code
    const inviteLink = server.link;
    let inviteCode = '';

    try {
        if (inviteLink.includes('/')) {
            const url = new URL(inviteLink.startsWith('http') ? inviteLink : `https://${inviteLink}`);
            inviteCode = url.pathname.split('/').pop() || '';
        } else {
            inviteCode = inviteLink;
        }
    } catch {
        inviteCode = inviteLink.split('/').pop() || '';
    }

    if (!inviteCode) return;

    // Fetch from Discord with retry logic
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        const discordRes = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);

        if (discordRes.status === 429) {
            const errData = await discordRes.json();
            const waitTime = (errData.retry_after || 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime + 100));
            retries++;
            continue;
        }

        if (!discordRes.ok) {
            throw new Error(`Discord API error: ${discordRes.status}`);
        }

        const inviteData = await discordRes.json();
        const guildData = inviteData.guild;

        if (!guildData) return;

        // Build update data
        const iconExt = guildData.icon?.startsWith('a_') ? 'gif' : 'png';
        const iconUrl = guildData.icon
            ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.${iconExt}?size=256`
            : null;

        const bannerExt = guildData.banner?.startsWith('a_') ? 'gif' : 'png';
        const bannerUrl = guildData.banner
            ? `https://cdn.discordapp.com/banners/${guildData.id}/${guildData.banner}.${bannerExt}?size=1024`
            : null;

        const updateData: Record<string, unknown> = {
            name: guildData.name,
            current_member_count: inviteData.approximate_member_count,
            online_member_count: inviteData.approximate_presence_count,
            last_synced: new Date()
        };

        if (iconUrl) updateData.icon_url = iconUrl;
        if (bannerUrl) updateData.banner_url = bannerUrl;

        await Server.findByIdAndUpdate(server._id, updateData);
        return;
    }

    throw new Error('Max retries exceeded');
}
