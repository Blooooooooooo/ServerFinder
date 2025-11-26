import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
    discord_id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: { type: String },
    added_by: { type: String, required: true },
    added_at: { type: Date, default: Date.now }
});

export default mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
