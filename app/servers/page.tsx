'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ServerCrash } from 'lucide-react';
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
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        Browse <span className="gradient-text">Servers</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Discover amazing Discord communities
                    </p>
                </div>

                {/* Search & Filters Bar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for servers..."
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-discord-hot-blue/50 transition-colors"
                            />
                        </div>
                    </form>

                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="appearance-none bg-slate-900/50 border border-white/5 text-white py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:border-discord-hot-blue/50 cursor-pointer"
                        >
                            <option value="newest" className="bg-slate-900">Newest</option>
                            <option value="oldest" className="bg-slate-900">Oldest</option>
                            <option value="members_desc" className="bg-slate-900">Most Members</option>
                            <option value="members_asc" className="bg-slate-900">Least Members</option>
                            <option value="name_asc" className="bg-slate-900">Name (A-Z)</option>
                            <option value="name_desc" className="bg-slate-900">Name (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Server Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse"></div>
                        ))}
                    </div>
                ) : servers.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                            {servers.map((server) => (
                                <ServerCard key={server._id} server={server} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Prev
                                </button>
                                <span className="px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5 text-sm">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <ServerCrash className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">
                            No servers found. Try a different search.
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
