
import { connectToDatabase } from "@/lib/db";
import Genre from "@/models/Genre";
import Story from "@/models/Story";
import User from "@/models/User";
import { cache } from "react";

export const fetchHomeData = cache(async function () {
    try {
        await connectToDatabase();

        const [genres, totalStories, completed, users, newStories] = await Promise.all([
            Genre.find({}).sort({ name: 1 }).lean(),
            Story.countDocuments(),
            Story.countDocuments({ status: "completed" }),
            User.countDocuments({ role: "user" }),
            Story.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            }),
        ]);

        // Serialize pure object for Server Components
        const plainGenres = genres.map((g: any) => ({
            _id: g._id.toString(),
            name: g.name,
            slug: g.slug
        }));

        return {
            genres: plainGenres,
            stats: {
                totalStories,
                completed,
                users,
                newStories,
            },
        };
    } catch (error) {
        console.error("Error fetching home data:", error);
        return {
            genres: [],
            stats: {
                totalStories: 0,
                completed: 0,
                users: 0,
                newStories: 0,
            },
        };
    }
})

export const fetchGenres = cache(async function () {
    try {
        await connectToDatabase();
        const genres = await Genre.find({}).sort({ name: 1 }).lean();
        return genres.map((g: any) => ({
            _id: g._id.toString(),
            name: g.name,
            slug: g.slug
        }));
    } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
})

import Chapter from "@/models/Chapter";

import { auth } from "@/auth";
import Interaction from "@/models/Interaction";

export const getStoryDetail = cache(async function (slug: string) {
    try {
        await connectToDatabase();

        // 1. Find Story
        const story = await Story.findOne({ slug }).lean();
        if (!story) return null;

        // 2. Count Real Chapters
        const totalChapters = await Chapter.countDocuments({ storyId: story._id });

        // 3. Find Chapters (for listing)
        const chapters = await Chapter.find({ storyId: story._id })
            .sort({ order: -1 })
            .lean();

        // 4. User Interaction Status
        const session = await auth();
        let userStatus = {
            isFollowed: false,
            userRating: 0
        };

        if (session?.user?.id) {
            const interaction = await Interaction.findOne({
                userId: session.user.id,
                storyId: story._id
            }).lean();

            if (interaction) {
                userStatus.isFollowed = interaction.isFollowed;
                userStatus.userRating = interaction.rating;
            }
        }

        // 5. Serialize Data
        const serializedStory = {
            ...story,
            _id: story._id.toString(),
            id: story._id.toString(),
            createdAt: new Date(story.createdAt || Date.now()).toISOString(),
            updatedAt: new Date(story.updatedAt || Date.now()).toISOString(),
            viewCount: story.viewCount || 0,
            ratingAvg: story.ratingAvg || 0,
            totalRatings: story.totalRatings || 0,
            totalComments: story.totalComments || 0,
            stats: {
                ...story.stats,
                totalChapters: totalChapters // Override with real count
            }
        };

        const serializedChapters = chapters.map((c: any) => ({
            id: c._id.toString(),
            storyId: c.storyId.toString(),
            title: c.title,
            displayTitle: c.title,
            chapterNumber: c.order,
            releaseDate: new Date(c.createdAt || Date.now()).toISOString(),
            slug: c._id.toString()
        }));

        return {
            story: serializedStory,
            chapters: serializedChapters,
            userStatus
        };
    } catch (error) {
        console.error("Error fetching story detail:", error);
        return null;
    }
})

export const getRelatedStories = cache(async function (genres: string[], currentStoryId: string, limit = 5) {
    try {
        await connectToDatabase();
        if (!genres.length) return [];

        const stories = await Story.find({
            genres: { $in: genres },
            _id: { $ne: currentStoryId }
        })
            .limit(limit)
            .lean();

        return stories.map((s: any) => ({
            ...s,
            id: s._id.toString(),
            _id: s._id.toString(),
            createdAt: new Date(s.createdAt || Date.now()).toISOString(),
            updatedAt: new Date(s.updatedAt || Date.now()).toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching related stories:", error);
        return [];
    }
})

export const getChapterContent = cache(async function (chapterId: string) {
    try {
        await connectToDatabase();

        // 1. Find Chapter
        const chapter = await Chapter.findById(chapterId).lean();
        if (!chapter) return null;

        // 2. Find Story
        const story = await Story.findById(chapter.storyId).lean();
        if (!story) return null;

        // 3. Find All Chapters (for navigation navigation)
        // We need them sorted by order DESC (or ASC depending on preference, usually DESC for list, but logically we need to know next/prev based on order)
        // Let's fetch all sorted DESC (Newest first)
        const allChapters = await Chapter.find({ storyId: story._id })
            .select("title order _id createdAt")
            .sort({ order: -1 })
            .lean();

        // Serialize
        const serializedChapter = {
            id: chapter._id.toString(),
            _id: chapter._id.toString(),
            title: chapter.title,
            content: chapter.content || [],
            order: chapter.order,
            storyId: chapter.storyId.toString(),
            createdAt: new Date(chapter.createdAt || Date.now()).toISOString(),
        };

        const serializedStory = {
            id: story._id.toString(),
            _id: story._id.toString(),
            title: story.title,
            slug: story.slug,
            coverImage: story.coverImage,
        };

        const serializedAllChapters = allChapters.map((c: any) => ({
            id: c._id.toString(),
            _id: c._id.toString(),
            title: c.title,
            order: c.order,
            slug: c._id.toString()
        }));

        return {
            chapter: serializedChapter,
            story: serializedStory,
            chapters: serializedAllChapters
        };

    } catch (error) {
        console.error("Error fetching chapter content:", error);
        return null;
    }
})

export const getRanking = cache(async function (type: 'views' | 'rating' | 'follows', limit = 10) {
    try {
        await connectToDatabase();

        let sortQuery = {};
        switch (type) {
            case 'views':
                sortQuery = { viewCount: -1 };
                break;
            case 'rating':
                sortQuery = { ratingAvg: -1, totalRatings: -1 };
                break;
            case 'follows':
                sortQuery = { "stats.followers": -1 };
                break;
            default:
                sortQuery = { viewCount: -1 };
        }

        const stories = await Story.find({})
            .sort(sortQuery)
            .limit(limit)
            .lean();

        return stories.map((s: any) => ({
            id: s._id.toString(),
            title: s.title,
            slug: s.slug,
            coverImage: s.coverImage,
            viewCount: s.viewCount || s.stats?.views || 0,
            ratingAvg: s.ratingAvg || s.stats?.rating || 0,
            followers: s.stats?.followers || 0,
            totalRatings: s.totalRatings || 0
        }));
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return [];
    }
})
