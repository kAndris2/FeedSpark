export interface IYoutubeVideoData {
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    publishedDate: Date;
    author: IYoutubeChannelData;
}

interface IYoutubeChannelData {
    name: string;
    url: string;
    avatarUrl: string;
    bannerUrl: string;
}

export interface IYoutubeChannelImageData {
    channelId: string;
    avatarUrl: string;
    bannerUrl: string;
}