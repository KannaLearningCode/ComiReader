import mongoose, { Schema, Model } from "mongoose";

export interface IChapter {
    _id: string;
    storyId: mongoose.Schema.Types.ObjectId;
    title: string;
    content: string[];
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const ChapterSchema: Schema<IChapter> = new Schema(
    {
        storyId: { type: Schema.Types.ObjectId, ref: 'Story', required: true, index: true },
        title: { type: String, required: true },
        content: { type: [String], default: [] }, // Array of image URLs
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const Chapter: Model<IChapter> = mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);

export default Chapter;
