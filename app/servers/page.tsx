'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ServerCard from '@/components/ServerCard';

interface Server {
    _id: string;
    name: string;
    link: string;
    current_member_count?: number;
    letter_category?: string;
}

function ServersContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchServers();
    }, [page, sort, searchTerm]);

    const fetchServers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                sort: sort
            });

            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/servers?${params}`);
            const data = await res.json();

            if (data.success) {
                setServers(data.data.servers);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching servers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchServers();
    };

    return (
        <main className="min-h-screen pt-24 px-6 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Browse <span className="gradient-text">Servers</span>
                    </h1>
                    <p className="text-discord-very-light-gray text-lg">
                        Discover amazing Discord communities
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-discord-blurple to-discord-pink rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center bg-slate-900 rounded-xl p-2 border border-white/10 shadow-2xl">
                                <div className="pl-4 text-slate-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search for servers..."
                                    className="w-full bg-transparent text-white placeholder-slate-400 px-4 py-3 outline-none text-lg"
                                />
                                <button
                                    type="submit"
                                    className="btn-primary py-2 px-6 rounded-lg text-sm shadow-lg shadow-discord-blurple/20"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sort Dropdown */}
                <div className="mb-8 flex justify-end animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="relative inline-block text-left">
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="appearance-none bg-slate-900 border border-white/10 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-discord-blurple cursor-pointer shadow-lg"
                        >
                            <option value="newest">Newest Added</option>
                            <option value="oldest">Oldest Added</option>
                            <option value="members_desc">Most Members</option>
                            <option value="members_asc">Least Members</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Server Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="h-6 bg-discord-medium-gray rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-discord-medium-gray rounded w-1/2 mb-2"></div>
                                <div className="h-10 bg-discord-medium-gray rounded mt-4"></div>
                            </div>
                        ))}
                    </div>
                ) : servers.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {servers.map((server, index) => (
                                <div key={server._id} className="animate-scale-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <ServerCard server={server} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-discord-very-light-gray">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😢</div>
                        <p className="text-discord-very-light-gray text-lg">
                            No servers found. Try a different search or filter.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function ServersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 px-6 text-center text-white">Loading...</div>}>
            <ServersContent />
        </Suspense>
    );
}
