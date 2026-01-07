import mongoose, { Schema, Model, Document } from "mongoose";

export interface IInteraction extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    storyId: mongoose.Schema.Types.ObjectId;
    isFollowed: boolean;
    rating: number; // 0 means not rated
    createdAt: Date;
    updatedAt: Date;
}

const InteractionSchema: Schema<IInteraction> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
        isFollowed: { type: Boolean, default: false },
        rating: { type: Number, default: 0, min: 0, max: 5 },
    },
    {
        timestamps: true,
    }
);

// Ensure a user has only one interaction record per story
InteractionSchema.index({ userId: 1, storyId: 1 }, { unique: true });

const Interaction: Model<IInteraction> = mongoose.models.Interaction || mongoose.model<IInteraction>("Interaction", InteractionSchema);

export default Interaction;
