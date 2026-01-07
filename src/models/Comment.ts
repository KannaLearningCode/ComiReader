import mongoose, { Schema, Model, Document } from "mongoose";

export interface IComment extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    storyId: mongoose.Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        storyId: { type: Schema.Types.ObjectId, ref: "Story", required: true },
        content: { type: String, required: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only createdAt needed usually
    }
);

// Index for faster queries on story comments
CommentSchema.index({ storyId: 1, createdAt: -1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
