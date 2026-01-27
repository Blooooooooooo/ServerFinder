'use client';

import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Search } from 'lucide-react';
import StatsCard from './StatsCard';

export default function HeroSection() {
    const [stats, setStats] = useState({
        totalServers: 0,
        totalSearches: 0,
    });

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats({
                        totalServers: data.data.totalServers,
                        totalSearches: data.data.totalSearches,
                    });
                }
            })
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    return (
        <div className="relative min-h-screen flex items-center overflow-hidden pt-20">
            {/* Subtle Background - No floating blobs */}
            <div className="hero-background"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="text-left">
                        {/* Badge - Simplified */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-discord-hot-blue/30 mb-8">
                            <span className="w-2 h-2 rounded-full bg-discord-hot-blue"></span>
                            <span className="text-sm font-medium text-slate-300">The #1 NSFW Discord Directory</span>
                        </div>

                        {/* Main Heading - Left aligned */}
                        <div className="mb-8">
                            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
                                Discover the
                                <br />
                                <span className="gradient-text">Hottest</span> Discord
                                <br />
                                Servers
                            </h1>
                        </div>

                        {/* Subheading */}
                        <p className="text-xl text-slate-300 mb-10 max-w-lg leading-relaxed">
                            Join the most active and exclusive NSFW communities. Find your tribe, share your passions, and connect instantly.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mb-12 relative z-20">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-discord-hot-blue via-discord-electric-cyan to-discord-hot-orange rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                                <div className="relative flex items-center bg-slate-900/95 backdrop-blur-xl rounded-xl p-2 border border-white/10">
                                    <div className="pl-4 text-discord-hot-blue">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search servers, tags, categories..."
                                        className="w-full bg-transparent text-white placeholder-slate-500 px-4 py-3 outline-none text-base font-medium"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                window.location.href = `/servers?search=${e.currentTarget.value}`;
                                            }
                                        }}
                                    />
                                    <button
                                        className="btn-primary py-3 px-6 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer"
                                        onClick={(e) => {
                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                            window.location.href = `/servers?search=${input.value}`;
                                        }}
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6">
                        <StatsCard
                            title="Active Servers"
                            value={stats.totalServers}
                            icon={<Flame className="w-7 h-7" />}
                            delay={200}
                        />
                        <StatsCard
                            title="Daily Searches"
                            value={stats.totalSearches}
                            icon={<TrendingUp className="w-7 h-7" />}
                            delay={400}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
