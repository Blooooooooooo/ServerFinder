import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const search = searchParams.get('search') || '';
        const sortParam = searchParams.get('sort') || 'newest';
        const isPartner = searchParams.get('partner') === 'true';

        // New admin filters
        const partnerFilter = searchParams.get('partnerFilter') || 'all'; // all, partners, non-partners
        const memberCountRange = searchParams.get('memberCountRange') || 'all'; // all, 0-100, 100-500, 500-1000, 1000-5000, 5000+
        const sortBy = searchParams.get('sortBy') || ''; // member_count, name, created_at, updated_at
        const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc

        // Build the query
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { _id: search } // Exact ID match
            ];
        }

        if (isPartner) {
            query.is_partner = true;
        }

        // Partner filter (for admin)
        if (partnerFilter === 'partners') {
            query.is_partner = true;
        } else if (partnerFilter === 'non-partners') {
            query.is_partner = false;
        }

        // Member count range filter
        if (memberCountRange !== 'all') {
            const ranges: { [key: string]: { min: number; max?: number } } = {
                '0-100': { min: 0, max: 100 },
                '100-500': { min: 100, max: 500 },
                '500-1000': { min: 500, max: 1000 },
                '1000-5000': { min: 1000, max: 5000 },
                '5000+': { min: 5000 }
            };
            const range = ranges[memberCountRange];
            if (range) {
                query.current_member_count = { $gte: range.min };
                if (range.max) {
                    query.current_member_count.$lte = range.max;
                }
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Determine sort object (prioritize sortBy if provided)
        let sort: any = {};
        if (sortBy) {
            const direction = sortOrder === 'asc' ? 1 : -1;
            switch (sortBy) {
                case 'member_count':
                    sort = { current_member_count: direction };
                    break;
                case 'name':
                    sort = { name: direction };
                    break;
                case 'created_at':
                    sort = { created_at: direction };
                    break;
                case 'updated_at':
                    sort = { updated_at: direction };
                    break;
                default:
                    sort = { created_at: -1 };
            }
        } else {
            // Fallback to old sortParam system
            switch (sortParam) {
                case 'members_desc':
                    sort = { current_member_count: -1 };
                    break;
                case 'members_asc':
                    sort = { current_member_count: 1 };
                    break;
                case 'name_asc':
                    sort = { name: 1 };
                    break;
                case 'name_desc':
                    sort = { name: -1 };
                    break;
                case 'oldest':
                    sort = { created_at: 1 };
                    break;
                case 'newest':
                default:
                    sort = { created_at: -1 };
                    break;
            }
        }

        // Execute queries
        const [servers, totalCount] = await Promise.all([
            Server.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: {
                servers,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching servers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch servers' },
            { status: 500 }
        );
    }
}
