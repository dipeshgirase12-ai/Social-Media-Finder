import mongoose, { Schema } from 'mongoose';

export interface SavedProfileDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  platform: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  confidence?: number;
  createdAt?: Date;
}

const savedProfileSchema = new Schema<SavedProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, required: true, index: true },
    username: { type: String, required: true, index: true },
    displayName: String,
    avatarUrl: String,
    profileUrl: { type: String, required: true },
    bio: String,
    confidence: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedProfileSchema.index({ userId: 1, platform: 1, username: 1 }, { unique: true });

export const SavedProfile = mongoose.model<SavedProfileDocument>('SavedProfile', savedProfileSchema);
