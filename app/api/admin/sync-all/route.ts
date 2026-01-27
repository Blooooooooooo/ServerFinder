import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';
import SyncStatus from '@/models/SyncStatus';

const SYNC_ID = 'sync-all';

// Helper to get or create sync status
async function getSyncStatus() {
    let status = await SyncStatus.findById(SYNC_ID);
    if (!status) {
        status = await SyncStatus.create({
            _id: SYNC_ID,
            isRunning: false,
            current: 0,
            total: 0,
            failed: 0,
            startedAt: null,
            completedAt: null,
            lastError: null
        });
    }
    return status;
}

// GET - Check sync status
export async function GET() {
    try {
        await connectDB();
        const status = await getSyncStatus();

        // Check if sync seems stale (running but no update in 2 minutes)
        if (status.isRunning && status.updatedAt) {
            const staleDuration = Date.now() - new Date(status.updatedAt).getTime();
            if (staleDuration > 2 * 60 * 1000) {
                // Mark as not running (probably crashed)
                status.isRunning = false;
                status.lastError = 'Sync timed out';
                await status.save();
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                isRunning: status.isRunning,
                current: status.current,
                total: status.total,
                failed: status.failed,
                startedAt: status.startedAt,
                completedAt: status.completedAt,
                lastError: status.lastError
            }
        });
    } catch (error) {
        console.error('Error getting sync status:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get sync status'
        }, { status: 500 });
    }
}

// POST - Start sync all servers
export async function POST() {
    try {
        await connectDB();
        const status = await getSyncStatus();

        if (status.isRunning) {
            // Check if it's stale
            const staleDuration = Date.now() - new Date(status.updatedAt).getTime();
            if (staleDuration < 2 * 60 * 1000) {
                return NextResponse.json({
                    success: false,
                    error: 'Sync is already running',
                    data: {
                        isRunning: status.isRunning,
                        current: status.current,
                        total: status.total,
                        failed: status.failed
                    }
                }, { status: 409 });
            }
        }

        // Get all servers
        const servers = await Server.find({}, '_id link').lean();

        // Update status to running
        await SyncStatus.findByIdAndUpdate(SYNC_ID, {
            isRunning: true,
            current: 0,
            total: servers.length,
            failed: 0,
            startedAt: new Date(),
            completedAt: null,
            lastError: null,
            updatedAt: new Date()
        });

        // Start background sync (don't await - let it run)
        startBackgroundSync(servers);

        return NextResponse.json({
            success: true,
            message: 'Sync started',
            data: {
                isRunning: true,
                current: 0,
                total: servers.length,
                failed: 0
            }
        });
    } catch (error) {
        console.error('Error starting sync:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to start sync'
        }, { status: 500 });
    }
}

// DELETE - Cancel sync
export async function DELETE() {
    try {
        await connectDB();
        const status = await getSyncStatus();

        if (status.isRunning) {
            await SyncStatus.findByIdAndUpdate(SYNC_ID, {
                isRunning: false,
                lastError: 'Cancelled by user',
                updatedAt: new Date()
            });
            return NextResponse.json({
                success: true,
                message: 'Sync cancelled'
            });
        }
        return NextResponse.json({
            success: false,
            error: 'No sync running'
        }, { status: 400 });
    } catch (error) {
        console.error('Error cancelling sync:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to cancel sync'
        }, { status: 500 });
    }
}

interface ServerDoc {
    _id: unknown;
    link?: string;
}

async function startBackgroundSync(servers: ServerDoc[]) {
    try {
        await connectDB();

        let failed = 0;

        for (let i = 0; i < servers.length; i++) {
            // Check if cancelled
            const status = await SyncStatus.findById(SYNC_ID);
            if (!status?.isRunning) {
                break;
            }

            const server = servers[i];

            try {
                await syncSingleServer(server);
            } catch (error) {
                failed++;
                await SyncStatus.findByIdAndUpdate(SYNC_ID, {
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                    updatedAt: new Date()
                });
            }

            // Update progress in database
            await SyncStatus.findByIdAndUpdate(SYNC_ID, {
                current: i + 1,
                failed,
                updatedAt: new Date()
            });

            // Delay between requests to avoid rate limiting (600ms)
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Mark as complete
        await SyncStatus.findByIdAndUpdate(SYNC_ID, {
            isRunning: false,
            completedAt: new Date(),
            updatedAt: new Date()
        });

    } catch (error) {
        console.error('Background sync error:', error);
        await SyncStatus.findByIdAndUpdate(SYNC_ID, {
            isRunning: false,
            lastError: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: new Date()
        });
    }
}

async function syncSingleServer(server: ServerDoc) {
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
