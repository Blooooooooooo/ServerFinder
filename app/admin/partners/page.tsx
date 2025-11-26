'use client';

import { useState } from 'react';

export default function PartnerManagement() {
    const [serverId, setServerId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement API to add partner
        // await fetch('/api/admin/partners', { method: 'POST', body: JSON.stringify({ serverId }) });

        setTimeout(() => {
            alert(`Added partner: ${serverId} (Simulated)`);
            setLoading(false);
            setServerId('');
        }, 1000);
    };

    return (
        <div className="min-h-screen pt-24 px-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Manage Partners</h1>

            <div className="glass-card p-8 rounded-xl">
                <h2 className="text-xl font-bold mb-4">Add New Partner</h2>
                <form onSubmit={handleAddPartner} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Server ID</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 123456789012345678"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-discord-hot-orange transition"
                            value={serverId}
                            onChange={(e) => setServerId(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary bg-gradient-to-r from-discord-hot-orange to-red-500"
                    >
                        {loading ? 'Adding...' : 'Add Partner'}
                    </button>
                </form>
            </div>
        </div>
    );
}
