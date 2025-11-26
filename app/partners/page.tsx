'use client';

import { Suspense } from 'react';
import Navigation from '../../components/Navigation';
import ServerCard from '../../components/ServerCard';
import { useEffect, useState } from 'react';
import { IServer } from '../../models/Server';

function PartneredServersContent() {
    const [servers, setServers] = useState<IServer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                // Fetch partners directly from API with server-side filtering
                const res = await fetch('/api/servers?partner=true&limit=100', { cache: 'no-store' });
                const data = await res.json();

                if (data.success && data.data && Array.isArray(data.data.servers)) {
                    setServers(data.data.servers);
                } else {
                    console.error('Invalid API response:', data);
                    setServers([]);
                }
            } catch (error) {
                console.error('Failed to fetch partners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-discord-blurple selection:text-white pb-20">
            <Navigation />

            {/* Hero Section */}
            <div className="relative pt-32 pb-12 px-6 overflow-hidden">
                <div className="hero-background"></div>
                <div className="hero-glow"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                        <span className="gradient-text">Partnered Servers</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 text-balance">
                        Discover our trusted community partners. These servers are verified and recommended by the ServerFinder team.
                    </p>
                </div>
            </div>

            {/* Partners Grid */}
            <div className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-slate-800/50 animate-pulse"></div>
                        ))}
                    </div>
                ) : servers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servers.map((server) => (
                            <ServerCard key={server._id} server={server} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🤝</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Partners Yet</h3>
                        <p className="text-slate-400">
                            We haven't added any partnered servers yet. Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PartneredServersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <PartneredServersContent />
        </Suspense>
    );
}
