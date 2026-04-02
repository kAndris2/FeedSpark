export interface IYoutubeVideoData {
    title: string;
    description: string;
    url: string;
    thumbnail: IYoutubeEncodedImage;
    publishedDate: Date;
}

export interface IYoutubeChannelData {
    name: string;
    url: string;
    avatar: IYoutubeEncodedImage;
    banner: IYoutubeEncodedImage;
    videos: IYoutubeVideoData[];
}

export interface IYoutubeEncodedImage {
    bytes: string;
    contentType: string | null;
}