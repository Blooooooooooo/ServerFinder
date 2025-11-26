import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
    title: "NSFW Server Finder - Discover Discord Servers",
    description: "Browse and discover amazing Discord servers. Find communities that match your interests.",
    icons: {
        icon: "https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png"
    },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Navigation />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
