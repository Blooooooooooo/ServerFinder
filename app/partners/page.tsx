'use client';

import { Suspense } from 'react';
import ServerCard from '../../components/ServerCard';
import { useEffect, useState } from 'react';
import { IServer } from '../../models/Server';
import { Star, Users } from 'lucide-react';

function PartneredServersContent() {
    const [servers, setServers] = useState<IServer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
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
        <div className="min-h-screen bg-background text-foreground font-sans pb-20">
            {/* Hero Section */}
            <div className="relative pt-28 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Partner Servers
                            </h1>
                            <p className="text-slate-400">
                                Verified and trusted communities
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners Grid */}
            <div className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse"></div>
                        ))}
                    </div>
                ) : servers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {servers.map((server) => (
                            <ServerCard key={server._id} server={server} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-2xl">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
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
