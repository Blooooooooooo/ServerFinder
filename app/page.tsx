'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import ServerCard from '@/components/ServerCard';
import RecentServers from '@/components/RecentServers';
import TrendingServers from '@/components/TrendingServers';

interface Server {
    _id: string;
    name: string;
    link: string;
    current_member_count?: number;
    letter_category?: string;
    searchCount?: number;
}

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <HeroSection />

            {/* Recently Added Servers Carousel */}
            <RecentServers />

            {/* Trending Servers Carousel */}
            <TrendingServers />

            {/* Features Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Why Use <span className="gradient-text">NSFW Server Finder</span>?
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            The best place to find and grow Discord communities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 text-center hover:transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-discord-blurple/20 rounded-2xl flex items-center justify-center mb-6 text-4xl">
                                🔍
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Easy Discovery</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Search through thousands of servers by name, category, or tags to find exactly what you're looking for in seconds.
                            </p>
                        </div>

                        <div className="glass-card p-8 text-center hover:transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-discord-pink/20 rounded-2xl flex items-center justify-center mb-6 text-4xl">
                                📊
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Live Trends</h3>
                            <p className="text-slate-400 leading-relaxed">
                                See which communities are growing right now. Our trending algorithm highlights the most active and popular servers.
                            </p>
                        </div>

                        <div className="glass-card p-8 text-center hover:transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-discord-green/20 rounded-2xl flex items-center justify-center mb-6 text-4xl">
                                ⚡
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Instant Access</h3>
                            <p className="text-slate-400 leading-relaxed">
                                No complicated processes. Just one click to join any server that catches your interest and start chatting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 py-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png"
                            alt="ServerFinder Logo"
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="text-xl font-bold text-white">NSFW Server Finder</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        &copy; 2025 NSFW Server Finder. Made with ❤️ for the Discord community.
                    </div>

                </div>
            </footer>
        </main>
    );
}
