import mongoose from 'mongoose';

const UserStatsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    first_login: {
        type: Date,
        default: Date.now
    },
    last_active: {
        type: Date,
        default: Date.now
    },
    total_views: {
        type: Number,
        default: 0
    },
    total_searches: {
        type: Number,
        default: 0
    }
});

// Prevent duplicate document error on model recompilation
export default mongoose.models.UserStats || mongoose.model('UserStats', UserStatsSchema);
