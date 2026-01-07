export type UserRole = 'user' | 'moderator' | 'admin';


export interface IUser {
  id: string;
  username: string;
  email: string;
  name?: string; // Tên hiển thị (DisplayName cũ)
  avatar?: string;
  role: UserRole;
  bio?: string;

  // Quan hệ dữ liệu (Relationships) - Optional for mock
  followedStories?: string[];
  readingHistory?: {
    storyId: string;
    chapterId: string;
    lastReadAt: Date | string;
  }[];

  // Trạng thái hệ thống
  isVerified?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
