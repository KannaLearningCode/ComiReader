// Định nghĩa các trạng thái cố định để tránh sai sót khi gõ chữ (typo)
export type StoryStatus = 'ongoing' | 'completed' | 'on-hold' | 'dropped';
export type Demographic = 'Shounen' | 'Shoujo' | 'Seinen' | 'Josei' | 'Unknown';

export interface IChapter {
  id: string;
  storyId: string; // Quan trọng: Để biết chương này thuộc truyện nào
  title: string;
  chapterNumber: number; // Ví dụ: 10, 11, 12.5 (dùng để sắp xếp)
  displayTitle: string;  // Ví dụ: "Chương 10: Hồi kết" (dùng để hiển thị)
  releaseDate: Date | string;
  slug: string;
  // content: string[]; // Nếu là manga (mảng link ảnh), hoặc string nếu là novel
}

export interface IChapterContent {
  id: string;
  storySlug: string;
  chapterNumber: number;
  title: string;
  images: string[];
  nextChapterId: string | null;
  prevChapterId: string | null;
}

export interface IStory {
  _id?: string; // MongoDB ID
  id: string; // Custom string ID (e.g. "s1") or mapped from _id
  title: string;
  slug: string;
  description: string;
  otherNames: string[];
  authors?: string[];

  status: StoryStatus;   // Sử dụng Type đã định nghĩa ở trên
  demographic: Demographic;

  genres: string[];
  tags: string[];

  // Interaction Stats
  viewCount: number;
  ratingAvg: number;
  totalRatings: number;
  totalComments: number;

  stats: {              // Deprecated: Migrating to top-level fields
    followers: number;
    rating: number;
    views: number;
    totalChapters: number;
  };

  coverImage: string;
  bannerImage: string;

  createdAt: Date | string;
  updatedAt: Date | string;

  chapters?: IChapter[]; // Danh sách chương (có thể không có khi xem ở trang danh sách)
}