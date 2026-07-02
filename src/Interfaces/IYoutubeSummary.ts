export interface IYoutubeSummary {
    channels: IYoutubeChannelData[];
    periodStartStr: string;
    periodEndStr: string;
    topic: string;
}

export interface IYoutubeVideoData {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    views: string;
    publishedDateStr: string;
    rating?: number;
}

export interface IYoutubeChannelData {
    name: string;
    url: string;
    avatarUrl: string;
    bannerUrl: string;
    videos: IYoutubeVideoData[];
}

export interface IYoutubeChannelImageData {
    channelId: string;
    avatarUrl: string;
    bannerUrl: string;
}

export interface IYoutubeVideoStatistics {
    videoId: string;
    likeCount: number;
    viewCount: number;
    commentCount: number;
}