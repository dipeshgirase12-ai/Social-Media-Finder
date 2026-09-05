import mongoose, { Schema } from 'mongoose';

export interface ProfileSummary {
  platform: string;
  username?: string;
  displayName?: string;
  profileUrl: string;
  confidence?: number;
  confidenceLabel?: string;
}

export interface PlatformStateRecord {
  platform: string;
  status: string;
  note?: string;
  profileCount?: number;
}

export interface SearchDocument extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  query: string;
  queryType: string;
  profiles: ProfileSummary[];
  repositoryCount: number;
  websiteCount: number;
  packageCount: number;
  platformStates: PlatformStateRecord[];
  durationMs: number;
  createdAt: Date;
}

const searchSchema = new Schema<SearchDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    query: { type: String, required: true, index: true },
    queryType: { type: String, required: true },
    profiles: {
      type: [{
        platform: String,
        username: String,
        displayName: String,
        profileUrl: String,
        confidence: Number,
        confidenceLabel: String,
      }],
      default: [],
    },
    repositoryCount: { type: Number, default: 0 },
    websiteCount: { type: Number, default: 0 },
    packageCount: { type: Number, default: 0 },
    platformStates: { type: [{ platform: String, status: String, note: String, profileCount: Number }], default: [] },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

searchSchema.index({ createdAt: -1 });
searchSchema.index({ query: 1, createdAt: -1 });

/** Persist a search record and return its id (empty string on failure). */
export async function saveSearch(data: {
  userId?: string;
  query: string;
  queryType: string;
  profiles: ProfileSummary[];
  repositoryCount: number;
  websiteCount: number;
  packageCount: number;
  platformStates: PlatformStateRecord[];
  durationMs: number;
}): Promise<string> {
  const doc = await Search.create({
    ...(data.userId ? { userId: new mongoose.Types.ObjectId(data.userId) } : {}),
    query: data.query,
    queryType: data.queryType,
    profiles: data.profiles,
    repositoryCount: data.repositoryCount,
    websiteCount: data.websiteCount,
    packageCount: data.packageCount,
    platformStates: data.platformStates,
    durationMs: data.durationMs,
  });
  return String(doc._id);
}

export const Search = mongoose.model<SearchDocument>('Search', searchSchema);
