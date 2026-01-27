import mongoose, { Schema } from 'mongoose';

export interface ISyncStatus {
    _id: string;
    isRunning: boolean;
    current: number;
    total: number;
    failed: number;
    startedAt: Date | null;
    completedAt: Date | null;
    lastError: string | null;
    updatedAt: Date;
}

const SyncStatusSchema = new Schema({
    _id: { type: String, default: 'sync-all' },
    isRunning: { type: Boolean, default: false },
    current: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastError: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SyncStatus || mongoose.model<ISyncStatus>('SyncStatus', SyncStatusSchema);
