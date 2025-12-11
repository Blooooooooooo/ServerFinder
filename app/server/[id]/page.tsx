import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Server from '@/models/Server';
import ServerDetailsClient from './ServerDetailsClient';

type Props = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const id = params.id;

    try {
        await connectDB();
        const server = await Server.findById(id).lean();

        if (!server) {
            return {
                title: 'Server Not Found | NSFW Server Finder',
                description: 'The requested Discord server could not be found.',
            };
        }

        const title = `${server.name} - NSFW Discord Server | Server Finder`;
        const description = server.description
            ? server.description.substring(0, 160).replace(/\n/g, ' ')
            : `Join ${server.name} and thousands of other NSFW Discord servers on Server Finder.`;

        const iconUrl = server.icon_url || 'https://nsfwserver-finder.vercel.app/logo.png';

        return {
            title: title,
            description: description,
            openGraph: {
                title: title,
                description: description,
                images: [
                    {
                        url: iconUrl,
                        width: 512,
                        height: 512,
                        alt: server.name,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: title,
                description: description,
                images: [iconUrl],
            },
            alternates: {
                canonical: `https://nsfwserver-finder.vercel.app/server/${id}`,
            },
        };
    } catch (error) {
        console.error('Metadata generation failed:', error);
        return {
            title: 'NSFW Server Finder',
            description: 'Find the best NSFW Discord servers.',
        };
    }
}

export default async function Page(props: Props) {
    const params = await props.params;
    const id = params.id;

    let server = null;
    let jsonLd = null;

    try {
        await connectDB();
        // Use lean() to get a plain JS object, which is serializable
        server = await Server.findById(id).lean();

        if (server) {
            // Serialize ObjectID and dates if necessary, though Next.js handles some. 
            // Better to be safe: lean() leaves _id as object.
            server = JSON.parse(JSON.stringify(server));

            jsonLd = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: server.name,
                url: `https://nsfwserver-finder.vercel.app/server/${server._id}`,
                logo: server.icon_url,
                description: server.description,
                sameAs: [server.link],
                interactionStatistic: [
                    {
                        '@type': 'InteractionCounter',
                        interactionType: 'https://schema.org/FollowAction',
                        userInteractionCount: server.current_member_count
                    }
                ]
            };
        }
    } catch (error) {
        console.error('Error fetching server for page render:', error);
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ServerDetailsClient initialServer={server} />
        </>
    );
}
