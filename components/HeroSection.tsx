'use client';

import { useEffect, useState } from 'react';
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
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated Background */}
            <div className="hero-background"></div>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-discord-hot-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-discord-hot-orange/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-discord-hot-blue opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-discord-hot-blue"></span>
                    </span>
                    <span className="text-sm font-medium text-slate-300">The #1 NSFW Discord Directory</span>
                </div>

                {/* Main Heading */}
                <div className="mb-8 animate-slide-up">
                    <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight leading-tight">
                        Discover <span className="gradient-text">Hottest</span>
                        <br />
                        Discord Servers
                    </h1>
                </div>

                {/* Subheading */}
                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
                    Join the most active and exclusive NSFW communities. Find your tribe, share your passions, and connect instantly.
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-24 animate-slide-up relative z-20" style={{ animationDelay: '200ms' }}>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-discord-hot-blue via-discord-electric-cyan to-discord-hot-orange rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                        <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl rounded-xl p-2 border border-white/10 shadow-2xl">
                            <div className="pl-4 text-discord-hot-blue">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search for servers, tags, or categories..."
                                className="w-full bg-transparent text-white placeholder-slate-400 px-4 py-3 outline-none text-lg font-medium"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/servers?search=${e.currentTarget.value}`;
                                    }
                                }}
                            />
                            <button
                                className="btn-primary py-3 px-8 rounded-lg text-base shadow-lg hover:shadow-discord-hot-blue/50 flex items-center justify-center"
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <StatsCard
                        title="Active Servers"
                        value={stats.totalServers}
                        icon="🔥"
                        delay={400}
                    />
                    <StatsCard
                        title="Daily Searches"
                        value={stats.totalSearches}
                        icon="🚀"
                        delay={500}
                    />
                </div>
            </div>
        </div>
    );
}
