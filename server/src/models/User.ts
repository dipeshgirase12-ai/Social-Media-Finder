import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import type { PublicUser } from '../types';

export interface UserDocument extends mongoose.Document {
  email: string;
  passwordHash: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
  toPublicUser(): PublicUser;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true, maxlength: 100 },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublicUser = function (): PublicUser {
  return {
    id: String(this._id),
    email: this.email,
    name: this.name,
    role: this.role,
    createdAt: this.createdAt?.toISOString?.(),
  };
};

/** Hash helper with cost from env-independent constant. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export const User = mongoose.model<UserDocument>('User', userSchema);

/** Determine initial role from the configured admin email allowlist. */
export function initialRoleFor(email: string): 'user' | 'admin' {
  return env.adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
}
