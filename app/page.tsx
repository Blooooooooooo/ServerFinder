'use client';

import { Search, BarChart3, Zap, Heart } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import RecentServers from '@/components/RecentServers';
import TrendingServers from '@/components/TrendingServers';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <HeroSection />

            {/* Recently Added Servers Carousel */}
            <RecentServers />

            {/* Trending Servers Carousel */}
            <TrendingServers />

            {/* Features Section - Bento Grid Layout */}
            <section className="py-24 px-6 relative overflow-hidden">
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Section Header - Left aligned */}
                    <div className="mb-16 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Why Use <span className="gradient-text">NSFW Server Finder</span>?
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            The best place to find and grow Discord communities.
                        </p>
                    </div>

                    {/* Bento Grid - 2+1 Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - 2 stacked cards */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Card 1 - Easy Discovery */}
                            <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-discord-hot-blue/30 cursor-pointer group">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-discord-hot-blue/10 flex items-center justify-center text-discord-hot-blue flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Search className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-2xl font-bold mb-3 text-white">Easy Discovery</h3>
                                        <p className="text-slate-400 leading-relaxed text-lg">
                                            Search through thousands of servers by name, category, or tags to find exactly what you're looking for in seconds.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Live Trends */}
                            <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-discord-hot-orange/30 cursor-pointer group">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-discord-hot-orange/10 flex items-center justify-center text-discord-hot-orange flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <BarChart3 className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-2xl font-bold mb-3 text-white">Live Trends</h3>
                                        <p className="text-slate-400 leading-relaxed text-lg">
                                            See which communities are growing right now. Our trending algorithm highlights the most active and popular servers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - 1 tall card */}
                        <div className="lg:col-span-1">
                            <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-discord-electric-cyan/30 cursor-pointer group h-full flex flex-col justify-center">
                                <div className="w-16 h-16 rounded-xl bg-discord-electric-cyan/10 flex items-center justify-center text-discord-electric-cyan mb-6 group-hover:scale-105 transition-transform">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white text-left">Instant Access</h3>
                                <p className="text-slate-400 leading-relaxed text-lg text-left">
                                    No complicated processes. Just one click to join any server that catches your interest and start chatting immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Enhanced */}
            <footer className="bg-slate-950 py-16 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png"
                                    alt="ServerFinder Logo"
                                    className="w-10 h-10 rounded-full"
                                />
                                <span className="text-xl font-bold text-white">NSFW Server Finder</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                The largest directory of NSFW Discord servers. Find your community today.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/servers" className="text-slate-400 hover:text-discord-hot-blue transition-colors text-sm">
                                        Browse Servers
                                    </a>
                                </li>
                                <li>
                                    <a href="/partners" className="text-slate-400 hover:text-discord-hot-blue transition-colors text-sm">
                                        Partner Servers
                                    </a>
                                </li>
                                <li>
                                    <a href="https://discord.gg/ZKFjPmh8ZV" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-discord-hot-blue transition-colors text-sm">
                                        Submit Your Server
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Community */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Community</h4>
                            <a
                                href="https://discord.gg/ZKFjPmh8ZV"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-discord-blurple/20 text-discord-blurple hover:bg-discord-blurple/30 transition-colors text-sm font-medium"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                                Join Our Discord
                            </a>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-slate-500 text-sm">
                            &copy; 2025 NSFW Server Finder. All rights reserved.
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                            Made with <Heart className="w-4 h-4 text-discord-hot-orange mx-1" /> for the Discord community
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
