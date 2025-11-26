import mongoose, { Model, Schema } from 'mongoose';

export interface IServer {
    _id: string;
    name: string;
    link: string;
    letter_category?: string;
    guild_id?: string;
    approved_by?: string;
    approved_at?: Date;
    created_at?: Date;
    initial_member_count?: number;
    current_member_count?: number;
    online_member_count?: number;
    tracking_since?: Date;
    icon_url?: string;
    banner_url?: string;
    description?: string;
    is_partner?: boolean;
}

const serverSchema = new Schema<IServer>({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    link: { type: String, required: true },
    letter_category: { type: String },
    guild_id: { type: String },
    approved_by: { type: String },
    approved_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    initial_member_count: { type: Number },
    current_member_count: { type: Number },
    online_member_count: { type: Number },
    tracking_since: { type: Date },
    icon_url: { type: String },
    banner_url: { type: String },
    description: { type: String },
    is_partner: { type: Boolean, default: false }
}, {
    _id: false,
    timestamps: false
});

const Server: Model<IServer> = mongoose.models.Server || mongoose.model<IServer>('Server', serverSchema);

export default Server;
