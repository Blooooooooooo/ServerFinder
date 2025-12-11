import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    metadataBase: new URL('https://nsfwserver-finder.vercel.app'),
    title: {
        default: "NSFW Server Finder - Discover Discord Servers",
        template: "%s | NSFW Server Finder"
    },
    description: "Browse and discover 1000+ NSFW Discord servers. Find adult communities, dating servers, and NSFW content servers. Updated daily with new servers.",
    keywords: [
        "discord servers",
        "nsfw discord",
        "discord server finder",
        "adult discord servers",
        "nsfw servers",
        "discord communities",
        "find discord servers",
        "discord server list",
        "18+ discord",
        "nsfw discord finder"
    ],
    authors: [{ name: "NSFW Server Finder" }],
    creator: "NSFW Server Finder",
    publisher: "NSFW Server Finder",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://nsfwserver-finder.vercel.app",
        title: "NSFW Server Finder - Discover Discord Servers",
        description: "Browse and discover 1000+ NSFW Discord servers. Find adult communities and NSFW content servers.",
        siteName: "NSFW Server Finder",
        images: [
            {
                url: "https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png",
                width: 512,
                height: 512,
                alt: "NSFW Server Finder Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "NSFW Server Finder - Discover Discord Servers",
        description: "Browse and discover 1000+ NSFW Discord servers.",
        images: ["https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png"],
    },
    icons: {
        icon: "https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png",
        shortcut: "https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png",
        apple: "https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png",
    },
    verification: {
        google: 'rae7h4CC8UNrJU_qAGxYpsqbR8nxRG9QmhRUaiGbBFs',
    },
};

import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <GoogleAnalytics gaId="G-P479M8YNPX" />
                    <Navigation />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
