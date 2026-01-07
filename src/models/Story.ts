
import mongoose, { Schema, Model } from "mongoose";
import { IStory } from "@/types";
export type { IStory };

// Schema Definitions corresponding to IStory interface
const StorySchema: Schema<IStory> = new Schema(
    {
        // id field is automatically handled by _id, but we map it if needed or use a virtual.
        // However, keeping 'id' as a string field might be useful if we want custom IDs, 
        // but usually _id is enough. The interface has 'id'. 
        // We will use a virtual 'id' to map _id to string when transforming to JSON if needed,
        // or store a custom ID if specific string IDs are used in mock (e.g., "s1").
        // Given the seed logic will likely use the mock IDs, let's allow a custom String id for now 
        // to preserve current URL structure which relies on slug mostly anyway, but ID might be used.
        id: { type: String, required: true, unique: true },

        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String, required: false },
        otherNames: { type: [String], default: [] },
        authors: { type: [String], default: [] },

        status: {
            type: String,
            enum: ['ongoing', 'completed'],
            default: 'ongoing'
        },
        demographic: {
            type: String,
            enum: ['Shounen', 'Shoujo', 'Seinen', 'Josei', 'Unknown'],
            default: 'Unknown'
        },

        genres: { type: [String], default: [] },
        tags: { type: [String], default: [] },

        // Interaction Stats
        viewCount: { type: Number, default: 0 },
        ratingAvg: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },

        stats: {
            followers: { type: Number, default: 0 },
            rating: { type: Number, default: 0 },
            views: { type: Number, default: 0 }, // Deprecated in favor of viewCount
            totalChapters: { type: Number, default: 0 }
        },

        coverImage: { type: String, required: true },
        bannerImage: { type: String, default: "" },

        // chapters field: In Mongoose, usually this would be a virtual or a separate collection.
        // But per user request/interface, let's define it as Mixed or Array if stored embedded.
        // Or we just don't store it in the Story document if chapters are huge. 
        // However, the prompt asked for "chapters (array object)". 
        // The interface has `chapters?: IChapter[]`.
        // Let's store basic chapter info embedded or just leave it empty and populate separately.
        // For now, let's define it as an array to match the request "chapters (array object)".
        chapters: { type: [Schema.Types.Mixed], default: [] }
    },
    {
        timestamps: true, // adds createdAt, updatedAt
        minimize: false // ensures empty objects are saved
    }
);

// Prevent overwrite model error in hot reload
const Story: Model<IStory> = mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);

export default Story;
