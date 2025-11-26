import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

const SUPER_ADMIN_ID = '1215303359045701652';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ isAdmin: false });
        }

        const userId = (session.user as any).id;

        // Check if super admin
        if (userId === SUPER_ADMIN_ID) {
            return NextResponse.json({ isAdmin: true, isSuperAdmin: true });
        }

        // Check if in AdminUser collection
        await connectDB();
        const adminUser = await AdminUser.findOne({ discord_id: userId });

        return NextResponse.json({
            isAdmin: !!adminUser,
            isSuperAdmin: false
        });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json({ isAdmin: false });
    }
}
