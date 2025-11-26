import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    show_activity: {
        type: Boolean,
        default: true
    },
    show_favorites: {
        type: Boolean,
        default: true
    },
    profile_public: {
        type: Boolean,
        default: true
    }
});

// Prevent duplicate document error on model recompilation
export default mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
