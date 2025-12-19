
export interface VideoResult {
  id: string;
  title: string;
  description: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  subscriberCount: number | null;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string; 
}

export interface ChannelInfo {
  id: string;
  title: string;
  customUrl: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
  avgUploadInterval: string;
  latestUploadInterval: string;
  firstUploadDate: string;
}

export type SortOption = 'views' | 'likes' | 'date' | 'score';
export type RegionOption = 'ALL' | 'KR' | 'Global';
