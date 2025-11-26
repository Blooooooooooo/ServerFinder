import mongoose, { Model, Schema } from 'mongoose';

export interface ISearch {
    search_term: string;
    search_count: number;
    last_searched_at: Date;
}

export interface IWeeklySearch {
    search_term: string;
    search_count: number;
    week_start: string;
}

const searchSchema = new Schema<ISearch>({
    search_term: { type: String, required: true, unique: true },
    search_count: { type: Number, default: 1 },
    last_searched_at: { type: Date, default: Date.now }
});

const weeklySearchSchema = new Schema<IWeeklySearch>({
    search_term: { type: String, required: true },
    search_count: { type: Number, default: 1 },
    week_start: { type: String, required: true }
});

weeklySearchSchema.index({ search_term: 1, week_start: 1 }, { unique: true });

const Search: Model<ISearch> = mongoose.models.Search || mongoose.model<ISearch>('Search', searchSchema);
const WeeklySearch: Model<IWeeklySearch> = mongoose.models.WeeklySearch || mongoose.model<IWeeklySearch>('WeeklySearch', weeklySearchSchema);

export { Search, WeeklySearch };
