import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await connectDB();

        const server = await Server.findOne({ _id: params.id }).lean();

        if (!server) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: server
        });
    } catch (error) {
        console.error('Error fetching server details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch server details' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await connectDB();

        const body = await request.json();
        const { is_partner } = body;

        if (typeof is_partner !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Invalid is_partner value' },
                { status: 400 }
            );
        }

        const server = await Server.findOneAndUpdate(
            { _id: params.id },
            { is_partner },
            { new: true }
        );

        if (!server) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: server
        });
    } catch (error) {
        console.error('Error updating server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update server' },
            { status: 500 }
        );
    }
}
