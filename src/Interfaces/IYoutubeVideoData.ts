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
    avatar: IYoutubeChannelEncodedImage;
    banner: IYoutubeChannelEncodedImage;
    videos: IYoutubeVideoData[];
}

export interface IYoutubeChannelEncodedImage {
    bytes: string;
    contentType: string | null;
}