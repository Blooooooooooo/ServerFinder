import mongoose from 'mongoose';

// Enhanced search analytics schema
const searchAnalyticsSchema = new mongoose.Schema({
    search_term: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    results_count: { type: Number, default: 0 },
    clicked_server_id: { type: String }, // Track which server was clicked
    user_id: { type: String }, // Optional: track user
    session_id: { type: String } // Track unique sessions
});

// Indexes for efficient querying
searchAnalyticsSchema.index({ search_term: 1, timestamp: -1 });
searchAnalyticsSchema.index({ timestamp: -1 });
searchAnalyticsSchema.index({ clicked_server_id: 1 });

export default mongoose.models.SearchAnalytics || mongoose.model('SearchAnalytics', searchAnalyticsSchema);
