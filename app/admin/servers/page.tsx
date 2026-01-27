'use client';

import { useEffect, useState, useCallback } from 'react';
import Toast, { ToastType } from '@/components/Toast';
import Modal from '@/components/Modal';

interface Server {
    _id: string;
    name: string;
    icon_url: string;
    is_partner: boolean;
    current_member_count: number;
    online_member_count: number; // Changed from current_online_count
    created_at: string;
    updated_at?: string;
    approved_by?: string;
}

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function ServerManagement() {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [partnerFilter, setPartnerFilter] = useState('all');
    const [memberCountRange, setMemberCountRange] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [updatingPartner, setUpdatingPartner] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<Server | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [serverToRename, setServerToRename] = useState<Server | null>(null);
    const [newName, setNewName] = useState('');
    const [newIconUrl, setNewIconUrl] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, failed: 0 });

    const debouncedSearch = useDebounce(search, 500);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const fetchServers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString(),
                search: debouncedSearch,
                partnerFilter,
                memberCountRange,
                sortBy,
                sortOrder
            });

            const res = await fetch(`/api/servers?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setServers(data.data.servers);
                setTotalCount(data.data.pagination.totalCount);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch servers', error);
            showToast('Failed to load servers', 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, limit, partnerFilter, memberCountRange, sortBy, sortOrder]);

    useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    useEffect(() => {
        // Reset to page 1 when filters/search change
        setPage(1);
    }, [debouncedSearch, partnerFilter, memberCountRange]);

    const handleTogglePartner = async (serverId: string, currentStatus: boolean) => {
        setUpdatingPartner(serverId);
        try {
            const res = await fetch(`/api/servers/${serverId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_partner: !currentStatus })
            });

            const data = await res.json();
            if (data.success) {
                setServers(prev => prev.map(s =>
                    s._id === serverId ? { ...s, is_partner: !currentStatus } : s
                ));
                showToast(`Server ${!currentStatus ? 'partnered' : 'unpartnered'} successfully`, 'success');
                setSelected(prev => { const newSet = new Set(prev); newSet.delete(serverId); return newSet; });
            } else {
                showToast('Failed to update partner status', 'error');
            }
        } catch (error) {
            showToast('Failed to update partner status', 'error');
        } finally {
            setUpdatingPartner(null);
        }
    };

    const handleBulkPartner = async (makePartner: boolean) => {
        if (selected.size === 0) return;
        const count = selected.size;

        try {
            await Promise.all(
                Array.from(selected).map(id =>
                    fetch(`/api/servers/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_partner: makePartner })
                    })
                )
            );

            setServers(prev => prev.map(s =>
                selected.has(s._id) ? { ...s, is_partner: makePartner } : s
            ));
            showToast(`${count} server${count > 1 ? 's' : ''} ${makePartner ? 'partnered' : 'unpartnered'}`, 'success');
            setSelected(new Set());
        } catch (error) {
            showToast('Bulk operation failed', 'error');
        }
    };

    const confirmDelete = (server: Server) => {
        setServerToDelete(server);
        setDeleteModalOpen(true);
    };

    const handleDeleteServer = async () => {
        if (!serverToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/servers/${serverToDelete._id}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (data.success) {
                setServers(prev => prev.filter(s => s._id !== serverToDelete._id));
                showToast(`Server "${serverToDelete.name}" deleted successfully`, 'success');
                if (selected.has(serverToDelete._id)) {
                    setSelected(prev => { const newSet = new Set(prev); newSet.delete(serverToDelete._id); return newSet; });
                }
                setDeleteModalOpen(false);
                setServerToDelete(null);
            } else {
                showToast(data.error || 'Failed to delete server', 'error');
            }
        } catch (error) {
            showToast('Failed to delete server', 'error');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openRenameModal = (server: Server) => {
        setServerToRename(server);
        setNewName(server.name);
        setNewIconUrl(null);
        setRenameModalOpen(true);
    };

    const handleSyncFromDiscord = async () => {
        if (!serverToRename) return;
        setIsSyncing(true);
        try {
            const res = await fetch(`/api/servers/${serverToRename._id}/sync`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setNewName(data.data.name);
                setNewIconUrl(data.data.icon_url || null);
                showToast('Synced data from Discord', 'success');
            } else {
                showToast(data.error || 'Failed to sync with Discord', 'error');
            }
        } catch (error) {
            showToast('Failed to sync with Discord', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRenameServer = async () => {
        if (!serverToRename || !newName.trim()) return;
        setIsRenaming(true);
        try {
            const updatePayload: { name: string; icon_url?: string } = { name: newName };
            if (newIconUrl) {
                updatePayload.icon_url = newIconUrl;
            }

            const res = await fetch(`/api/servers/${serverToRename._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            const data = await res.json();
            if (data.success) {
                setServers(prev => prev.map(s => s._id === serverToRename._id ? { ...s, name: data.data.name, icon_url: data.data.icon_url } : s));
                showToast('Server updated successfully', 'success');
                setRenameModalOpen(false);
                setServerToRename(null);
                setNewIconUrl(null);
            } else {
                showToast(data.error || 'Failed to update server', 'error');
            }
        } catch (error) {
            showToast('Failed to update server', 'error');
        } finally {
            setIsRenaming(false);
        }
    };

    const handleSelectAll = () => {
        if (selected.size === servers.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(servers.map(s => s._id)));
        }
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            // Cycle through: asc -> desc -> none
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else {
                // Reset to default (created_at desc)
                setSortBy('created_at');
                setSortOrder('desc');
            }
        } else {
            // New column, start with ascending
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? (
            <svg className="w-3 h-3 inline ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        ) : (
            <svg className="w-3 h-3 inline ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        );
    };

    const handleExportCSV = () => {
        const csv = [
            ['Name', 'ID', 'Members', 'Online', 'Partner', 'Created'],
            ...servers.map(s => [
                s.name,
                s._id,
                s.current_member_count?.toString() || '0',
                s.online_member_count?.toString() || '0',
                s.is_partner ? 'Yes' : 'No',
                new Date(s.created_at).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `servers_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Export downloaded successfully', 'success');
    };

    const handleSyncAllServers = async () => {
        if (isSyncingAll) return;

        setIsSyncingAll(true);
        setSyncProgress({ current: 0, total: 0, failed: 0 });

        try {
            // First, get ALL server IDs (not just the current page)
            const res = await fetch('/api/servers?limit=10000');
            const data = await res.json();

            if (!data.success) {
                showToast('Failed to fetch servers', 'error');
                return;
            }

            const allServers = data.data.servers;
            const total = allServers.length;
            setSyncProgress({ current: 0, total, failed: 0 });

            let failed = 0;

            for (let i = 0; i < allServers.length; i++) {
                const server = allServers[i];
                let retries = 0;
                const maxRetries = 3;

                while (retries < maxRetries) {
                    try {
                        const syncRes = await fetch(`/api/servers/${server._id}/sync`, { method: 'POST' });
                        const syncData = await syncRes.json();

                        if (syncRes.status === 429 || syncData.retry_after) {
                            // Rate limited - wait and retry
                            const waitTime = (syncData.retry_after || 1) * 1000;
                            await new Promise(resolve => setTimeout(resolve, waitTime + 100));
                            retries++;
                            continue;
                        }
                        break; // Success, move to next server
                    } catch {
                        retries++;
                        if (retries >= maxRetries) failed++;
                    }
                }

                setSyncProgress({ current: i + 1, total, failed });

                // Longer delay to avoid rate limiting (500ms)
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            showToast(`Synced ${total - failed} servers${failed > 0 ? `, ${failed} failed` : ''}`, 'success');
            fetchServers(); // Refresh the list

        } catch (error) {
            showToast('Sync all failed', 'error');
        } finally {
            setIsSyncingAll(false);
        }
    };

    const formatNumber = (num: number | undefined | null) => {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString();
    };
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            {/* Toast Notifications */}
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
            ))}

            <div className="min-h-screen pt-24 px-4 md:px-6 pb-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage Servers</h1>
                    <p className="text-slate-400">Control server listings, partnerships, and visibility</p>
                </div>

                {/* Filters & Controls */}
                <div className="glass-card rounded-xl p-4 md:p-6 mb-6 space-y-4">
                    {/* Top Row: Search + Export */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-discord-hot-blue w-full transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={handleSyncAllServers}
                            disabled={isSyncingAll}
                            className="btn-secondary px-4 py-2.5 whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSyncingAll ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Syncing {syncProgress.current}/{syncProgress.total}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Sync All
                                </>
                            )}
                        </button>
                        <button onClick={handleExportCSV} className="btn-secondary px-4 py-2.5 whitespace-nowrap flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                        </button>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-discord-hot-blue">
                            <option value="all" className="bg-gray-900 text-white">All Servers</option>
                            <option value="partners" className="bg-gray-900 text-white">Partners Only</option>
                            <option value="non-partners" className="bg-gray-900 text-white">Non-Partners</option>
                        </select>

                        <select value={memberCountRange} onChange={(e) => setMemberCountRange(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-discord-hot-blue">
                            <option value="all" className="bg-gray-900 text-white">All Sizes</option>
                            <option value="0-100" className="bg-gray-900 text-white">{'< 100 members'}</option>
                            <option value="100-500" className="bg-gray-900 text-white">100 - 500</option>
                            <option value="500-1000" className="bg-gray-900 text-white">500 - 1K</option>
                            <option value="1000-5000" className="bg-gray-900 text-white">1K - 5K</option>
                            <option value="5000+" className="bg-gray-900 text-white">5K+</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selected.size > 0 && (
                        <div className="bg-discord-hot-blue/10 border border-discord-hot-blue/30 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium">{selected.size} selected</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkPartner(true)} className="text-sm bg-discord-hot-orange/20 hover:bg-discord-hot-orange/30 text-discord-hot-orange px-3 py-1 rounded transition-colors">
                                    Add to Partners
                                </button>
                                <button onClick={() => handleBulkPartner(false)} className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded transition-colors">
                                    Remove from Partners
                                </button>
                                <button onClick={() => setSelected(new Set())} className="text-sm text-slate-400 hover:text-white px-3 py-1 transition-colors">
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Server Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-400 text-sm">
                                <tr>
                                    <th className="p-3 w-10">
                                        <input type="checkbox" checked={selected.size === servers.length && servers.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded" />
                                    </th>
                                    <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                        Server
                                    </th>
                                    <th className="p-3 w-24 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('member_count')}>
                                        Members
                                    </th>
                                    <th className="p-3 w-20">Online</th>
                                    <th className="p-3 w-20">Status</th>
                                    <th className="p-3 w-40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-t border-white/5">
                                            <td colSpan={6} className="p-4">
                                                <div className="h-12 bg-white/5 rounded animate-pulse"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : servers.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No servers found</td></tr>
                                ) : servers.map(server => (
                                    <tr key={server._id} className="border-t border-white/5 hover:bg-white/5 transition">
                                        <td className="p-3">
                                            <input type="checkbox" checked={selected.has(server._id)} onChange={(e) => {
                                                const newSet = new Set(selected);
                                                if (e.target.checked) newSet.add(server._id); else newSet.delete(server._id);
                                                setSelected(newSet);
                                            }} className="w-4 h-4 rounded" />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {server.icon_url ? (
                                                    <img src={server.icon_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">{server.name.substring(0, 2)}</div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate text-sm">{server.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-slate-300 text-sm">{formatNumber(server.current_member_count)}</td>
                                        <td className="p-3 text-sm">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                {formatNumber(server.online_member_count)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {server.is_partner ? (
                                                <span className="inline-flex items-center text-xs bg-discord-hot-orange/20 text-discord-hot-orange px-2 py-0.5 rounded">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    Partner
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Active</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openRenameModal(server)}
                                                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                                    title="Rename Server"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePartner(server._id, server.is_partner)}
                                                    disabled={updatingPartner === server._id}
                                                    className={`text-xs px-2.5 py-1 rounded transition-colors whitespace-nowrap ${server.is_partner ? 'text-red-400 hover:bg-red-500/10' : 'text-discord-hot-orange hover:bg-discord-hot-orange/10'} disabled:opacity-50`}
                                                >
                                                    {updatingPartner === server._id ? '...' : server.is_partner ? 'Remove' : 'Partner'}
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(server)}
                                                    className="text-xs text-red-400 hover:text-red-300 px-1.5"
                                                    title="Delete server"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
                    <div className="text-sm text-slate-400">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {formatNumber(totalCount)} servers
                    </div>
                    <div className="flex items-center gap-4">
                        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-discord-hot-blue">
                            <option value="25" className="bg-gray-900 text-white">25 per page</option>
                            <option value="50" className="bg-gray-900 text-white">50 per page</option>
                            <option value="100" className="bg-gray-900 text-white">100 per page</option>
                        </select>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                Previous
                            </button>
                            <div className="px-4 py-2 bg-white/5 rounded-lg">
                                Page {page} of {totalPages}
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={renameModalOpen}
                onClose={() => !isRenaming && setRenameModalOpen(false)}
                title="Rename Server"
                footer={
                    <>
                        <button
                            onClick={() => setRenameModalOpen(false)}
                            disabled={isRenaming}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRenameServer}
                            disabled={isRenaming || !newName.trim()}
                            className="px-4 py-2 text-sm bg-discord-blurple hover:bg-discord-blurple/90 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isRenaming ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Server Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-discord-blurple transition-all"
                                placeholder="Enter server name"
                            />
                            <button
                                onClick={handleSyncFromDiscord}
                                disabled={isSyncing}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                                title="Fetch current name from Discord"
                            >
                                {isSyncing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Click the cycle icon to fetch the latest name directly from Discord.
                        </p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => !isDeleting && setDeleteModalOpen(false)}
                title="Delete Server"
                footer={
                    <>
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteServer}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Server'
                            )}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p>Are you sure you want to delete <span className="font-bold text-white">{serverToDelete?.name}</span>?</p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-400 text-sm flex gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            This action cannot be undone. All associated data including stats, favorites, and history will be permanently removed.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
