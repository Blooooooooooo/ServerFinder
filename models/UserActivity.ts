import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    server_id: {
        type: String,
        required: true
    },
    activity_type: {
        type: String,
        enum: ['view', 'search'],
        default: 'view'
    },
    viewed_at: {
        type: Date,
        default: Date.now
    }
});

// Index for querying recent activity
UserActivitySchema.index({ user_id: 1, viewed_at: -1 });

// Prevent duplicate document error on model recompilation
export default mongoose.models.UserActivity || mongoose.model('UserActivity', UserActivitySchema);
