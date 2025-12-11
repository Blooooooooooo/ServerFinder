import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://nsfwserver-finder.vercel.app';

    // Static Routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/servers`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/partners`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];

    try {
        await connectDB();
        const servers = await Server.find({}, { _id: 1, created_at: 1 }).lean();

        const serverRoutes: MetadataRoute.Sitemap = servers.map(server => ({
            url: `${baseUrl}/server/${server._id}`,
            lastModified: server.created_at || new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        return [...routes, ...serverRoutes];
    } catch (error) {
        console.error('Sitemap generation failed:', error);
        return routes;
    }
}
