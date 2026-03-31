export interface IYoutubeVideoData {
    title: string;
    url: string;
    thumbnailUrl: string;
    publishedDate: Date;
    author: IYoutubeChannelData;
}

interface IYoutubeChannelData {
    name: string;
    url: string;
}