'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { data: session } = useSession();
    const profileRef = useRef<HTMLDivElement>(null);

    // Check if user is admin (super admin or in AdminUser collection)
    useEffect(() => {
        if (session?.user) {
            fetch('/api/auth/check-admin')
                .then(res => res.json())
                .then(data => setIsAdmin(data.isAdmin))
                .catch(() => setIsAdmin(false));
        } else {
            setIsAdmin(false);
        }
    }, [session]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="https://cdn.discordapp.com/icons/1262872485620219988/9a2b30350963ed9d31f094049ee81659.png"
                            alt="ServerFinder Logo"
                            className="w-10 h-10 rounded-full"
                        />
                        <span className="font-bold text-xl gradient-text hidden sm:block">
                            NSFW Server Finder
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-discord-very-light-gray hover:text-white transition-colors duration-200"
                        >
                            Home
                        </Link>
                        <Link
                            href="/servers"
                            className="text-discord-very-light-gray hover:text-white transition-colors duration-200"
                        >
                            Browse Servers
                        </Link>
                        <Link
                            href="/partners"
                            className="text-discord-very-light-gray hover:text-white transition-colors duration-200 flex items-center space-x-1"
                        >
                            <span>Partnered Servers</span>
                            <span className="bg-discord-fuchsia text-[10px] px-1.5 py-0.5 rounded text-white font-bold">NEW</span>
                        </Link>

                        {/* Auth Buttons */}
                        {session ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <img
                                        src={session.user?.image || ''}
                                        alt="User"
                                        className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-discord-hot-blue transition duration-200"
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in overflow-hidden">
                                        <div className="px-4 py-2 border-b border-white/5 mb-2">
                                            <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                                            <p className="text-xs text-slate-400 truncate">User</p>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            My Profile
                                        </Link>

                                        <Link
                                            href="/favorites"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                            </svg>
                                            My Favorites
                                        </Link>

                                        {isAdmin && (
                                            <>
                                                <div className="h-px bg-white/5 my-2"></div>
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                    </svg>
                                                    Admin Dashboard
                                                </Link>
                                            </>
                                        )}

                                        <div className="h-px bg-white/5 my-2"></div>

                                        <button
                                            onClick={() => signOut()}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('discord')}
                                className="btn-primary py-2 px-6 text-sm"
                            >
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white p-2"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-discord-blurple/20 animate-slide-up">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-discord-very-light-gray hover:text-white transition-colors duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/servers"
                                className="text-discord-very-light-gray hover:text-white transition-colors duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Browse Servers
                            </Link>
                            <Link
                                href="/partners"
                                className="text-discord-very-light-gray hover:text-white transition-colors duration-200 flex items-center space-x-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <span>Partnered Servers</span>
                                <span className="bg-discord-fuchsia text-[10px] px-1.5 py-0.5 rounded text-white font-bold">NEW</span>
                            </Link>
                            {session ? (
                                <>
                                    <div className="border-t border-white/5 pt-4 mt-2">
                                        <div className="flex items-center gap-3 mb-4 px-2">
                                            <img
                                                src={session.user?.image || ''}
                                                alt="User"
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="text-white font-medium">{session.user?.name}</span>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="block text-discord-very-light-gray hover:text-white transition-colors duration-200 mb-3"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            👤 My Profile
                                        </Link>

                                        <Link
                                            href="/favorites"
                                            className="block text-discord-very-light-gray hover:text-white transition-colors duration-200 mb-3"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            ⭐ My Favorites
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="block text-discord-very-light-gray hover:text-white transition-colors duration-200 mb-4"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                🔧 Admin Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => signOut()}
                                            className="text-left text-red-400 hover:text-red-300 transition-colors duration-200"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => signIn('discord')}
                                    className="text-left text-discord-hot-blue font-bold hover:text-white transition-colors duration-200"
                                >
                                    Login with Discord
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
