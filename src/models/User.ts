
import mongoose, { Schema, Model } from "mongoose";

// Interface for User
export interface IUser {
    name?: string;
    email: string;
    password?: string;
    image?: string;
    role: 'user' | 'admin';
    provider?: string;
    emailVerified?: Date;
    bio?: string;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional because OAuth users won't have it
        image: { type: String },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        provider: { type: String, default: 'credentials' },
        emailVerified: { type: Date },
        bio: { type: String }
    },
    {
        timestamps: true,
    }
);

// Prevent overwrite model error in hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
