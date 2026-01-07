
import { IStory } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getStories(options?: { sort?: string }): Promise<IStory[]> {
    try {
        const queryParams = new URLSearchParams();
        if (options?.sort) {
            queryParams.append('sort', options.sort);
        }

        const res = await fetch(`${API_URL}/stories?${queryParams.toString()}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch stories');
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching stories:", error);
        return [];
    }
}

export async function getStoryBySlug(slug: string): Promise<IStory | null> {
    try {
        const res = await fetch(`${API_URL}/stories/${slug}`, {
            cache: 'no-store'
        });

        if (res.status === 404) return null;

        if (!res.ok) {
            throw new Error('Failed to fetch story');
        }

        return res.json();
    } catch (error) {
        console.error(`Error fetching story ${slug}:`, error);
        return null;
    }
}
