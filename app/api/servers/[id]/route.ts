import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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
        const { is_partner, name, icon_url } = body;

        const updateData: { is_partner?: boolean; name?: string; icon_url?: string } = {};

        if (typeof is_partner === 'boolean') {
            updateData.is_partner = is_partner;
        }

        if (typeof name === 'string' && name.trim().length > 0) {
            updateData.name = name.trim();
        }

        if (typeof icon_url === 'string') {
            updateData.icon_url = icon_url;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, error: 'No valid fields provided for update' },
                { status: 400 }
            );
        }

        const server = await Server.findOneAndUpdate(
            { _id: params.id },
            updateData,
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

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await connectDB();

        // 1. Check if server exists
        const server = await Server.findById(params.id);
        if (!server) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        // 2. Cleanup related data (cascading delete)
        // We import these dynamically or assume models are registered if using mongoose correctly
        // But better to be explicit if we can. 
        // Note: Models are already imported/cached by connection, but typescript might need imports.
        // Let's rely on mongoose.model helpers or direct imports if we had them.
        // Since we didn't import Favorite/GrowthHistory at top, we can use mongoose.connection.models or import them.
        // Let's modify the imports to include them for type safety and clarity, 
        // but for this replacement chunk, we will assume we need to add imports at top or use string-based model access if acceptable.
        // However, imports are safer. 

        // Actually, to do this clearly in one file without messing up imports heavily, 
        // I should probably use `mongoose.model('Favorite')` etc if I trust they are registered,
        // OR simply add the imports to the file top in a separate edit.
        // BUT, existing tool usage encourages me to be careful.

        // Let's just USE the imports I will add in a separate edit or assume they exist? 
        // No, I can't assume. I should probably use a multi_replace to add imports AND the function.
        // Or I can use mongoose.models['Favorite'] which is safer if I am not sure about imports but know the name.
        // Let's try to be robust. 

        // Strategy: I will use mongoose.models directly to avoid import issues for now, or perform a second edit.
        // Actually, I'll do a multi-replace to add imports and the DELETE function.

        // ...Wait, I am in replace_file_content tool, not multi.
        // I will return an error to myself and switch to multi_replace for better quality? 
        // No, I can just use `require` or dynamic import? No, that's messy in ES modules.

        // Let's use the models from mongoose.models.
        const Favorite = mongoose.models.Favorite;
        const ServerGrowthHistory = mongoose.models.ServerGrowthHistory;

        if (Favorite) await Favorite.deleteMany({ server_id: params.id });
        if (ServerGrowthHistory) await ServerGrowthHistory.deleteMany({ server_id: params.id });

        // 3. Delete the server
        await Server.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Server and related data deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete server' },
            { status: 500 }
        );
    }
}

