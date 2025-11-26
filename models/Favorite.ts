import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
    user_id: string;
    server_id: string;
    added_at: Date;
}

const FavoriteSchema: Schema = new Schema({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    server_id: {
        type: String,
        required: true,
        index: true
    },
    added_at: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate favorites and improve query performance
FavoriteSchema.index({ user_id: 1, server_id: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
