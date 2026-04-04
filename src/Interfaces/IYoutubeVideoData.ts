export interface IYoutubeVideoData {
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    publishedDate: Date;
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