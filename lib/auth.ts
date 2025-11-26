import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID ?? "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
            authorization: { params: { scope: 'identify guilds' } },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Store Discord user ID when user first signs in
            if (account) {
                token.id = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                // Add user ID to session
                (session.user as any).id = token.id || token.sub;
            }
            return session;
        },
    },
};
