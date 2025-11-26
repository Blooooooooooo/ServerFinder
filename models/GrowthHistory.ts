import mongoose, { Schema, Document } from 'mongoose';

export interface IGrowthHistory extends Document {
    server_id: string;
    member_count: number;
    recorded_at: Date;
}

const growthHistorySchema = new Schema<IGrowthHistory>({
    server_id: { type: String, required: true, ref: 'Server' },
    member_count: { type: Number, required: true },
    recorded_at: { type: Date, default: Date.now }
});

export default mongoose.models.ServerGrowthHistory || mongoose.model<IGrowthHistory>('ServerGrowthHistory', growthHistorySchema);
